import Topbar from '../components/Topbar'
import Icon, { type IconName } from '../components/Icon'
import './settings.css'

const faqs = [
  { q: 'How does bill scanning work?', a: 'Snap any supplier bill — printed or handwritten. Our AI reads it, matches each line to your catalogue, and you just confirm quantities before applying to stock.' },
  { q: 'Can I log sales offline?', a: 'Yes. Daily Sales logs are saved on your phone and sync automatically the moment you’re back online.' },
  { q: 'How do low-stock alerts work?', a: 'Set a reorder level per SKU. When the shelf count drops to or below it, you get a WhatsApp nudge so you never run dry.' },
  { q: 'Is my data safe?', a: 'All data is encrypted and backed up daily. Only you and people you invite can see your store’s numbers.' },
]

const channels: { icon: IconName; title: string; sub: string; accent: string }[] = [
  { icon: 'phone', title: 'WhatsApp support', sub: 'Reply within 5 min, 9 AM–9 PM', accent: 'ic-green' },
  { icon: 'help', title: 'Call us', sub: '1800-123-4567 · toll free', accent: 'ic-blue' },
  { icon: 'reports', title: 'Video guides', sub: '12 short how-to videos', accent: 'ic-purple' },
]

export default function Help() {
  return (
    <>
      <Topbar
        title="Help & Support"
        subtitle="We’re here whenever you need a hand"
      />

      <section className="help-channels">
        {channels.map((c) => (
          <button key={c.title} className="card channel">
            <span className={'stat-ic ' + c.accent}>
              <Icon name={c.icon} size={22} />
            </span>
            <div>
              <div className="ch-title">{c.title}</div>
              <div className="muted">{c.sub}</div>
            </div>
            <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </section>

      <article className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 18 }}>
          Frequently asked
        </h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq">
              <summary>
                {f.q}
                <Icon name="chevron-down" size={18} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </article>
    </>
  )
}
