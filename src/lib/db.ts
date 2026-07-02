import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  Bill,
  BillLine,
  Preferences,
  Product,
  Sale,
  SaleItem,
  StoreProfile,
} from './types'

const DAY = 86_400_000

/* ---------------- refs ---------------- */
const storeRef = (uid: string) => doc(db, 'stores', uid)
const productsCol = (uid: string) => collection(db, 'stores', uid, 'products')
const salesCol = (uid: string) => collection(db, 'stores', uid, 'sales')
const billsCol = (uid: string) => collection(db, 'stores', uid, 'bills')
const snapshotsCol = (uid: string) => collection(db, 'stores', uid, 'snapshots')

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

/* ---------------- sales ---------------- */
export function subscribeSales(
  uid: string,
  cb: (sales: Sale[]) => void,
): Unsubscribe {
  return onSnapshot(query(salesCol(uid), orderBy('date', 'desc')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sale, 'id'>) }))),
  )
}

/**
 * Record a sales log AND decrement the sold units from product stock,
 * atomically via a batch.
 */
export async function addSale(
  uid: string,
  items: SaleItem[],
  customer?: string,
): Promise<void> {
  const totalUnits = items.reduce((s, i) => s + i.qty, 0)
  const totalValue = items.reduce((s, i) => s + i.qty * i.price, 0)

  const batch = writeBatch(db)
  const saleDoc = doc(salesCol(uid))
  batch.set(saleDoc, {
    date: Date.now(),
    items,
    totalUnits,
    totalValue,
    ...(customer ? { customer } : {}),
  })

  // decrement stock for known products
  const stockSnap = await getDocs(productsCol(uid))
  const stockMap = new Map(
    stockSnap.docs.map((d) => [d.id, (d.data() as Product).stock ?? 0]),
  )
  for (const it of items) {
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
  lines: (BillLine & { productId?: string; category?: string })[],
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
      batch.update(doc(productsCol(uid), l.productId), { stock: next })
    } else {
      // unmatched line → create a new product with sensible defaults
      const ref = doc(productsCol(uid))
      batch.set(ref, {
        name: l.name,
        brand: '—',
        emoji: l.emoji || '📦',
        category: l.category || 'Staples',
        price: Math.round(l.cost * 1.18),
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

/* ---------------- onboarding / seeding ---------------- */

/**
 * Create the store profile, seed selected starter products, and generate
 * ~10 days of sample sales + a couple of bills so the dashboard isn't empty.
 */
export async function seedStore(
  uid: string,
  profile: Omit<StoreProfile, 'onboarded' | 'createdAt'>,
  selected: Omit<Product, 'id'>[],
): Promise<void> {
  const batch = writeBatch(db)

  batch.set(storeRef(uid), {
    ...profile,
    onboarded: true,
    createdAt: Date.now(),
    preferences: {
      lowStockAlerts: true,
      dailySummary: true,
      autoMatch: true,
      hindiUi: false,
    },
  } satisfies StoreProfile)

  // seed products (capture their generated ids for sample sales)
  const seeded: ({ id: string } & Omit<Product, 'id'>)[] = selected.map((p) => {
    const ref = doc(productsCol(uid))
    batch.set(ref, p)
    return { id: ref.id, ...p }
  })

  // sample sales for the last 10 days
  if (seeded.length) {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    for (let d = 9; d >= 0; d--) {
      const ts = today.getTime() - d * DAY
      const weekend = [0, 6].includes(new Date(ts).getDay())
      const lineCount = 3 + Math.floor(Math.random() * 4)
      const picks = [...seeded]
        .sort(() => Math.random() - 0.5)
        .slice(0, lineCount)
      const items: SaleItem[] = picks.map((p) => ({
        productId: p.id,
        name: p.name,
        emoji: p.emoji,
        category: p.category,
        qty:
          1 +
          Math.floor(Math.random() * (weekend ? 16 : 9)) +
          (p.price < 30 ? 4 : 0),
        price: p.price,
      }))
      const totalUnits = items.reduce((s, i) => s + i.qty, 0)
      const totalValue = items.reduce((s, i) => s + i.qty * i.price, 0)
      const saleDoc = doc(salesCol(uid))
      batch.set(saleDoc, {
        date: ts,
        items,
        totalUnits,
        totalValue,
        customer: SAMPLE_CUSTOMERS[d % SAMPLE_CUSTOMERS.length],
      })
    }

    // a couple of sample supplier bills
    for (let b = 0; b < 3; b++) {
      const picks = [...seeded]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
      const lines = picks.map((p) => ({
        name: p.name,
        emoji: p.emoji,
        qty: 12 + Math.floor(Math.random() * 24),
        cost: p.cost,
      }))
      const billDoc = doc(billsCol(uid))
      batch.set(billDoc, {
        supplier: SAMPLE_SUPPLIERS[b % SAMPLE_SUPPLIERS.length],
        date: today.getTime() - (b * 3 + 1) * DAY,
        lines,
        totalUnits: lines.reduce((s, l) => s + l.qty, 0),
        total: lines.reduce((s, l) => s + l.qty * l.cost, 0),
      })
    }
  }

  await batch.commit()
}

const SAMPLE_CUSTOMERS = [
  'Ramesh K.',
  'Sunita W.',
  'Imran S.',
  'James D.',
  'Meena R.',
  'Walk-in',
]
const SAMPLE_SUPPLIERS = [
  'Krishna Distributors',
  'Shree Traders',
  'Metro Wholesale',
]
