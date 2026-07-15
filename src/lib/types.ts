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

/** An entry in the shared master product catalogue (no per-store stock). */
export type CatalogItem = {
  id: string
  name: string
  brand: string
  emoji: string
  category: string
  price: number // suggested selling price / MRP (₹)
  cost: number // typical wholesale cost (₹)
  unit: string
}

export type DiscountType = 'percent' | 'amount'

export type ItemDiscount = {
  type: DiscountType
  value: number // the % or ₹ the user entered
}

export type SaleItem = {
  productId: string
  name: string
  emoji: string
  category: string
  qty: number
  price: number // selling price per unit (₹)
  cost: number // buy price per unit (₹) — for profit/loss
  // per-line discount (applied to qty*price)
  discountType?: DiscountType
  discountValue?: number
  discountAmount?: number // resolved ₹ discount for this line
}

export type Sale = {
  id: string
  date: number // epoch ms
  items: SaleItem[]
  totalUnits: number
  subtotal: number // sum of qty*price before discount
  discountType?: DiscountType // legacy bill-level (older sales)
  discountValue?: number
  discountAmount: number // total resolved ₹ discount (sum of line discounts)
  totalValue: number // subtotal - discountAmount (revenue)
  totalCost: number // sum of qty*cost
  customer?: string
}

/** Input shape when logging a new sale (totals are computed in db). */
export type SaleInput = {
  items: SaleItem[]
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
  tourCompleted?: boolean
  createdAt: number
  preferences?: Preferences
  // saved per-product discount defaults, keyed by slug(product name)
  itemDiscounts?: Record<string, ItemDiscount>
}
