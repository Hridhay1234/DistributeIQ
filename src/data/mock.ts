import type { Product } from '../lib/types'

export type { Product }

export const CATEGORIES = [
  'Staples',
  'Snacks',
  'Dairy',
  'Beverages',
  'Personal Care',
  'Household',
] as const

/** Pre-loaded common Indian SKUs offered during onboarding. */
export const STARTER_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Maggi 2-Min Noodles', brand: 'Nestlé', emoji: '🍜', category: 'Snacks', price: 14, cost: 11, stock: 48, lowStockAt: 20, unit: 'pack' },
  { name: 'Amul Taaza Milk 500ml', brand: 'Amul', emoji: '🥛', category: 'Dairy', price: 27, cost: 24, stock: 24, lowStockAt: 24, unit: 'pouch' },
  { name: 'Parle-G Biscuit', brand: 'Parle', emoji: '🍪', category: 'Snacks', price: 10, cost: 8, stock: 64, lowStockAt: 30, unit: 'pack' },
  { name: 'Tata Salt 1kg', brand: 'Tata', emoji: '🧂', category: 'Staples', price: 28, cost: 24, stock: 30, lowStockAt: 15, unit: 'pack' },
  { name: 'Aashirvaad Atta 5kg', brand: 'ITC', emoji: '🌾', category: 'Staples', price: 265, cost: 240, stock: 12, lowStockAt: 10, unit: 'bag' },
  { name: 'Amul Butter 100g', brand: 'Amul', emoji: '🧈', category: 'Dairy', price: 56, cost: 50, stock: 18, lowStockAt: 12, unit: 'pack' },
  { name: 'Coca-Cola 750ml', brand: 'Coca-Cola', emoji: '🥤', category: 'Beverages', price: 40, cost: 33, stock: 36, lowStockAt: 18, unit: 'bottle' },
  { name: 'Red Label Tea 250g', brand: 'Brooke Bond', emoji: '🍵', category: 'Beverages', price: 140, cost: 124, stock: 22, lowStockAt: 10, unit: 'pack' },
  { name: 'Surf Excel 1kg', brand: 'HUL', emoji: '🧼', category: 'Household', price: 130, cost: 116, stock: 16, lowStockAt: 8, unit: 'pack' },
  { name: 'Colgate MaxFresh 150g', brand: 'Colgate', emoji: '🪥', category: 'Personal Care', price: 95, cost: 82, stock: 14, lowStockAt: 10, unit: 'tube' },
  { name: 'Fortune Sunflower Oil 1L', brand: 'Fortune', emoji: '🛢️', category: 'Staples', price: 145, cost: 132, stock: 26, lowStockAt: 12, unit: 'bottle' },
  { name: 'Lays Classic 52g', brand: 'PepsiCo', emoji: '🥔', category: 'Snacks', price: 20, cost: 16, stock: 28, lowStockAt: 20, unit: 'pack' },
  { name: 'Dettol Soap 125g', brand: 'Reckitt', emoji: '🧴', category: 'Personal Care', price: 45, cost: 38, stock: 31, lowStockAt: 15, unit: 'bar' },
  { name: 'Kissan Mixed Jam 200g', brand: 'Kissan', emoji: '🍓', category: 'Staples', price: 90, cost: 79, stock: 16, lowStockAt: 8, unit: 'jar' },
]

/** Palette used to colour category slices in charts. */
export const CATEGORY_COLORS = [
  'var(--green-800)',
  'var(--green-600)',
  'var(--green-400)',
  'var(--green-300)',
  'var(--green-500)',
  'var(--green-700)',
]

export const formatINR = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN')
