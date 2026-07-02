export type Product = {
  id: string
  name: string
  brand: string
  emoji: string
  category: string
  price: number // selling price per unit (₹)
  cost: number // buy price per unit (₹)
  stock: number
  lowStockAt: number
  unit: string
}

export type SaleItem = {
  productId: string
  name: string
  emoji: string
  category: string
  qty: number
  price: number
}

export type Sale = {
  id: string
  date: number // epoch ms
  items: SaleItem[]
  totalUnits: number
  totalValue: number
  customer?: string
}

export type BillLine = {
  name: string
  emoji: string
  qty: number
  cost: number
}

export type Bill = {
  id: string
  supplier: string
  date: number // epoch ms
  lines: BillLine[]
  totalUnits: number
  total: number
}

export type Preferences = {
  lowStockAlerts: boolean
  dailySummary: boolean
  autoMatch: boolean
  hindiUi: boolean
}

export type StoreProfile = {
  storeName: string
  ownerName: string
  email: string
  photoURL?: string
  phone?: string
  address?: string
  plan?: string
  onboarded: boolean
  createdAt: number
  preferences?: Preferences
}
