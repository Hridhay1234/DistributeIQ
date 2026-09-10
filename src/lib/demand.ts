import type { Product, Sale } from './types'

const DAY = 86_400_000
const WINDOW_DAYS = 14

export type DemandLevel = 'high' | 'medium' | 'low'

export type ProductDemand = {
  productId: string
  name: string
  emoji: string
  category: string
  unitsPerDay: number // recent velocity, last 14 days
  trendPct: number // vs the 14 days before that (signed, %)
  level: DemandLevel
  stock: number
  daysOfStock: number | null // null when velocity is 0 (can't estimate)
}

/**
 * Rank products by recent sales velocity into a general high/medium/low
 * demand signal. Only products actually sold in the last 14 days get a
 * signal — there's no basis to call an unsold product "low demand" vs.
 * simply untried, so those are omitted rather than mislabeled.
 */
export function computeDemand(products: Product[], sales: Sale[]): ProductDemand[] {
  const now = Date.now()
  const recentStart = now - WINDOW_DAYS * DAY
  const prevStart = now - 2 * WINDOW_DAYS * DAY

  const recentQty = new Map<string, number>()
  const prevQty = new Map<string, number>()
  const meta = new Map<string, { name: string; emoji: string; category: string }>()

  for (const s of sales) {
    for (const it of s.items) {
      if (!it.productId) continue
      if (!meta.has(it.productId)) {
        meta.set(it.productId, {
          name: it.name,
          emoji: it.emoji,
          category: it.category,
        })
      }
      if (s.date >= recentStart) {
        recentQty.set(it.productId, (recentQty.get(it.productId) ?? 0) + it.qty)
      } else if (s.date >= prevStart) {
        prevQty.set(it.productId, (prevQty.get(it.productId) ?? 0) + it.qty)
      }
    }
  }

  const soldIds = [...meta.keys()].filter((id) => (recentQty.get(id) ?? 0) > 0)
  const velocities = soldIds
    .map((id) => (recentQty.get(id) ?? 0) / WINDOW_DAYS)
    .sort((a, b) => a - b)

  const percentileRank = (v: number) => {
    if (velocities.length <= 1) return 1
    let idx = velocities.findIndex((x) => x >= v)
    if (idx === -1) idx = velocities.length - 1
    return idx / (velocities.length - 1)
  }

  const stockOf = new Map(products.map((p) => [p.id, p.stock]))

  const results: ProductDemand[] = soldIds.map((id) => {
    const m = meta.get(id)!
    const recent = recentQty.get(id) ?? 0
    const prev = prevQty.get(id) ?? 0
    const unitsPerDay = recent / WINDOW_DAYS
    const prevUnitsPerDay = prev / WINDOW_DAYS

    const trendPct =
      prevUnitsPerDay > 0
        ? Math.round(((unitsPerDay - prevUnitsPerDay) / prevUnitsPerDay) * 100)
        : unitsPerDay > 0
          ? 100
          : 0

    const pr = percentileRank(unitsPerDay)
    const level: DemandLevel = pr >= 0.66 ? 'high' : pr >= 0.33 ? 'medium' : 'low'

    const stock = stockOf.get(id) ?? 0
    const daysOfStock = unitsPerDay > 0 ? Math.round(stock / unitsPerDay) : null

    return {
      productId: id,
      name: m.name,
      emoji: m.emoji,
      category: m.category,
      unitsPerDay: Math.round(unitsPerDay * 10) / 10,
      trendPct,
      level,
      stock,
      daysOfStock,
    }
  })

  return results.sort((a, b) => b.unitsPerDay - a.unitsPerDay)
}
