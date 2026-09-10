import { slugify } from './db'
import type { CatalogItem, Product } from './types'

/** A product to pick from — either a real shelf product, or a shared-catalogue
 * entry that hasn't been stocked yet (`stock`/`lowStockAt` are undefined). */
export type PickItem = {
  key: string // product id if stocked, else catalog id
  discKey: string // slug(name) — stable key for saved discounts
  name: string
  brand: string
  emoji: string
  category: string
  price: number
  cost: number
  unit: string
  stock?: number
  lowStockAt?: number
}

/** Merge the shared catalogue with the store's own products, keyed by name so
 * a stocked product replaces its catalogue counterpart. Used anywhere a
 * shopkeeper should see "everything sellable", not just what's on the shelf. */
export function mergeCatalogAndProducts(
  catalog: CatalogItem[],
  products: Product[],
): PickItem[] {
  const byName = new Map<string, PickItem>()
  for (const c of catalog) {
    byName.set(c.name.toLowerCase(), {
      key: c.id,
      discKey: slugify(c.name),
      name: c.name,
      brand: c.brand,
      emoji: c.emoji,
      category: c.category,
      price: c.price,
      cost: c.cost,
      unit: c.unit,
    })
  }
  for (const p of products) {
    byName.set(p.name.toLowerCase(), {
      key: p.id,
      discKey: slugify(p.name),
      name: p.name,
      brand: p.brand,
      emoji: p.emoji,
      category: p.category,
      price: p.price,
      cost: p.cost,
      unit: p.unit,
      stock: p.stock,
      lowStockAt: p.lowStockAt,
    })
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}
