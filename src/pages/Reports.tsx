import { useMemo } from 'react'
import Topbar from '../components/Topbar'
import Icon, { type IconName } from '../components/Icon'
import LineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import { useData } from '../context/DataContext'
import { computeAnalytics } from '../lib/analytics'
import { computeDemand, type DemandLevel } from '../lib/demand'
import { formatINR } from '../data/mock'
import './dashboard.css'

const DEMAND_CHIP: Record<DemandLevel, string> = {
  high: 'chip-green',
  medium: 'chip-orange',
  low: 'chip-red',
}
const DEMAND_LABEL: Record<DemandLevel, string> = {
  high: 'High demand',
  medium: 'Medium demand',
  low: 'Low demand',
}

export default function Reports() {
  const { products, sales, bills } = useData()
  const a = useMemo(
    () => computeAnalytics(products, sales, bills),
    [products, sales, bills],
  )
  const demand = useMemo(
    () => computeDemand(products, sales),
    [products, sales],
  )

  const kpis: {
    label: string
    value: string
    delta: string
    up: boolean
    icon: IconName
  }[] = [
    {
      label: 'Gross sales (7d)',
      value: formatINR(a.revenue7d),
      delta: `${a.revenueDelta.delta}%`,
      up: a.revenueDelta.up,
      icon: 'rupee',
    },
    {
      label: a.estProfit7d >= 0 ? 'Profit (7d)' : 'Loss (7d)',
      value: formatINR(Math.abs(a.estProfit7d)),
      delta: `${a.profitDelta.delta}%`,
      up: a.profitDelta.up,
      icon: a.estProfit7d >= 0 ? 'trend-up' : 'trend-down',
    },
    {
      label: 'Profit margin',
      value: `${a.marginPct}%`,
      delta: `${formatINR(a.avgBasket)} avg basket`,
      up: a.marginPct >= 0,
      icon: 'percent',
    },
    {
      label: 'Units sold (7d)',
      value: a.units7d.toLocaleString('en-IN'),
      delta: `${a.unitsDelta.delta}%`,
      up: a.unitsDelta.up,
      icon: 'box',
    },
  ]

  return (
    <>
      <Topbar
        title="Reports & Analytics"
        subtitle="Your store's performance at a glance"
      />

      <section className="stat-grid">
        {kpis.map((k) => (
          <article key={k.label} className="stat-card">
            <div className="stat-top">
              <span className="stat-ic ic-green">
                <Icon name={k.icon} size={20} />
              </span>
              <span className="stat-label">{k.label}</span>
            </div>
            <div className="stat-body">
              <div>
                <div className="stat-value">{k.value}</div>
                <div className={'stat-delta ' + (k.up ? 'up' : 'down')}>
                  <Icon name={k.up ? 'trend-up' : 'trend-down'} size={14} />
                  {k.delta}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid-2">
        <article className="card chart-card">
          <div className="card-head">
            <div>
              <h2 className="section-title">7-Day Sales</h2>
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
              This week <Icon name="chevron-down" size={15} />
            </button>
          </div>
          <LineChart data={a.trend} height={250} highlightIndex={5} />
        </article>

        <article className="card chart-card">
          <div className="card-head">
            <h2 className="section-title">Category Mix</h2>
          </div>
          {a.categoryTotal > 0 ? (
            <div className="donut-wrap">
              <DonutChart
                data={a.categorySplit}
                centerTop={(a.categoryTotal / 1000).toFixed(1) + 'k'}
                centerSub="this month"
              />
              <ul className="legend">
                {a.categorySplit.map((c) => (
                  <li key={c.label}>
                    <span className="dot" style={{ background: c.color }} />
                    <span className="lg-label">{c.label}</span>
                    <span className="lg-val">
                      {Math.round((c.value / a.categoryTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-block">
              <Icon name="reports" size={24} />
              <p>No category data yet.</p>
            </div>
          )}
        </article>
      </section>

      <section className="grid-2 grid-even">
        <article className="card">
          <div className="card-head">
            <h2 className="section-title">Best Sellers</h2>
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
                    <span className="tp-sold">{p.sold} units sold</span>
                  </div>
                  <span className="tp-rev">{formatINR(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-block">
              <Icon name="box" size={24} />
              <p>No sales recorded yet.</p>
            </div>
          )}
        </article>

        <article className="card">
          <div className="card-head">
            <h2 className="section-title">Export & share</h2>
          </div>
          <p className="muted" style={{ marginBottom: 18 }}>
            Send a clean weekly summary to your accountant or on WhatsApp.
          </p>
          <div className="export-grid">
            <button className="export-btn">
              <Icon name="reports" size={22} />
              <span>PDF report</span>
            </button>
            <button className="export-btn">
              <Icon name="box" size={22} />
              <span>Excel sheet</span>
            </button>
            <button className="export-btn">
              <Icon name="phone" size={22} />
              <span>WhatsApp</span>
            </button>
            <button className="export-btn">
              <Icon name="snapshot" size={22} />
              <span>Save snapshot</span>
            </button>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2 className="section-title">Demand Insights</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Based on sales velocity — last 14 days vs. the 14 days before
            </p>
          </div>
        </div>
        {demand.length ? (
          <ul className="top-list">
            {demand.slice(0, 10).map((d) => (
              <li key={d.productId}>
                <span className="emoji-box">{d.emoji}</span>
                <div className="tp-meta">
                  <span className="tp-name">{d.name}</span>
                  <span className="tp-sold">
                    {d.unitsPerDay}/day · {d.category}
                    {d.daysOfStock !== null &&
                      ` · ${d.daysOfStock}d of stock left`}
                  </span>
                </div>
                <span className={'chip ' + DEMAND_CHIP[d.level]}>
                  <Icon
                    name={d.trendPct >= 0 ? 'trend-up' : 'trend-down'}
                    size={12}
                  />
                  {DEMAND_LABEL[d.level]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-block">
            <Icon name="reports" size={24} />
            <p>No sales recorded yet — demand shows up once items start selling.</p>
          </div>
        )}
      </section>
    </>
  )
}
