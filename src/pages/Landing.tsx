import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../components/Icon'
import Sparkline from '../components/Sparkline'
import LineChart from '../components/charts/LineChart'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import './landing.css'

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'sales',
    title: 'One-tap sales logging',
    body: 'Tap + as items sell. Log an entire day of sales in under a minute — no typing, no menus.',
  },
  {
    icon: 'scan',
    title: 'AI bill scanning',
    body: 'Snap a supplier bill. AI reads every line, matches it to your catalogue, and updates stock instantly.',
  },
  {
    icon: 'inventory',
    title: 'Shelf-count inventory',
    body: 'Walk the aisle and update counts on big cards. Low-stock items flag themselves automatically.',
  },
  {
    icon: 'reports',
    title: 'Live analytics',
    body: 'Revenue, profit, best-sellers and 7-day trends — computed live from your own sales, not guesses.',
  },
  {
    icon: 'phone',
    title: 'WhatsApp-simple',
    body: 'Designed for the way you already work. If you can use WhatsApp, you can run your whole shop here.',
  },
  {
    icon: 'shield',
    title: 'Private & secure',
    body: 'Your store, your data. Google sign-in and per-store isolation keep everything locked to you.',
  },
]

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'store',
    title: 'Sign in with Google',
    body: 'Create your store in 10 seconds. No forms, no paperwork.',
  },
  {
    icon: 'scan',
    title: 'Scan your first bill',
    body: 'Photograph a supplier invoice — AI fills your inventory for you.',
  },
  {
    icon: 'trend-up',
    title: 'Watch your shop grow',
    body: 'Log daily sales and see live revenue, profit and stock health.',
  },
]

