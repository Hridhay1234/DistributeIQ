import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import AddProductModal from '../components/AddProductModal'
import { useData } from '../context/DataContext'
import { resolveDiscount, slugify } from '../lib/db'
import { CATEGORIES, formatINR } from '../data/mock'
import type { DiscountType, ItemDiscount, SaleItem } from '../lib/types'
import './saleslog.css'

type PickItem = {
  key: string // sale.productId — store id if stocked, else catalog id
  discKey: string // slug(name) — stable key for saved discounts
  name: string
  brand: string
  emoji: string
  category: string
  price: number
  cost: number
  unit: string
  stock?: number
}

type CatFilter = 'All' | (typeof CATEGORIES)[number]

export default function SalesLog() {
  const { catalog, products, store, addSale, addCatalogItem, setItemDiscount } =
    useData()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<CatFilter>('All')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [adding, setAdding] = useState(false)

  // local discount overrides for this session (null = cleared)
  const [localDisc, setLocalDisc] = useState<
    Record<string, ItemDiscount | null>
  >({})
  const [editKey, setEditKey] = useState<string | null>(null)
  const [draftType, setDraftType] = useState<DiscountType>('percent')
  const [draftVal, setDraftVal] = useState('')

  // effective discount for a product = local override, else the saved default
  const effDisc = (dk: string): ItemDiscount | null => {
    if (dk in localDisc) return localDisc[dk]
    return store?.itemDiscounts?.[dk] ?? null
  }

  const items = useMemo<PickItem[]>(() => {
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
      })
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [catalog, products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      if (cat !== 'All' && p.category !== cat) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      )
    })
  }, [items, query, cat])

  const bump = (key: string, d: number) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, (c[key] || 0) + d) }))

  // ----- discount editor -----
  const openEditor = (dk: string) => {
    const d = effDisc(dk)
    setEditKey(dk)
    setDraftType(d?.type ?? 'percent')
    setDraftVal(d?.value ? String(d.value) : '')
  }
  const applyDraft = (dk: string, type: DiscountType, val: string) => {
    const v = Number(val) || 0
    setLocalDisc((prev) => ({ ...prev, [dk]: v > 0 ? { type, value: v } : null }))
  }
  const changeType = (t: DiscountType) => {
    setDraftType(t)
    if (editKey) applyDraft(editKey, t, draftVal)
  }
  const changeVal = (v: string) => {
    setDraftVal(v)
    if (editKey) applyDraft(editKey, draftType, v)
  }
  const saveDisc = () => {
    if (!editKey) return
    setItemDiscount(editKey, effDisc(editKey)).catch(() => {})
    setEditKey(null)
  }
  const removeDisc = (dk: string) => {
    setLocalDisc((prev) => ({ ...prev, [dk]: null }))
    setItemDiscount(dk, null).catch(() => {})
    if (editKey === dk) setEditKey(null)
  }

  // ----- basket totals -----
  const basket = items.filter((p) => (counts[p.key] || 0) > 0)
  let subtotal = 0
  let discountTotal = 0
  let totalCost = 0
  const lineOf = (p: PickItem) => {
    const qty = counts[p.key] || 0
    const lineSub = qty * p.price
    const d = effDisc(p.discKey)
    const lineDisc = resolveDiscount(lineSub, d?.type, d?.value)
    return { qty, lineSub, lineDisc, lineTotal: lineSub - lineDisc, d }
  }
  for (const p of basket) {
    const l = lineOf(p)
    subtotal += l.lineSub
    discountTotal += l.lineDisc
    totalCost += l.qty * p.cost
  }
  const totalUnits = basket.reduce((s, p) => s + counts[p.key], 0)
  const grandTotal = subtotal - discountTotal
  const profit = grandTotal - totalCost

  const save = async () => {
    if (!basket.length) return
    setSaving(true)
    try {
      const saleItems: SaleItem[] = basket.map((p) => {
        const d = effDisc(p.discKey)
        return {
          productId: p.key,
          name: p.name,
          emoji: p.emoji,
          category: p.category,
          qty: counts[p.key],
          price: p.price,
          cost: p.cost,
          ...(d ? { discountType: d.type, discountValue: d.value } : {}),
        }
      })
      await addSale({ items: saleItems })
      setCounts({})
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2400)
    } finally {
      setSaving(false)
    }
  }

  const chips: CatFilter[] = ['All', ...CATEGORIES]
  const discLabel = (d: ItemDiscount) =>
    d.type === 'percent' ? `${d.value}% off` : `₹${d.value} off`

  return (
    <>
      <Topbar
        title="Daily Sales Log"
        subtitle="Pick any product and tap + as it sells — set a discount per item"
        search={false}
      />

      <div className="sl-layout">
        <section className="sl-main">
          <div className="sl-searchbar">
            <Icon name="search" size={18} />
            <input
              autoFocus
              placeholder="Search Maggi, Amul, Colgate…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="sl-clear" onClick={() => setQuery('')}>
                <Icon name="close" size={16} />
              </button>
            )}
            <button className="sl-add" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} /> New
            </button>
          </div>

          <div className="sl-cats">
            {chips.map((c) => (
              <button
                key={c}
                className={'sl-cat' + (cat === c ? ' on' : '')}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="sl-list">
            {filtered.map((p) => {
              const n = counts[p.key] || 0
              const d = effDisc(p.discKey)
              const editing = editKey === p.discKey
              const saved = Boolean(store?.itemDiscounts?.[p.discKey])
              return (
                <div
                  key={p.key}
                  className={'sl-row' + (n > 0 ? ' active' : '')}
                >
                  <span className="emoji-box">{p.emoji}</span>
                  <div className="sl-meta">
                    <div className="sl-name-row">
                      <span className="sl-name">{p.name}</span>
                      <button
                        className={
                          'sl-disc-pill' +
                          (d ? ' set' : '') +
                          (editing ? ' active' : '')
                        }
                        onClick={() =>
                          editing ? setEditKey(null) : openEditor(p.discKey)
                        }
                        title="Set discount"
                      >
                        <Icon name="percent" size={12} />
                        {d ? discLabel(d) : 'Discount'}
                        {saved && d && <span className="sl-disc-saved" />}
                      </button>
                    </div>
                    <span className="sl-sub">
                      {p.brand} · {formatINR(p.price)}/{p.unit}
                      {p.stock !== undefined && <> · {p.stock} in stock</>}
                    </span>

                    {editing && (
                      <div className="sl-disc-editor">
                        <div className="disc-toggle">
                          <button
                            className={draftType === 'percent' ? 'on' : ''}
                            onClick={() => changeType('percent')}
                          >
                            %
                          </button>
                          <button
                            className={draftType === 'amount' ? 'on' : ''}
                            onClick={() => changeType('amount')}
                          >
                            ₹
                          </button>
                        </div>
                        <div className="disc-input-wrap">
                          <span className="disc-affix">
                            {draftType === 'percent' ? '%' : '₹'}
                          </span>
                          <input
                            autoFocus
                            inputMode="numeric"
                            placeholder="0"
                            value={draftVal}
                            onChange={(e) => changeVal(e.target.value)}
                          />
                        </div>
                        <button className="disc-save" onClick={saveDisc}>
                          <Icon name="check" size={14} /> Save
                        </button>
                        {d && (
                          <button
                            className="disc-remove"
                            onClick={() => removeDisc(p.discKey)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="stepper">
                    <button
                      className="step-btn"
                      onClick={() => bump(p.key, -1)}
                      disabled={n === 0}
                      aria-label="decrease"
                    >
                      <Icon name="minus" size={18} />
                    </button>
                    <span className="step-count">{n}</span>
                    <button
                      className="step-btn plus"
                      onClick={() => bump(p.key, 1)}
                      aria-label="increase"
                    >
                      <Icon name="plus" size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="sl-empty">
                No product matches “{query}”.{' '}
                <button
                  className="btn-link inline"
                  onClick={() => setAdding(true)}
                >
                  + Add “{query.trim()}”
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="sl-summary card">
          <h2 className="section-title">Today's basket</h2>
          {basket.length === 0 ? (
            <div className="sum-empty">
              <span className="sum-empty-ic">
                <Icon name="cart" size={26} />
              </span>
              <p>
                {savedFlash
                  ? 'Saved! Sales recorded. Start the next basket.'
                  : "Search and tap + to build today's sales."}
              </p>
            </div>
          ) : (
            <ul className="sum-lines">
              {basket.map((p) => {
                const l = lineOf(p)
                return (
                  <li key={p.key}>
                    <span className="emoji-box sm">{p.emoji}</span>
                    <div className="tp-meta">
                      <span className="tp-name">{p.name}</span>
                      <span className="tp-sold">
                        {l.qty} × {formatINR(p.price)}
                        {l.lineDisc > 0 && (
                          <span className="tp-disc">
                            {' '}
                            −{formatINR(l.lineDisc)}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="tp-rev">{formatINR(l.lineTotal)}</span>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="sum-foot">
            <div className="sum-row">
              <span className="muted">Items</span>
              <span>{totalUnits} units</span>
            </div>
            <div className="sum-row">
              <span className="muted">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="sum-row disc">
                <span>Item discounts</span>
                <span>−{formatINR(discountTotal)}</span>
              </div>
            )}
            <div className="sum-row total">
              <span>Total sales</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
            {basket.length > 0 && (
              <div className={'sum-row profit ' + (profit >= 0 ? 'up' : 'down')}>
                <span>Est. profit</span>
                <span>{formatINR(profit)}</span>
              </div>
            )}
            <button
              className="btn btn-primary block"
              disabled={!basket.length || saving}
              onClick={save}
            >
              <Icon name="check-circle" size={18} />
              {saving ? 'Saving…' : "Save today's log"}
            </button>
            <Link to="/app/records" className="sum-records-link">
              <Icon name="reports" size={15} /> View all sales & bills
            </Link>
          </div>
        </aside>
      </div>

      {adding && (
        <AddProductModal
          mode="catalog"
          title="Add product to catalogue"
          onClose={() => setAdding(false)}
          onSave={async (p) => {
            await addCatalogItem({
              name: p.name,
              brand: p.brand,
              emoji: p.emoji,
              category: p.category,
              price: p.price,
              cost: p.cost,
              unit: p.unit,
            })
            setAdding(false)
          }}
        />
      )}
    </>
  )
}
