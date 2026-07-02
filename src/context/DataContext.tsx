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
import type {
  Bill,
  BillLine,
  Preferences,
  Product,
  Sale,
  SaleItem,
  StoreProfile,
} from '../lib/types'

type DataValue = {
  store: StoreProfile | null
  products: Product[]
  sales: Sale[]
  bills: Bill[]
  loading: boolean
  onboarded: boolean
  // mutations
  seedStore: (
    profile: Omit<StoreProfile, 'onboarded' | 'createdAt'>,
    selected: Omit<Product, 'id'>[],
  ) => Promise<void>
  updateStore: (patch: Partial<StoreProfile>) => Promise<void>
  updatePreferences: (prefs: Preferences) => Promise<void>
  setProductStock: (id: string, stock: number) => Promise<void>
  addSale: (items: SaleItem[], customer?: string) => Promise<void>
  applyBill: (
    supplier: string,
    lines: (BillLine & { productId?: string; category?: string })[],
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
  const [loading, setLoading] = useState(true)

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

  const value = useMemo<DataValue>(
    () => ({
      store,
      products,
      sales,
      bills,
      loading,
      onboarded: Boolean(store?.onboarded),
      seedStore: (profile, selected) => dbApi.seedStore(uid!, profile, selected),
      updateStore: (patch) => dbApi.updateStore(uid!, patch),
      updatePreferences: (prefs) => dbApi.updatePreferences(uid!, prefs),
      setProductStock: (id, stock) => dbApi.setProductStock(uid!, id, stock),
      addSale: (items, customer) => dbApi.addSale(uid!, items, customer),
      applyBill: (supplier, lines) => dbApi.applyBill(uid!, supplier, lines),
      saveSnapshot: () => dbApi.saveSnapshot(uid!, products),
    }),
    [store, products, sales, bills, loading, uid],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
