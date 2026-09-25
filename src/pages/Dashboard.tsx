import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon, { type IconName } from '../components/Icon'
import Sparkline from '../components/Sparkline'
import LineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import Tour from '../components/Tour'
import Dropdown from '../components/Dropdown'
import { useData } from '../context/DataContext'
import {
  computeAnalytics,
  categorySplitFor,
  dailyRevenue,
  recentOrdersFor,
  topProductsBy,
} from '../lib/analytics'
import { mergeCatalogAndProducts } from '../lib/items'
import { buildTrends, STATUS_LABEL, type TrendMatch } from '../lib/trends'
import { formatINR } from '../data/mock'
import './dashboard.css'

type TrendRange = '7d' | '30d'
type CatRange = 'week' | 'month' | 'all'
type TopSort = 'revenue' | 'units'
type OrdersRange = 'today' | 'week' | 'all'

export default function Dashboard() {
  const { catalog, products, sales, bills, store, updateStore } = useData()
  const a = useMemo(
    () => computeAnalytics(products, sales, bills),
    [products, sales, bills],
  )

  const [trendRange, setTrendRange] = useState<TrendRange>('7d')
  const trend = useMemo(
    () => dailyRevenue(sales, trendRange === '7d' ? 7 : 30),
    [sales, trendRange],
  )

  const [catRange, setCatRange] = useState<CatRange>('month')
  const { split: categorySplit, total: categoryTotal } = useMemo(
    () =>
      categorySplitFor(
        products,
        sales,
        catRange === 'week' ? 7 : catRange === 'month' ? 30 : null,
      ),
    [products, sales, catRange],
  )

  const [topSort, setTopSort] = useState<TopSort>('revenue')
  const topProducts = useMemo(
    () => topProductsBy(sales, topSort, 4),
    [sales, topSort],
  )

  const [ordersRange, setOrdersRange] = useState<OrdersRange>('all')
  const recentOrders = useMemo(
    () => recentOrdersFor(sales, ordersRange, 6),
    [sales, ordersRange],
  )

  const trends = useMemo(
    () => buildTrends(new Date(), mergeCatalogAndProducts(catalog, products)),
    [catalog, products],
  )
  const trendPicks = useMemo(() => {
    const short = (title: string) => title.split(/ [&·] /)[0]
    const fest = trends.festivals[0]
    const tagged = (items: TrendMatch[], n: number, tag: string) =>
      items.slice(0, n).map((i) => ({ ...i, tag }))
    // a mix: the next festival, the season, then national trends
    const picks = [
      ...(fest ? tagged(fest.items, 2, `${fest.emoji} ${short(fest.title)}`) : []),
      ...tagged(trends.season.items, 2, `${trends.season.emoji} ${trends.season.title}`),
      ...tagged(trends.india, 4, '🇮🇳 India'),
    ]
    return picks
      .filter((i, idx) => picks.findIndex((x) => x.name === i.name) === idx)
      .slice(0, 6)
  }, [trends])

  const [tourDismissed, setTourDismissed] = useState(false)
  const showTour = Boolean(store && !store.tourCompleted) && !tourDismissed
  const finishTour = () => {
    setTourDismissed(true)
    updateStore({ tourCompleted: true }).catch(() => {})
  }

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
      {showTour && <Tour onDone={finishTour} />}
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

      <section className="card trend-brief">
        <div className="card-head">
          <div>
            <h2 className="section-title">Trending now</h2>
            <p className="tb-sub">
              {trends.season.emoji} {trends.season.title} season
              {trends.festivals[0] && (
                <>
                  {' · '}
                  {trends.festivals[0].emoji} {trends.festivals[0].title}{' '}
                  {trends.festivals[0].status === 'now' ? 'now' : 'next month'}
                </>
              )}
            </p>
          </div>
          <Link to="/app/trends" className="tb-all">
            View all <Icon name="chevron-right" size={16} />
          </Link>
        </div>
        <div className="tb-row">
          {trendPicks.map((i) => (
            <Link
              key={i.name}
              to="/app/trends"
              className="tb-tile"
              title={i.reason}
            >
              <span className="tb-tag">{i.tag}</span>
              <span className="tb-emoji">{i.emoji}</span>
              <span className="tb-name">{i.name}</span>
              <span className={'tb-status s-' + i.status}>
                <span className="tr-status-dot" />
                {STATUS_LABEL[i.status]}
              </span>
            </Link>
          ))}
        </div>
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
            <Dropdown
              value={trendRange}
              onChange={setTrendRange}
              options={[
                { value: '7d', label: 'Weekly' },
                { value: '30d', label: 'Monthly' },
              ]}
            />
          </div>
          <LineChart
            data={trend}
            height={250}
            highlightIndex={trendRange === '7d' ? 5 : undefined}
          />
        </article>

        <article className="card chart-card">
          <div className="card-head">
            <h2 className="section-title">Sales by Category</h2>
            <Dropdown
              value={catRange}
              onChange={setCatRange}
              options={[
                { value: 'week', label: 'Weekly' },
                { value: 'month', label: 'Monthly' },
                { value: 'all', label: 'All time' },
              ]}
            />
          </div>
          {categoryTotal > 0 ? (
            <div className="donut-wrap">
              <DonutChart
                data={categorySplit}
                centerTop={(categoryTotal / 1000).toFixed(1) + 'k'}
                centerSub="total"
              />
              <ul className="legend">
                {categorySplit.map((c) => (
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
            <Dropdown
              value={topSort}
              onChange={setTopSort}
              options={[
                { value: 'revenue', label: 'Revenue' },
                { value: 'units', label: 'Units' },
              ]}
            />
          </div>
          {topProducts.length ? (
            <ul className="top-list">
              {topProducts.map((p, i) => (
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
            <Dropdown
              value={ordersRange}
              onChange={setOrdersRange}
              filterIcon
              options={[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This week' },
              ]}
            />
          </div>
          {recentOrders.length ? (
            <>
              <ul className="order-list">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <span className="emoji-box sm">{o.emoji}</span>
                    <div className="tp-meta">
                      <span className="tp-name">{o.product}</span>
                      <span className="tp-sold">
                        {o.date} · {o.customer}
                      </span>
                    </div>
                    <span className="tp-rev">{formatINR(o.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="table-scroll orders-table">
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
                    {recentOrders.map((o, i) => (
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
            </>
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
