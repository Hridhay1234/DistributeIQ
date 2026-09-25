import {
  INDIA_TRENDING,
  currentSeason,
  upcomingFestivals,
  type TrendItem,
} from '../data/trends'
import type { PickItem } from './items'

export type ShelfStatus = 'ok' | 'low' | 'out' | 'catalog' | 'none'

export type TrendMatch = TrendItem & {
  status: ShelfStatus
  product?: PickItem // the store/catalogue item it matched, if any
}

const DEFAULT_LOW_STOCK_AT = 5

/** Link a trend to the best matching sellable item: prefer one on the shelf. */
export function matchTrend(t: TrendItem, items: PickItem[]): TrendMatch {
  const keys = t.match ?? []
  const hits = items.filter((p) => {
    const n = p.name.toLowerCase()
    return keys.some((k) => n.includes(k))
  })
  const stocked = hits.filter((p) => p.stock !== undefined)
  const product =
    stocked.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))[0] ?? hits[0]
  if (!product) return { ...t, status: 'none' }
  if (product.stock === undefined) return { ...t, status: 'catalog', product }
  const lowAt = product.lowStockAt ?? DEFAULT_LOW_STOCK_AT
  const status: ShelfStatus =
    product.stock === 0 ? 'out' : product.stock <= lowAt ? 'low' : 'ok'
  return { ...t, status, product }
}

/** Everything the trends views need for a given date. */
export function buildTrends(now: Date, items: PickItem[]) {
  const season = currentSeason(now)
  const festivals = upcomingFestivals(now)
  const m = (list: TrendItem[]) => list.map((t) => matchTrend(t, items))
  return {
    season: { ...season, items: m(season.items) },
    festivals: festivals.map((f) => ({ ...f, items: m(f.items) })),
    india: m(INDIA_TRENDING),
  }
}

export const STATUS_LABEL: Record<ShelfStatus, string> = {
  ok: 'In stock',
  low: 'Low stock',
  out: 'Out of stock',
  catalog: 'Not on shelf',
  none: 'Not stocked',
}
