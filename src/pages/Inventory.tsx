import { useMemo, useRef, useState } from 'react'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import AddProductModal, {
  type ProductFormData,
} from '../components/AddProductModal'
import { useData } from '../context/DataContext'
import { mergeCatalogAndProducts, type PickItem } from '../lib/items'
import { CATEGORIES, formatINR } from '../data/mock'
import './inventory.css'

type Filter = 'All' | 'Low stock' | (typeof CATEGORIES)[number]

const DEFAULT_LOW_STOCK_AT = 5

export default function Inventory() {
  const {
    catalog,
    products,
    setProductStock,
    saveSnapshot,
    addProduct,
    updateProduct,
  } = useData()
  const [filter, setFilter] = useState<Filter>('All')
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [snapSaved, setSnapSaved] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<PickItem | null>(null)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const items = useMemo(
    () => mergeCatalogAndProducts(catalog, products),
    [catalog, products],
  )

  const stockOf = (p: PickItem) => draft[p.key] ?? p.stock ?? 0
  const lowAt = (p: PickItem) => p.lowStockAt ?? DEFAULT_LOW_STOCK_AT

  const setStock = (p: PickItem, next: number) => {
    const v = Math.max(0, next)
    if (p.stock === undefined) {
      // not on the shelf yet — add it as a real product, starting at this count
      addProduct({
        name: p.name,
        brand: p.brand,
        emoji: p.emoji,
        category: p.category,
        price: p.price,
        cost: p.cost,
        unit: p.unit,
        stock: v,
        lowStockAt: DEFAULT_LOW_STOCK_AT,
      }).catch(() => {})
      return
    }
    setDraft((d) => ({ ...d, [p.key]: v }))
    clearTimeout(timers.current[p.key])
    timers.current[p.key] = setTimeout(() => {
      setProductStock(p.key, v).catch(() => {})
    }, 450)
  }

  const productStockOf = (id: string, fallback: number) => draft[id] ?? fallback
  const lowCount = products.filter(
    (p) => productStockOf(p.id, p.stock) <= p.lowStockAt,
  ).length
  const stockValue = products.reduce(
    (s, p) => s + productStockOf(p.id, p.stock) * p.cost,
    0,
  )

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (filter === 'All') return true
      if (filter === 'Low stock') return stockOf(p) <= lowAt(p)
      return p.category === filter
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, items, draft])

  const grouped = useMemo(() => {
    const map = new Map<string, PickItem[]>()
    filtered.forEach((p) => {
      const arr = map.get(p.category) || []
      arr.push(p)
      map.set(p.category, arr)
    })
    return [...map.entries()]
  }, [filtered])

  const stateOf = (p: PickItem): 'ok' | 'low' | 'out' => {
    const s = stockOf(p)
    if (s === 0) return 'out'
    if (s <= lowAt(p)) return 'low'
    return 'ok'
  }

  const saveEdit = async (data: ProductFormData) => {
    if (!editing) return
    const patch = {
      name: data.name,
      brand: data.brand,
      emoji: data.emoji,
      category: data.category,
      price: data.price,
      cost: data.cost,
      unit: data.unit,
      lowStockAt: data.lowStockAt,
    }
    if (editing.stock === undefined) {
      await addProduct({ ...patch, stock: 0 })
    } else {
      await updateProduct(editing.key, patch)
    }
    setEditing(null)
  }

  const doSnapshot = async () => {
    await saveSnapshot()
    setSnapSaved(true)
    setTimeout(() => setSnapSaved(false), 2400)
  }

  const chips: Filter[] = ['All', 'Low stock', ...CATEGORIES]

  return (
    <>
      <Topbar
        title="Shelf Count & Inventory"
        subtitle="Walk the aisle, update counts, flag what's running low"
        search={false}
      />

      <section className="inv-stats">
        <div className="inv-stat card">
          <span className="stat-ic ic-green">
            <Icon name="box" size={20} />
          </span>
          <div>
            <div className="inv-stat-val">{products.length}</div>
            <div className="muted">SKUs on shelf</div>
          </div>
        </div>
        <div className="inv-stat card">
          <span className="stat-ic ic-orange">
            <Icon name="alert" size={20} />
          </span>
          <div>
            <div className="inv-stat-val">{lowCount}</div>
            <div className="muted">Need reorder</div>
          </div>
        </div>
        <div className="inv-stat card">
          <span className="stat-ic ic-blue">
            <Icon name="rupee" size={20} />
          </span>
          <div>
            <div className="inv-stat-val">{formatINR(stockValue)}</div>
            <div className="muted">Stock value (cost)</div>
          </div>
        </div>
        <button className="inv-snapshot" onClick={doSnapshot}>
          <span className="snap-ic">
            <Icon name={snapSaved ? 'check-circle' : 'snapshot'} size={20} />
          </span>
          <div>
            <div className="snap-title">
              {snapSaved ? 'Snapshot saved ✓' : 'Save weekly snapshot'}
            </div>
            <div className="snap-sub">
              {snapSaved ? 'Stored to your store history' : 'Capture today’s counts'}
            </div>
          </div>
        </button>
      </section>

      <div className="inv-filters">
        {chips.map((c) => (
          <button
            key={c}
            className={'filter-chip' + (filter === c ? ' on' : '')}
            onClick={() => setFilter(c)}
          >
            {c === 'Low stock' && <Icon name="alert" size={14} />}
            {c}
            {c === 'Low stock' && lowCount > 0 && (
              <span className="fc-badge">{lowCount}</span>
            )}
          </button>
        ))}
        <button className="add-product-btn" onClick={() => setAdding(true)}>
          <Icon name="plus" size={16} /> Add product
        </button>
      </div>

      {adding && (
        <AddProductModal
          mode="inventory"
          onClose={() => setAdding(false)}
          onSave={async (p) => {
            await addProduct({
              name: p.name,
              brand: p.brand,
              emoji: p.emoji,
              category: p.category,
              price: p.price,
              cost: p.cost,
              stock: p.stock,
              lowStockAt: p.lowStockAt,
              unit: p.unit,
            })
            setAdding(false)
          }}
        />
      )}

      {editing && (
        <AddProductModal
          mode="edit"
          initial={{
            name: editing.name,
            brand: editing.brand,
            emoji: editing.emoji,
            category: editing.category,
            price: editing.price,
            cost: editing.cost,
            unit: editing.unit,
            lowStockAt: lowAt(editing),
          }}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      {items.length === 0 ? (
        <div className="empty-block">
          <Icon name="box" size={26} />
          <p>No products yet. Add them via onboarding or a bill scan.</p>
        </div>
      ) : (
        <div className="inv-groups">
          {grouped.map(([cat, catItems]) => (
            <section key={cat} className="inv-group">
              <div className="inv-group-head">
                <h3>{cat}</h3>
                <span className="muted">{catItems.length} items</span>
              </div>
              <div className="inv-cards">
                {catItems.map((p) => {
                  const st = stateOf(p)
                  const stock = stockOf(p)
                  const notOnShelf = p.stock === undefined
                  return (
                    <article
                      key={p.key}
                      className={'inv-card ' + st + (notOnShelf ? ' unstocked' : '')}
                    >
                      <div className="inv-card-top">
                        <span className="emoji-box">{p.emoji}</span>
                        {notOnShelf ? (
                          <span className="chip">Not on shelf</span>
                        ) : (
                          st !== 'ok' && (
                            <span
                              className={
                                'chip ' +
                                (st === 'out' ? 'chip-red' : 'chip-orange')
                              }
                            >
                              <Icon name="alert" size={12} />
                              {st === 'out' ? 'Out' : 'Low'}
                            </span>
                          )
                        )}
                        <button
                          className="inv-edit-btn"
                          onClick={() => setEditing(p)}
                          aria-label="Edit product details"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                      <div className="inv-name">{p.name}</div>
                      <div className="inv-brand muted">{p.brand}</div>

                      <div className="inv-price-row">
                        <span className="inv-price sell">
                          Sell <strong>{formatINR(p.price)}</strong>
                        </span>
                        <span className="inv-price cost">
                          Cost <strong>{formatINR(p.cost)}</strong>
                        </span>
                      </div>

                      <div className="inv-count-row">
                        <button
                          className="step-btn"
                          onClick={() => setStock(p, stock - 1)}
                          disabled={stock === 0}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <div className="inv-count">
                          <span>{stock}</span>
                          <small>{p.unit}s</small>
                        </div>
                        <button
                          className="step-btn plus"
                          onClick={() => setStock(p, stock + 1)}
                        >
                          <Icon name="plus" size={16} />
                        </button>
                      </div>

                      <div className="inv-bar">
                        <div
                          className="inv-bar-fill"
                          style={{
                            width: `${Math.min(100, (stock / (lowAt(p) * 2.5)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="inv-reorder muted">
                        Reorder at {lowAt(p)}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
