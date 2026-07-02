import { useMemo } from 'react'
import Topbar from '../components/Topbar'
import Icon, { type IconName } from '../components/Icon'
import Sparkline from '../components/Sparkline'
import LineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import { useData } from '../context/DataContext'
import { computeAnalytics } from '../lib/analytics'
import { formatINR } from '../data/mock'
import './dashboard.css'

export default function Dashboard() {
  const { products, sales, bills, store } = useData()
  const a = useMemo(
    () => computeAnalytics(products, sales, bills),
    [products, sales, bills],
  )

  const stats: {
    label: string
    value: string
    delta: string
    up: boolean
    icon: IconName
    accent: 'green' | 'blue' | 'purple' | 'orange'
    spark: number[]
    feature?: boolean
  }[] = [
    {
      label: 'Revenue (7 days)',
      value: formatINR(a.revenue7d),
      delta: `${a.revenueDelta.delta}% vs last week`,
      up: a.revenueDelta.up,
      icon: 'rupee',
      accent: 'green',
      spark: a.sparkRevenue,
      feature: true,
    },
    {
      label: 'Units Sold (7 days)',
      value: a.units7d.toLocaleString('en-IN'),
      delta: `${a.unitsDelta.delta}% vs last week`,
      up: a.unitsDelta.up,
      icon: 'sales',
      accent: 'blue',
      spark: a.sparkUnits,
    },
    {
      label: 'SKUs Tracked',
      value: a.skuCount.toLocaleString('en-IN'),
      delta: a.lowStock.length
        ? `${a.lowStock.length} need reorder`
        : 'all healthy',
      up: a.lowStock.length === 0,
      icon: 'box',
      accent: 'purple',
      spark: [6, 6, 7, 7, 8, 8, 9, 9, a.skuCount % 10 || 9],
    },
    {
      label: 'Bills Scanned',
      value: a.billCount.toLocaleString('en-IN'),
      delta: 'AI-parsed',
      up: true,
      icon: 'scan',
      accent: 'orange',
      spark: [2, 3, 3, 4, 5, 5, 6, 7, a.billCount % 9 || 6],
    },
  ]

  const firstName = store?.ownerName?.split(' ')[0] ?? 'there'

  return (
    <>
      <Topbar
        title="Dashboard Overview"
        subtitle={`Welcome back, ${firstName} — here's your store today`}
      />

      <section className="stat-grid">
        {stats.map((s) => (
          <article
            key={s.label}
            className={'stat-card' + (s.feature ? ' feature' : '')}
          >
            <div className="stat-top">
              <span className={`stat-ic ic-${s.accent}`}>
                <Icon name={s.icon} size={20} />
              </span>
              <span className="stat-label">{s.label}</span>
              <span className="stat-arrow">
                <Icon name="arrow-up-right" size={16} />
              </span>
            </div>
            <div className="stat-body">
              <div>
                <div className="stat-value">{s.value}</div>
                <div className={'stat-delta ' + (s.up ? 'up' : 'down')}>
                  <Icon name={s.up ? 'trend-up' : 'trend-down'} size={14} />
                  {s.delta}
                </div>
              </div>
              <Sparkline
                values={s.spark.length ? s.spark : [0, 0, 0, 0, 0]}
                color={s.feature ? 'rgba(255,255,255,0.9)' : undefined}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="grid-2">
        <article className="card chart-card">
          <div className="card-head">
            <div>
              <h2 className="section-title">Sales Trend</h2>
              <div className="chart-headline">
                <span className="big-num">{formatINR(a.revenue7d)}</span>
                <span
                  className={
                    'chip ' + (a.revenueDelta.up ? 'chip-green' : 'chip-red')
                  }
                >
                  <Icon
                    name={a.revenueDelta.up ? 'trend-up' : 'trend-down'}
                    size={13}
                  />{' '}
                  {a.revenueDelta.delta}%
                </span>
              </div>
            </div>
            <button className="pill-select">
              Weekly <Icon name="chevron-down" size={15} />
            </button>
          </div>
          <LineChart data={a.trend} height={250} highlightIndex={5} />
        </article>

        <article className="card chart-card">
          <div className="card-head">
            <h2 className="section-title">Sales by Category</h2>
            <button className="pill-select">
              Monthly <Icon name="chevron-down" size={15} />
            </button>
          </div>
          {a.categoryTotal > 0 ? (
            <div className="donut-wrap">
              <DonutChart
                data={a.categorySplit}
                centerTop={(a.categoryTotal / 1000).toFixed(1) + 'k'}
                centerSub="total"
              />
              <ul className="legend">
                {a.categorySplit.map((c) => (
                  <li key={c.label}>
                    <span className="dot" style={{ background: c.color }} />
                    <span className="lg-label">{c.label}</span>
                    <span className="lg-val">{formatINR(c.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyBlock text="Log a few sales to see your category mix." />
          )}
        </article>
      </section>

      <section className="grid-bottom">
        <article className="card">
          <div className="card-head">
            <h2 className="section-title">Top Products</h2>
            <button className="pill-select">
              Revenue <Icon name="chevron-down" size={15} />
            </button>
          </div>
          {a.topProducts.length ? (
            <ul className="top-list">
              {a.topProducts.map((p, i) => (
                <li key={p.name}>
                  <span className="rank">{i + 1}</span>
                  <span className="emoji-box">{p.emoji}</span>
                  <div className="tp-meta">
                    <span className="tp-name">{p.name}</span>
                    <span className="tp-sold">{p.sold} sold</span>
                  </div>
                  <span className="tp-rev">{formatINR(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock text="No sales yet." />
          )}
        </article>

        <article className="card">
          <div className="card-head">
            <h2 className="section-title">Recent Orders</h2>
            <button className="pill-select">
              <Icon name="filter" size={15} /> Filter
            </button>
          </div>
          {a.recentOrders.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {a.recentOrders.map((o, i) => (
                    <tr key={o.id}>
                      <td className="muted">{i + 1}</td>
                      <td>
                        <span className="cell-prod">
                          <span className="emoji-box sm">{o.emoji}</span>
                          {o.product}
                        </span>
                      </td>
                      <td className="muted">{o.date}</td>
                      <td>
                        <span className="chip chip-green">{o.status}</span>
                      </td>
                      <td className="amt">{formatINR(o.amount)}</td>
                      <td className="muted">{o.customer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyBlock text="Sales you log will show up here." />
          )}
        </article>

        <article className="card health-card">
          <div className="card-head">
            <h2 className="section-title">Inventory Health</h2>
            <span
              className={
                'chip ' + (a.lowStock.length ? 'chip-orange' : 'chip-green')
              }
            >
              {a.lowStock.length} low
            </span>
          </div>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{
                width: `${a.skuCount ? Math.round((a.healthyCount / a.skuCount) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="health-cap">
            {a.healthyCount} of {a.skuCount} SKUs healthy
          </p>
          {a.lowStock.length ? (
            <ul className="low-list">
              {a.lowStock.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <span className="emoji-box sm">{p.emoji}</span>
                  <div className="tp-meta">
                    <span className="tp-name">{p.name}</span>
                    <span className="tp-sold">
                      {p.stock} {p.unit}s left
                    </span>
                  </div>
                  <span className="chip chip-red">
                    <Icon name="alert" size={12} /> Low
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock text="Everything is well stocked. 🎉" />
          )}
        </article>
      </section>
    </>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="empty-block">
      <Icon name="box" size={24} />
      <p>{text}</p>
    </div>
  )
}
