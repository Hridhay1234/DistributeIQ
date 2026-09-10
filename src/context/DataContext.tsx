import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import * as dbApi from '../lib/db'
import { CATALOG } from '../data/catalog'
import type {
  Bill,
  BillLine,
  CatalogItem,
  ItemDiscount,
  Preferences,
  Product,
  Sale,
  SaleInput,
  StoreProfile,
} from '../lib/types'

// Offline fallback catalogue (used until the Firestore catalogue subscription
// resolves / seeds). Stable ids derived from the name.
const FALLBACK_CATALOG: CatalogItem[] = CATALOG.map((c) => ({
  ...c,
  id:
    'seed-' +
    c.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
}))

type DataValue = {
  store: StoreProfile | null
  products: Product[]
  sales: Sale[]
  bills: Bill[]
  catalog: CatalogItem[]
  loading: boolean
  onboarded: boolean
  // mutations
  createStore: (
    profile: Omit<StoreProfile, 'onboarded' | 'createdAt' | 'tourCompleted'>,
  ) => Promise<void>
  updateStore: (patch: Partial<StoreProfile>) => Promise<void>
  updatePreferences: (prefs: Preferences) => Promise<void>
  setItemDiscount: (key: string, disc: ItemDiscount | null) => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>
  updateProduct: (
    id: string,
    patch: Partial<Omit<Product, 'id' | 'stock'>>,
  ) => Promise<void>
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => Promise<string>
  setProductStock: (id: string, stock: number) => Promise<void>
  addSale: (input: SaleInput) => Promise<void>
  applyBill: (
    supplier: string,
    lines: (BillLine & {
      price: number
      productId?: string
      category?: string
    })[],
  ) => Promise<void>
  saveSnapshot: () => Promise<void>
}

const DataContext = createContext<DataValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [store, setStore] = useState<StoreProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [fsCatalog, setFsCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  // Global catalogue: subscribe + seed once if empty (independent of store).
  useEffect(() => {
    if (!uid) return
    const unsub = dbApi.subscribeCatalog(setFsCatalog)
    dbApi.seedCatalogIfEmpty().catch(() => {})
    return () => unsub()
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setStore(null)
      setProducts([])
      setSales([])
      setBills([])
      setLoading(false)
      return
    }
    setLoading(true)
    let got = 0
    const done = () => {
      got += 1
      if (got >= 4) setLoading(false)
    }
    const unsubs = [
      dbApi.subscribeStore(uid, (s) => {
        setStore(s)
        done()
      }),
      dbApi.subscribeProducts(uid, (p) => {
        setProducts(p)
        done()
      }),
      dbApi.subscribeSales(uid, (s) => {
        setSales(s)
        done()
      }),
      dbApi.subscribeBills(uid, (b) => {
        setBills(b)
        done()
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [uid])

  const catalog = fsCatalog.length ? fsCatalog : FALLBACK_CATALOG

  const value = useMemo<DataValue>(
    () => ({
      store,
      products,
      sales,
      bills,
      catalog,
      loading,
      onboarded: Boolean(store?.onboarded),
      createStore: (profile) => dbApi.createStore(uid!, profile),
      updateStore: (patch) => dbApi.updateStore(uid!, patch),
      updatePreferences: (prefs) => dbApi.updatePreferences(uid!, prefs),
      setItemDiscount: (key, disc) => dbApi.setItemDiscount(uid!, key, disc),
      addProduct: (product) => dbApi.addProduct(uid!, product),
      updateProduct: (id, patch) => dbApi.updateProduct(uid!, id, patch),
      addCatalogItem: (item) => dbApi.addCatalogItem(item),
      setProductStock: (id, stock) => dbApi.setProductStock(uid!, id, stock),
      addSale: (input) => dbApi.addSale(uid!, input),
      applyBill: (supplier, lines) => dbApi.applyBill(uid!, supplier, lines),
      saveSnapshot: () => dbApi.saveSnapshot(uid!, products),
    }),
    [store, products, sales, bills, catalog, loading, uid],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
