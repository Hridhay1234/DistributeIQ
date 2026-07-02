import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { formatINR } from '../data/mock'
import type { SaleItem } from '../lib/types'
import './saleslog.css'

export default function SalesLog() {
  const { products, addSale } = useData()
  const [query, setQuery] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    )
  }, [query, products])

  const bump = (id: string, d: number) =>
    setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }))

  const lines = products.filter((p) => (counts[p.id] || 0) > 0)
  const totalUnits = lines.reduce((s, p) => s + counts[p.id], 0)
  const totalValue = lines.reduce((s, p) => s + counts[p.id] * p.price, 0)

  const save = async () => {
    if (!lines.length) return
    setSaving(true)
    try {
      const items: SaleItem[] = lines.map((p) => ({
        productId: p.id,
        name: p.name,
        emoji: p.emoji,
        category: p.category,
        qty: counts[p.id],
        price: p.price,
      }))
      await addSale(items)
      setCounts({})
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2400)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Topbar
        title="Daily Sales Log"
        subtitle="Tap + as items sell — log the whole day in under a minute"
        search={false}
      />

      <div className="sl-layout">
        <section className="sl-main">
          <div className="sl-searchbar">
            <Icon name="search" size={18} />
            <input
              autoFocus
              placeholder="Search Maggi, Amul, Parle-G…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="sl-clear" onClick={() => setQuery('')}>
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          <div className="sl-list">
            {filtered.map((p) => {
              const n = counts[p.id] || 0
              return (
                <div key={p.id} className={'sl-row' + (n > 0 ? ' active' : '')}>
                  <span className="emoji-box">{p.emoji}</span>
                  <div className="sl-meta">
                    <span className="sl-name">{p.name}</span>
                    <span className="sl-sub">
                      {p.brand} · {formatINR(p.price)}/{p.unit} · {p.stock} in
                      stock
                    </span>
                  </div>

                  <div className="stepper">
                    <button
                      className="step-btn"
                      onClick={() => bump(p.id, -1)}
                      disabled={n === 0}
                      aria-label="decrease"
                    >
                      <Icon name="minus" size={18} />
                    </button>
                    <span className="step-count">{n}</span>
                    <button
                      className="step-btn plus"
                      onClick={() => bump(p.id, 1)}
                      aria-label="increase"
                    >
                      <Icon name="plus" size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
            {products.length > 0 && filtered.length === 0 && (
              <div className="sl-empty">No match for “{query}”.</div>
            )}
            {products.length === 0 && (
              <div className="sl-empty">
                No products yet — add some from a bill scan or onboarding.
              </div>
            )}
          </div>
        </section>

        <aside className="sl-summary card">
          <h2 className="section-title">Today's basket</h2>
          {lines.length === 0 ? (
            <div className="sum-empty">
              <span className="sum-empty-ic">
                <Icon name="cart" size={26} />
              </span>
              <p>
                {savedFlash
                  ? 'Saved! Stock updated. Start the next basket.'
                  : "Start tapping + to build today's sales."}
              </p>
            </div>
          ) : (
            <ul className="sum-lines">
              {lines.map((p) => (
                <li key={p.id}>
                  <span className="emoji-box sm">{p.emoji}</span>
                  <div className="tp-meta">
                    <span className="tp-name">{p.name}</span>
                    <span className="tp-sold">
                      {counts[p.id]} × {formatINR(p.price)}
                    </span>
                  </div>
                  <span className="tp-rev">
                    {formatINR(counts[p.id] * p.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="sum-foot">
            <div className="sum-row">
              <span className="muted">Items</span>
              <span>{totalUnits} units</span>
            </div>
            <div className="sum-row total">
              <span>Total sales</span>
              <span>{formatINR(totalValue)}</span>
            </div>
            <button
              className="btn btn-primary block"
              disabled={!lines.length || saving}
              onClick={save}
            >
              <Icon name="check-circle" size={18} />
              {saving ? 'Saving…' : "Save today's log"}
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
