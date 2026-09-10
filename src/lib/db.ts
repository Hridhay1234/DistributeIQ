import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { CATALOG } from '../data/catalog'
import type {
  Bill,
  BillLine,
  CatalogItem,
  DiscountType,
  ItemDiscount,
  Preferences,
  Product,
  Sale,
  SaleInput,
  StoreProfile,
} from './types'

/* ---------------- refs ---------------- */
const storeRef = (uid: string) => doc(db, 'stores', uid)
const productsCol = (uid: string) => collection(db, 'stores', uid, 'products')
const salesCol = (uid: string) => collection(db, 'stores', uid, 'sales')
const billsCol = (uid: string) => collection(db, 'stores', uid, 'bills')
const snapshotsCol = (uid: string) => collection(db, 'stores', uid, 'snapshots')
const catalogCol = () => collection(db, 'catalog')

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/* ---------------- store profile ---------------- */
export async function getStore(uid: string): Promise<StoreProfile | null> {
  const snap = await getDoc(storeRef(uid))
  return snap.exists() ? (snap.data() as StoreProfile) : null
}

export function subscribeStore(
  uid: string,
  cb: (store: StoreProfile | null) => void,
): Unsubscribe {
  return onSnapshot(storeRef(uid), (snap) =>
    cb(snap.exists() ? (snap.data() as StoreProfile) : null),
  )
}

export async function updateStore(
  uid: string,
  patch: Partial<StoreProfile>,
): Promise<void> {
  await setDoc(storeRef(uid), patch, { merge: true })
}

export async function updatePreferences(
  uid: string,
  prefs: Preferences,
): Promise<void> {
  await updateDoc(storeRef(uid), { preferences: prefs })
}

/** Save (or clear) a remembered per-product discount default. */
export async function setItemDiscount(
  uid: string,
  key: string,
  disc: ItemDiscount | null,
): Promise<void> {
  await updateDoc(storeRef(uid), {
    [`itemDiscounts.${key}`]: disc ?? deleteField(),
  })
}

/* ---------------- products ---------------- */
export function subscribeProducts(
  uid: string,
  cb: (products: Product[]) => void,
): Unsubscribe {
  return onSnapshot(query(productsCol(uid), orderBy('name')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))),
  )
}

export async function setProductStock(
  uid: string,
  productId: string,
  stock: number,
): Promise<void> {
  await updateDoc(doc(productsCol(uid), productId), {
    stock: Math.max(0, Math.round(stock)),
  })
}

export async function addProduct(
  uid: string,
  product: Omit<Product, 'id'>,
): Promise<string> {
  const ref = await addDoc(productsCol(uid), product)
  return ref.id
}

/** Edit a product's own details — name, brand, category, unit, price, cost,
 * reorder threshold. Stock is intentionally excluded; it's changed via
 * `setProductStock` (the shelf-count stepper). */
export async function updateProduct(
  uid: string,
  productId: string,
  patch: Partial<Omit<Product, 'id' | 'stock'>>,
): Promise<void> {
  await updateDoc(doc(productsCol(uid), productId), patch)
}

/* ---------------- sales ---------------- */
export function subscribeSales(
  uid: string,
  cb: (sales: Sale[]) => void,
): Unsubscribe {
  return onSnapshot(query(salesCol(uid), orderBy('date', 'desc')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sale, 'id'>) }))),
  )
}

/** Resolve a discount input into a rupee amount, clamped to [0, subtotal]. */
export function resolveDiscount(
  subtotal: number,
  type?: DiscountType,
  value?: number,
): number {
  if (!type || !value || value <= 0) return 0
  const raw = type === 'percent' ? (subtotal * value) / 100 : value
  return Math.min(Math.max(0, Math.round(raw)), subtotal)
}

/**
 * Record a sales log with per-line discounts AND decrement the sold units
 * from product stock, atomically via a batch. Line discounts are resolved
 * here so totals are trustworthy regardless of client state.
 */
export async function addSale(
  uid: string,
  input: SaleInput,
): Promise<void> {
  const { customer } = input

  let subtotal = 0
  let discountAmount = 0
  let totalCost = 0
  let totalUnits = 0

  const items = input.items.map((it) => {
    const lineSub = it.qty * it.price
    const lineDisc = resolveDiscount(lineSub, it.discountType, it.discountValue)
    subtotal += lineSub
    discountAmount += lineDisc
    totalCost += it.qty * (it.cost ?? 0)
    totalUnits += it.qty
    return {
      ...it,
      discountAmount: lineDisc,
      // strip undefined discount fields so Firestore accepts the doc
      ...(it.discountType && lineDisc > 0
        ? { discountType: it.discountType, discountValue: it.discountValue ?? 0 }
        : { discountType: null, discountValue: null }),
    }
  })

  const totalValue = subtotal - discountAmount

  const batch = writeBatch(db)
  const saleDoc = doc(salesCol(uid))
  batch.set(saleDoc, {
    date: Date.now(),
    items,
    totalUnits,
    subtotal,
    totalCost,
    discountAmount,
    totalValue,
    ...(customer ? { customer } : {}),
  })

  // decrement stock for known products
  const stockSnap = await getDocs(productsCol(uid))
  const stockMap = new Map(
    stockSnap.docs.map((d) => [d.id, (d.data() as Product).stock ?? 0]),
  )
  for (const it of input.items) {
    if (stockMap.has(it.productId)) {
      const next = Math.max(0, (stockMap.get(it.productId) ?? 0) - it.qty)
      batch.update(doc(productsCol(uid), it.productId), { stock: next })
    }
  }
  await batch.commit()
}

