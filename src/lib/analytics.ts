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
  // a week reads best as weekdays; longer ranges repeat them, so use dates
  return [...buckets.entries()].map(([k, v]) => ({
    day:
      days > 7
        ? String(new Date(k).getDate())
        : WEEKDAYS[new Date(k).getDay()],
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

/**
 * Revenue split by category. `days = null` means all-time; otherwise a
 * trailing window (e.g. 7 = this week, 30 = this month). Falls back to
 * current stock value when nothing sold in the window, so the chart is
 * never empty for a brand-new store.
 */
export function categorySplitFor(
  products: Product[],
  sales: Sale[],
  days: number | null,
): { split: CategorySlice[]; total: number } {
  const since = days == null ? -Infinity : startOfDay(Date.now()) - (days - 1) * DAY
  const catMap = new Map<string, number>()
  for (const s of sales) {
    if (s.date < since) continue
    for (const it of s.items) {
      catMap.set(it.category, (catMap.get(it.category) ?? 0) + it.qty * it.price)
    }
  }
  if (catMap.size === 0) {
    for (const p of products) {
      catMap.set(p.category, (catMap.get(p.category) ?? 0) + p.stock * p.price)
    }
  }
  const split: CategorySlice[] = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value: Math.round(value),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  return { split, total: split.reduce((s, c) => s + c.value, 0) }
}

export type TopProduct = {
  name: string
  emoji: string
  sold: number
  revenue: number
}

/** Best-selling products across all recorded sales, ranked by revenue or
 * units sold. */
export function topProductsBy(
  sales: Sale[],
  by: 'revenue' | 'units' = 'revenue',
  limit = 4,
): TopProduct[] {
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
  return [...topMap.values()]
    .sort((a, b) => (by === 'units' ? b.sold - a.sold : b.revenue - a.revenue))
    .slice(0, limit)
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
  profitDelta: { delta: number; up: boolean }
  revenueAll: number
  costAll: number
  profitAll: number
  marginPct: number
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

/** Latest sales formatted as an orders table, optionally limited to a
 * trailing date range ('today' | 'week' | 'all'). */
export function recentOrdersFor(
  sales: Sale[],
  range: 'today' | 'week' | 'all' = 'all',
  limit = 6,
): RecentOrder[] {
  const todayStart = startOfDay(Date.now())
  const since =
    range === 'today' ? todayStart : range === 'week' ? todayStart - 6 * DAY : -Infinity
  return sales
    .filter((s) => s.date >= since)
    .slice(0, limit)
    .map((s) => ({
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
  const { split: categorySplit, total: categoryTotal } = categorySplitFor(
    products,
    sales,
    30,
  )

  // ---- profit / loss (from buying vs selling prices) ----
  const priceCost = new Map(products.map((p) => [p.id, p.cost]))
  // Cost of a sale: prefer the stored totalCost, else sum per-item cost with
  // fallbacks for older sales that predate the cost field.
  const saleCostOf = (s: Sale) => {
    if (typeof s.totalCost === 'number') return s.totalCost
    return s.items.reduce(
      (c, it) =>
        c + it.qty * (it.cost ?? priceCost.get(it.productId) ?? it.price * 0.85),
      0,
    )
  }
  const saleProfitOf = (s: Sale) => s.totalValue - saleCostOf(s)

  const estProfit7d = weekSales.reduce((p, s) => p + saleProfitOf(s), 0)
  const prevWeekSales = sales.filter(
    (s) => s.date >= prevWeekStart && s.date < weekAgo,
  )
  const prevProfit = prevWeekSales.reduce((p, s) => p + saleProfitOf(s), 0)

  const revenueAll = sales.reduce((s2, s) => s2 + s.totalValue, 0)
  const costAll = sales.reduce((s2, s) => s2 + saleCostOf(s), 0)
  const profitAll = revenueAll - costAll
  const marginPct = revenueAll > 0 ? (profitAll / revenueAll) * 100 : 0

  // top products (all time)
  const topProducts = topProductsBy(sales, 'revenue', 4)

  // recent orders from latest sales (sales already sorted desc by date)
  const recentOrders = recentOrdersFor(sales, 'all', 6)

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
    profitDelta: pctDelta(estProfit7d, prevProfit),
    revenueAll: Math.round(revenueAll),
    costAll: Math.round(costAll),
    profitAll: Math.round(profitAll),
    marginPct: Math.round(marginPct * 10) / 10,
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
