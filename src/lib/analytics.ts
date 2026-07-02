import { CATEGORY_COLORS } from '../data/mock'
import type { Bill, Product, Sale } from './types'

const DAY = 86_400_000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export type DayPoint = { day: string; value: number }

/** Revenue per day for the last `days` days (oldest → newest). */
export function dailyRevenue(sales: Sale[], days: number): DayPoint[] {
  const todayStart = startOfDay(Date.now())
  const start = todayStart - (days - 1) * DAY
  const buckets = new Map<number, number>()
  for (let i = 0; i < days; i++) buckets.set(start + i * DAY, 0)
  for (const s of sales) {
    const k = startOfDay(s.date)
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + s.totalValue)
  }
  return [...buckets.entries()].map(([k, v]) => ({
    day: WEEKDAYS[new Date(k).getDay()],
    value: Math.round(v),
  }))
}

/** Units sold per day for the last `days` days (oldest → newest). */
export function dailyUnits(sales: Sale[], days: number): number[] {
  const todayStart = startOfDay(Date.now())
  const start = todayStart - (days - 1) * DAY
  const buckets = new Map<number, number>()
  for (let i = 0; i < days; i++) buckets.set(start + i * DAY, 0)
  for (const s of sales) {
    const k = startOfDay(s.date)
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + s.totalUnits)
  }
  return [...buckets.values()]
}

function rangeSum(
  sales: Sale[],
  fromTs: number,
  toTs: number,
  field: (s: Sale) => number,
) {
  return sales
    .filter((s) => s.date >= fromTs && s.date < toTs)
    .reduce((acc, s) => acc + field(s), 0)
}

function pctDelta(curr: number, prev: number): { delta: number; up: boolean } {
  if (prev === 0) return { delta: curr > 0 ? 100 : 0, up: curr >= 0 }
  const d = ((curr - prev) / prev) * 100
  return { delta: Math.abs(Math.round(d * 10) / 10), up: d >= 0 }
}

export type CategorySlice = { label: string; value: number; color: string }

export type TopProduct = {
  name: string
  emoji: string
  sold: number
  revenue: number
}

export type RecentOrder = {
  id: string
  product: string
  emoji: string
  date: string
  status: 'Received' | 'Pending'
  amount: number
  customer: string
}

export type Analytics = {
  revenue7d: number
  revenueDelta: { delta: number; up: boolean }
  units7d: number
  unitsDelta: { delta: number; up: boolean }
  skuCount: number
  billCount: number
  avgBasket: number
  estProfit7d: number
  trend: DayPoint[]
  sparkRevenue: number[]
  sparkUnits: number[]
  categorySplit: CategorySlice[]
  categoryTotal: number
  topProducts: TopProduct[]
  recentOrders: RecentOrder[]
  lowStock: Product[]
  healthyCount: number
  hasData: boolean
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function computeAnalytics(
  products: Product[],
  sales: Sale[],
  bills: Bill[],
): Analytics {
  const now = Date.now()
  const todayStart = startOfDay(now)
  const weekAgo = todayStart - 6 * DAY
  const prevWeekStart = todayStart - 13 * DAY

  const revenue7d = rangeSum(sales, weekAgo, now + DAY, (s) => s.totalValue)
  const prevRevenue = rangeSum(sales, prevWeekStart, weekAgo, (s) => s.totalValue)
  const units7d = rangeSum(sales, weekAgo, now + DAY, (s) => s.totalUnits)
  const prevUnits = rangeSum(sales, prevWeekStart, weekAgo, (s) => s.totalUnits)

  const weekSales = sales.filter((s) => s.date >= weekAgo)
  const avgBasket = weekSales.length
    ? Math.round(revenue7d / weekSales.length)
    : 0

  // category revenue (last 30 days), falling back to stock value
  const monthAgo = todayStart - 29 * DAY
  const catMap = new Map<string, number>()
  for (const s of sales) {
    if (s.date < monthAgo) continue
    for (const it of s.items) {
      catMap.set(
        it.category,
        (catMap.get(it.category) ?? 0) + it.qty * it.price,
      )
    }
  }
  if (catMap.size === 0) {
    for (const p of products) {
      catMap.set(p.category, (catMap.get(p.category) ?? 0) + p.stock * p.price)
    }
  }
  const categorySplit: CategorySlice[] = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value: Math.round(value),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  const categoryTotal = categorySplit.reduce((s, c) => s + c.value, 0)

  // estimated profit (last 7 days) from per-item margin
  const priceCost = new Map(products.map((p) => [p.id, p.cost]))
  let estProfit7d = 0
  for (const s of weekSales) {
    for (const it of s.items) {
      const cost = priceCost.get(it.productId) ?? it.price * 0.85
      estProfit7d += it.qty * (it.price - cost)
    }
  }

  // top products (all time)
  const topMap = new Map<string, TopProduct>()
  for (const s of sales) {
    for (const it of s.items) {
      const cur =
        topMap.get(it.name) ??
        ({ name: it.name, emoji: it.emoji, sold: 0, revenue: 0 } as TopProduct)
      cur.sold += it.qty
      cur.revenue += it.qty * it.price
      topMap.set(it.name, cur)
    }
  }
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)

  // recent orders from latest sales (sales already sorted desc by date)
  const recentOrders: RecentOrder[] = sales.slice(0, 6).map((s) => ({
    id: s.id,
    product:
      s.items.length > 1
        ? `${s.items[0].name.split(' ').slice(0, 2).join(' ')} +${s.items.length - 1}`
        : (s.items[0]?.name ?? 'Sale'),
    emoji: s.items[0]?.emoji ?? '🛒',
    date: fmtDate(s.date),
    status: 'Received',
    amount: s.totalValue,
    customer: s.customer ?? 'Walk-in',
  }))

  const lowStock = products.filter((p) => p.stock <= p.lowStockAt)

  return {
    revenue7d: Math.round(revenue7d),
    revenueDelta: pctDelta(revenue7d, prevRevenue),
    units7d,
    unitsDelta: pctDelta(units7d, prevUnits),
    skuCount: products.length,
    billCount: bills.length,
    avgBasket,
    estProfit7d: Math.round(estProfit7d),
    trend: dailyRevenue(sales, 7),
    sparkRevenue: dailyRevenue(sales, 9).map((d) => d.value),
    sparkUnits: dailyUnits(sales, 9),
    categorySplit,
    categoryTotal,
    topProducts,
    recentOrders,
    lowStock,
    healthyCount: products.length - lowStock.length,
    hasData: sales.length > 0 || products.length > 0,
  }
}
