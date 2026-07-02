import { useMemo, useRef, useState } from 'react'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { CATEGORIES, formatINR } from '../data/mock'
import type { Product } from '../lib/types'
import './inventory.css'

type Filter = 'All' | 'Low stock' | (typeof CATEGORIES)[number]

export default function Inventory() {
  const { products, setProductStock, saveSnapshot } = useData()
  const [filter, setFilter] = useState<Filter>('All')
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [snapSaved, setSnapSaved] = useState(false)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const stockOf = (p: Product) => draft[p.id] ?? p.stock

  const setStock = (p: Product, next: number) => {
    const v = Math.max(0, next)
    setDraft((d) => ({ ...d, [p.id]: v }))
    clearTimeout(timers.current[p.id])
    timers.current[p.id] = setTimeout(() => {
      setProductStock(p.id, v).catch(() => {})
    }, 450)
  }

  const lowCount = products.filter((p) => stockOf(p) <= p.lowStockAt).length
  const stockValue = products.reduce((s, p) => s + stockOf(p) * p.cost, 0)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'All') return true
      if (filter === 'Low stock') return stockOf(p) <= p.lowStockAt
      return p.category === filter
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, products, draft])

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>()
    filtered.forEach((p) => {
      const arr = map.get(p.category) || []
      arr.push(p)
      map.set(p.category, arr)
    })
    return [...map.entries()]
  }, [filtered])

  const stateOf = (p: Product): 'ok' | 'low' | 'out' => {
    const s = stockOf(p)
    if (s === 0) return 'out'
    if (s <= p.lowStockAt) return 'low'
    return 'ok'
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
      </div>

      {products.length === 0 ? (
        <div className="empty-block">
          <Icon name="box" size={26} />
          <p>No products yet. Add them via onboarding or a bill scan.</p>
        </div>
      ) : (
        <div className="inv-groups">
          {grouped.map(([cat, items]) => (
            <section key={cat} className="inv-group">
              <div className="inv-group-head">
                <h3>{cat}</h3>
                <span className="muted">{items.length} items</span>
              </div>
              <div className="inv-cards">
                {items.map((p) => {
                  const st = stateOf(p)
                  const stock = stockOf(p)
                  return (
                    <article key={p.id} className={'inv-card ' + st}>
                      <div className="inv-card-top">
                        <span className="emoji-box">{p.emoji}</span>
                        {st !== 'ok' && (
                          <span
                            className={
                              'chip ' +
                              (st === 'out' ? 'chip-red' : 'chip-orange')
                            }
                          >
                            <Icon name="alert" size={12} />
                            {st === 'out' ? 'Out' : 'Low'}
                          </span>
                        )}
                      </div>
                      <div className="inv-name">{p.name}</div>
                      <div className="inv-brand muted">{p.brand}</div>

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
                            width: `${Math.min(100, (stock / (p.lowStockAt * 2.5)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="inv-reorder muted">
                        Reorder at {p.lowStockAt}
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