/* ---------------- bills ---------------- */
export function subscribeBills(
  uid: string,
  cb: (bills: Bill[]) => void,
): Unsubscribe {
  return onSnapshot(query(billsCol(uid), orderBy('date', 'desc')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Bill, 'id'>) }))),
  )
}

/**
 * Apply a scanned bill: store the bill, increment stock for matched products,
 * and create new products for unmatched lines — all in one batch.
 */
export async function applyBill(
  uid: string,
  supplier: string,
  lines: (BillLine & { price: number; productId?: string; category?: string })[],
): Promise<void> {
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)
  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0)

  const stockSnap = await getDocs(productsCol(uid))
  const stockMap = new Map(
    stockSnap.docs.map((d) => [d.id, (d.data() as Product).stock ?? 0]),
  )

  const batch = writeBatch(db)
  const billDoc = doc(billsCol(uid))
  batch.set(billDoc, {
    supplier,
    date: Date.now(),
    lines: lines.map(({ name, emoji, qty, cost }) => ({
      name,
      emoji,
      qty,
      cost,
    })),
    totalUnits,
    total,
  })

  for (const l of lines) {
    if (l.productId && stockMap.has(l.productId)) {
      const next = (stockMap.get(l.productId) ?? 0) + l.qty
      batch.update(doc(productsCol(uid), l.productId), {
        stock: next,
        cost: l.cost,
        price: l.price,
      })
    } else {
      // unmatched line → create a new product, using the selling price the
      // shopkeeper entered during review
      const ref = doc(productsCol(uid))
      batch.set(ref, {
        name: l.name,
        brand: '—',
        emoji: l.emoji || '📦',
        category: l.category || 'Staples',
        price: l.price,
        cost: l.cost,
        stock: l.qty,
        lowStockAt: Math.max(5, Math.round(l.qty * 0.3)),
        unit: 'pc',
      } satisfies Omit<Product, 'id'>)
    }
  }
  await batch.commit()
}

/* ---------------- weekly snapshot ---------------- */
export async function saveSnapshot(
  uid: string,
  products: Product[],
): Promise<void> {
  await addDoc(snapshotsCol(uid), {
    date: Date.now(),
    skuCount: products.length,
    lowStock: products.filter((p) => p.stock <= p.lowStockAt).length,
    stockValue: products.reduce((s, p) => s + p.stock * p.cost, 0),
    counts: products.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
  })
}

/* ---------------- shared catalogue ---------------- */
export function subscribeCatalog(
  cb: (items: CatalogItem[]) => void,
): Unsubscribe {
  return onSnapshot(query(catalogCol(), orderBy('name')), (snap) =>
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CatalogItem, 'id'>),
      })),
    ),
  )
}

export async function addCatalogItem(
  item: Omit<CatalogItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(catalogCol(), item)
  return ref.id
}

/**
 * Seed the global catalogue from the bundled list — only if it's empty.
 * Uses slug doc-ids so repeated seeds are idempotent (no duplicates).
 */
export async function seedCatalogIfEmpty(): Promise<void> {
  const existing = await getDocs(query(catalogCol(), limit(1)))
  if (!existing.empty) return
  const batch = writeBatch(db)
  for (const item of CATALOG) {
    batch.set(doc(catalogCol(), slugify(item.name)), item)
  }
  await batch.commit()
}

/* ---------------- onboarding ---------------- */

/**
 * Create the store profile only. No sample products, sales, or bills are
 * written — the store starts empty and the owner fills it via bill scans,
 * manual product adds, and daily sales logs.
 */
export async function createStore(
  uid: string,
  profile: Omit<StoreProfile, 'onboarded' | 'createdAt' | 'tourCompleted'>,
): Promise<void> {
  await setDoc(storeRef(uid), {
    ...profile,
    onboarded: true,
    tourCompleted: false,
    createdAt: Date.now(),
    preferences: {
      lowStockAlerts: true,
      dailySummary: true,
      autoMatch: true,
      hindiUi: false,
    },
  } satisfies StoreProfile)
}
