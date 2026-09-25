import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { mergeCatalogAndProducts } from '../lib/items'
import { buildTrends, STATUS_LABEL, type TrendMatch } from '../lib/trends'
import { formatINR } from '../data/mock'
import './trends.css'

type Tab = 'season' | 'festivals' | 'india'

const MONTH = new Intl.DateTimeFormat('en-IN', { month: 'long' })

export default function Trends() {
  const { catalog, products } = useData()
  const [params, setParams] = useSearchParams()
  const tab: Tab = (['season', 'festivals', 'india'] as const).includes(
    params.get('tab') as Tab,
  )
    ? (params.get('tab') as Tab)
    : 'season'

  const now = useMemo(() => new Date(), [])
  const items = useMemo(
    () => mergeCatalogAndProducts(catalog, products),
    [catalog, products],
  )
  const t = useMemo(() => buildTrends(now, items), [now, items])

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'season', label: `${t.season.emoji} ${t.season.title}`, count: t.season.items.length },
    {
      id: 'festivals',
      label: '🪔 Festivals',
      count: t.festivals.reduce((s, f) => s + f.items.length, 0),
    },
    { id: 'india', label: '🇮🇳 Across India', count: t.india.length },
  ]

  const all = [...t.season.items, ...t.festivals.flatMap((f) => f.items), ...t.india]
  const gaps = all.filter((i) => i.status === 'low' || i.status === 'out').length

  return (
    <>
      <Topbar
        title="Trending Products"
        subtitle={`What Indian shoppers are buying this ${MONTH.format(now)}`}
        search={false}
      />

      <section className="tr-hero">
        <div className="tr-hero-main">
          <span className="tr-hero-emoji">{t.season.emoji}</span>
          <div>
            <p className="tr-hero-kicker">Season now</p>
            <h2 className="tr-hero-title">{t.season.title}</h2>
            <p className="tr-hero-blurb">{t.season.blurb}</p>
          </div>
        </div>
        {t.festivals.length > 0 && (
          <div className="tr-hero-fests">
            <p className="tr-hero-kicker">Festivals ahead</p>
            <div className="tr-fest-pills">
              {t.festivals.map((f) => (
                <span key={f.id} className="tr-fest-pill">
                  {f.emoji} {f.title}
                  <small>{f.when}</small>
                </span>
              ))}
            </div>
          </div>
        )}
        {gaps > 0 && (
          <Link to="/app/inventory" className="tr-hero-alert">
            <Icon name="alert" size={16} />
            {gaps} trending {gaps === 1 ? 'item is' : 'items are'} low or out on
            your shelf
            <Icon name="chevron-right" size={16} />
          </Link>
        )}
      </section>

      <div className="tr-tabs" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={tab === x.id}
            className={'tr-tab' + (tab === x.id ? ' on' : '')}
            onClick={() => setParams({ tab: x.id }, { replace: true })}
          >
            {x.label}
            <span className="tr-tab-count">{x.count}</span>
          </button>
        ))}
      </div>

      {tab === 'season' && <TrendGrid items={t.season.items} />}

      {tab === 'festivals' &&
        (t.festivals.length ? (
          t.festivals.map((f) => (
            <section key={f.id} className="tr-section">
              <div className="tr-section-head">
                <h3>
                  {f.emoji} {f.title}
                </h3>
                <span className={'chip ' + (f.status === 'now' ? 'chip-green' : 'chip-orange')}>
                  {f.status === 'now' ? 'This month' : 'Next month'} · {f.when}
                </span>
              </div>
              <p className="tr-section-blurb">{f.blurb}</p>
              <TrendGrid items={f.items} />
            </section>
          ))
        ) : (
          <div className="empty-block">
            <Icon name="sparkle" size={24} />
            <p>No major festivals this month or next.</p>
          </div>
        ))}

      {tab === 'india' && (
        <>
          <p className="tr-section-blurb">
            Categories growing fast with Indian shoppers all year round.
          </p>
          <TrendGrid items={t.india} />
        </>
      )}

      <p className="tr-note">
        <Icon name="help" size={14} /> A curated guide based on typical
        seasonal and festival demand in Indian kirana stores, not live market
        data.
      </p>
    </>
  )
}

function TrendGrid({ items }: { items: TrendMatch[] }) {
  return (
    <div className="tr-grid">
      {items.map((i) => (
        <article key={i.name} className="tr-card">
          <span className="emoji-box">{i.emoji}</span>
          <div className="tr-card-body">
            <div className="tr-card-name">{i.name}</div>
            <div className="tr-card-reason">{i.reason}</div>
            <div className="tr-card-foot">
              <span className="tr-cat">{i.category}</span>
              <StatusChip item={i} />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function StatusChip({ item }: { item: TrendMatch }) {
  const p = item.product
  const detail =
    item.status === 'ok' || item.status === 'low'
      ? ` · ${p!.stock} left`
      : item.status === 'catalog' && p
        ? ` · ${formatINR(p.price)}`
        : ''
  return (
    <span className={'tr-status s-' + item.status} title={p?.name}>
      <span className="tr-status-dot" />
      {STATUS_LABEL[item.status]}
      {detail}
    </span>
  )
}