const STATS = [
  { value: '50+', label: 'Kirana shops' },
  { value: '₹1.5L', label: 'Sales logged' },
  { value: '30 sec', label: 'To log a day' },
  { value: '94%', label: 'Scan accuracy' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { onboarded } = useData()

  const primaryCta = user && onboarded ? 'Go to dashboard' : 'Get started free'
  const go = () => navigate(user && onboarded ? '/app/dashboard' : '/login')

  return (
    <div className="lp">
      {/* Nav */}
      <header className="lp-nav">
        <div className="lp-brand">
          <span className="lp-mark">
            <Icon name="store" size={20} strokeWidth={2.2} />
          </span>
          RetailLens
        </div>
        <nav className="lp-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#scan">Bill scan</a>
        </nav>
        <div className="lp-nav-actions">
          <button className="lp-signin" onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className="btn btn-primary lp-cta-sm" onClick={go}>
            {primaryCta}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <h1>
            The simplest way to run your <span>kirana shop.</span>
          </h1>
          <p>
            Log sales in one tap, scan supplier bills with AI, and see your
            store's real numbers — revenue, profit and stock — live. Built for
            Indian shop owners, simple as WhatsApp.
          </p>
          <div className="lp-hero-actions">
            <button className="btn btn-primary lp-cta" onClick={go}>
              <Icon name="store" size={18} /> {primaryCta}
            </button>
            <a href="#how" className="btn btn-outline lp-cta">
              See how it works
            </a>
          </div>
          <div className="lp-hero-note">
            <Icon name="check-circle" size={16} /> Free to start · No card
            required · Works on any phone
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-mock">
            <div className="lp-mock-head">
              <span className="lp-mock-dot" />
              <span className="lp-mock-dot" />
              <span className="lp-mock-dot" />
              <span className="lp-mock-title">Dashboard</span>
            </div>
            <div className="lp-mock-stat">
              <div>
                <div className="lp-mock-label">Revenue (7 days)</div>
                <div className="lp-mock-value">₹84,580</div>
                <div className="lp-mock-delta">
                  <Icon name="trend-up" size={13} /> 18.2%
                </div>
              </div>
              <Sparkline
                values={[4, 6, 5, 8, 7, 11, 13, 12, 15]}
                color="rgba(255,255,255,0.9)"
                width={120}
              />
            </div>
            <div className="lp-mock-chart">
              <div className="lp-mock-chart-title">Sales trend</div>
              <LineChart
                data={[
                  { day: 'Mon', value: 8400 },
                  { day: 'Tue', value: 9600 },
                  { day: 'Wed', value: 7900 },
                  { day: 'Thu', value: 12400 },
                  { day: 'Fri', value: 14200 },
                  { day: 'Sat', value: 16800 },
                  { day: 'Sun', value: 13500 },
                ]}
                height={150}
                highlightIndex={5}
              />
            </div>
          </div>
          <div className="lp-float lp-float-1">
            <span className="lp-float-ic">🍜</span>
            <div>
              <strong>+24 Maggi</strong>
              <small>from bill scan</small>
            </div>
          </div>
          <div className="lp-float lp-float-2">
            <span className="lp-float-ic green">
              <Icon name="check" size={16} />
            </span>
            <div>
              <strong>Day logged</strong>
              <small>₹6,240 · 38 items</small>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="lp-stats">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat">
            <div className="lp-stat-value">{s.value}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Everything in one app</span>
          <h2>Built for how kirana shops really run</h2>
          <p>
            No accountant, no complex software. Just the handful of things you
            need — done beautifully.
          </p>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <article key={f.title} className="lp-feature">
              <span className="lp-feature-ic">
                <Icon name={f.icon} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Get started in minutes</span>
          <h2>Three steps to a smarter shop</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <article key={s.title} className="lp-step">
              <span className="lp-step-num">{i + 1}</span>
              <span className="lp-step-ic">
                <Icon name={s.icon} size={24} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Bill scan spotlight */}
      <section className="lp-scan" id="scan">
        <div className="lp-scan-copy">
          <span className="lp-eyebrow light">The magic feature</span>
          <h2>Turn a paper bill into stock — instantly</h2>
          <p>
            Photograph any supplier bill — printed or handwritten, English or
            Hindi. Our AI reads every line, matches it to your products, and
            updates inventory. Review, tap save, done.
          </p>
          <ul className="lp-scan-list">
            <li>
              <Icon name="check-circle" size={18} /> Reads messy, crumpled &
              faded bills
            </li>
            <li>
              <Icon name="check-circle" size={18} /> Auto-matches to your
              catalogue
            </li>
            <li>
              <Icon name="check-circle" size={18} /> Creates new products for
              you
            </li>
            <li>
              <Icon name="check-circle" size={18} /> Every bill saved for your
              records
            </li>
          </ul>
          <button className="btn btn-primary lp-cta" onClick={go}>
            <Icon name="scan" size={18} /> Try bill scanning
          </button>
        </div>
        <div className="lp-scan-visual">
          <div className="lp-bill">
            <div className="lp-bill-head">
              <span>🧾 Krishna Distributors</span>
              <span className="lp-bill-scanline" />
            </div>
            {[
              ['🍜', 'Maggi 2-Min Noodles', '×24'],
              ['🥛', 'Amul Taaza Milk', '×40'],
              ['🍪', 'Parle-G Biscuit', '×30'],
              ['🛢️', 'Fortune Oil 1L', '×12'],
            ].map(([e, n, q]) => (
              <div key={n} className="lp-bill-row">
                <span className="lp-bill-emoji">{e}</span>
                <span className="lp-bill-name">{n}</span>
                <span className="lp-bill-q">{q}</span>
                <span className="lp-bill-ok">
                  <Icon name="check" size={13} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-final">
        <h2>Your shop's numbers, finally in your pocket.</h2>
        <p>Join thousands of kirana owners running smarter, calmer shops.</p>
        <button className="btn lp-final-btn" onClick={go}>
          <Icon name="store" size={18} /> {primaryCta}
        </button>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-brand">
          <span className="lp-mark">
            <Icon name="store" size={18} strokeWidth={2.2} />
          </span>
          RetailLens
        </div>
        <span className="lp-foot-copy">
          © 2026 RetailLens · Built for Indian kirana shops
        </span>
      </footer>
    </div>
  )
}
