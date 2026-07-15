import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar'
import Icon, { type IconName } from '../components/Icon'
import SaleReceipt from '../components/SaleReceipt'
import { useData } from '../context/DataContext'
import { computeAnalytics } from '../lib/analytics'
import { formatINR } from '../data/mock'
import type { Sale } from '../lib/types'
import './salesrecords.css'

function saleCost(s: Sale) {
  if (typeof s.totalCost === 'number') return s.totalCost
  return s.items.reduce((c, it) => c + it.qty * (it.cost ?? it.price * 0.85), 0)
}

function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function SalesRecords() {
  const { sales, products, bills, store } = useData()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [receipt, setReceipt] = useState<Sale | null>(null)

  const a = useMemo(
    () => computeAnalytics(products, sales, bills),
    [products, sales, bills],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sales
    return sales.filter(
      (s) =>
        (s.customer ?? '').toLowerCase().includes(q) ||
        s.items.some((it) => it.name.toLowerCase().includes(q)),
    )
  }, [sales, query])

  const pnl: { label: string; value: string; icon: IconName; tone: string }[] = [
    { label: 'Total revenue', value: formatINR(a.revenueAll), icon: 'rupee', tone: 'green' },
    { label: 'Total cost (buy)', value: formatINR(a.costAll), icon: 'wallet', tone: 'orange' },
    {
      label: a.profitAll >= 0 ? 'Gross profit' : 'Net loss',
      value: formatINR(Math.abs(a.profitAll)),
      icon: a.profitAll >= 0 ? 'trend-up' : 'trend-down',
      tone: a.profitAll >= 0 ? 'green' : 'red',
    },
    { label: 'Profit margin', value: `${a.marginPct}%`, icon: 'percent', tone: 'blue' },
  ]

  return (
    <>
      <Topbar
        title="Sales Records"
        subtitle="Every logged sale, its bill, and your profit & loss"
        search={false}
      />

      {/* P&L summary */}
      <section className="pnl-grid">
        {pnl.map((p) => (
          <article key={p.label} className={'pnl-card tone-' + p.tone}>
            <span className="pnl-ic">
              <Icon name={p.icon} size={20} />
            </span>
            <div>
              <div className="pnl-value">{p.value}</div>
              <div className="pnl-label">{p.label}</div>
            </div>
          </article>
        ))}
      </section>

      {/* Search */}
      <div className="rec-searchbar">
        <Icon name="search" size={18} />
        <input
          placeholder="Search by product or customer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="rec-count">{filtered.length} sales</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-block" style={{ padding: '60px 16px' }}>
          <Icon name="receipt" size={28} />
          <p>
            {sales.length === 0
              ? 'No sales logged yet. Head to Daily Sales to record your first sale.'
              : `No sales match “${query}”.`}
          </p>
        </div>
      ) : (
        <div className="rec-list">
          {filtered.map((s) => {
            const cost = saleCost(s)
            const profit = s.totalValue - cost
            const subtotal = s.subtotal ?? s.totalValue
            const disc = s.discountAmount ?? 0
            const isOpen = open[s.id]
            return (
              <article key={s.id} className={'rec-card' + (isOpen ? ' open' : '')}>
                <div
                  className="rec-head"
                  onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                >
                  <span className="rec-emojis">
                    {s.items.slice(0, 3).map((it, i) => (
                      <span key={i}>{it.emoji}</span>
                    ))}
                  </span>
                  <div className="rec-meta">
                    <span className="rec-title">
                      {s.items.length} item{s.items.length > 1 ? 's' : ''} ·{' '}
                      {s.totalUnits} units
                    </span>
                    <span className="rec-sub">
                      {fmtDateTime(s.date)}
                      {s.customer ? ` · ${s.customer}` : ''}
                    </span>
                  </div>
                  <div className="rec-amounts">
                    <span className="rec-total">{formatINR(s.totalValue)}</span>
                    <span
                      className={
                        'rec-profit ' + (profit >= 0 ? 'up' : 'down')
                      }
                    >
                      {profit >= 0 ? '+' : '−'}
                      {formatINR(Math.abs(profit))} {profit >= 0 ? 'profit' : 'loss'}
                    </span>
                  </div>
                  <button
                    className="rec-bill-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setReceipt(s)
                    }}
                  >
                    <Icon name="receipt" size={15} /> Bill
                  </button>
                  <Icon name="chevron-down" size={18} />
                </div>

                {isOpen && (
                  <div className="rec-body">
                    <table className="rec-table">
                      <thead>
                        <tr>
                          <th className="l">Item</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Cost</th>
                          <th className="r">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.items.map((it, i) => (
                          <tr key={i}>
                            <td className="l">
                              {it.emoji} {it.name}
                            </td>
                            <td>{it.qty}</td>
                            <td>{formatINR(it.price)}</td>
                            <td className="muted">
                              {formatINR((it.cost ?? 0) * it.qty)}
                            </td>
                            <td className="r">{formatINR(it.qty * it.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="rec-foot">
                      <div className="rec-frow">
                        <span className="muted">Subtotal</span>
                        <span>{formatINR(subtotal)}</span>
                      </div>
                      {disc > 0 && (
                        <div className="rec-frow disc">
                          <span>
                            Discount
                            {s.discountType === 'percent'
                              ? ` (${s.discountValue}%)`
                              : ''}
                          </span>
                          <span>−{formatINR(disc)}</span>
                        </div>
                      )}
                      <div className="rec-frow">
                        <span className="muted">Cost of goods</span>
                        <span>{formatINR(cost)}</span>
                      </div>
                      <div className="rec-frow strong">
                        <span>Total sale</span>
                        <span>{formatINR(s.totalValue)}</span>
                      </div>
                      <div
                        className={
                          'rec-frow strong ' + (profit >= 0 ? 'up' : 'down')
                        }
                      >
                        <span>{profit >= 0 ? 'Profit' : 'Loss'}</span>
                        <span>{formatINR(Math.abs(profit))}</span>
                      </div>
                      <button
                        className="btn btn-outline rec-genbill"
                        onClick={() => setReceipt(s)}
                      >
                        <Icon name="receipt" size={16} /> Generate bill
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {receipt && (
        <SaleReceipt
          sale={receipt}
          store={store}
          onClose={() => setReceipt(null)}
        />
      )}
    </>
  )
}
