import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { formatINR } from '../data/mock'
import './billscan.css'

type Stage = 'upload' | 'parsing' | 'review' | 'applied'

type ParsedLine = {
  id: string
  raw: string
  name: string
  emoji: string
  category: string
  qty: number
  cost: number
  confidence: number
}

// Simulated OCR/AI output (the parse step mimics latency + steps).
const PARSED: ParsedLine[] = [
  { id: 'l1', raw: 'MAGGI MASALA 70G x24', name: 'Maggi 2-Min Noodles', emoji: '🍜', category: 'Snacks', qty: 24, cost: 11, confidence: 0.98 },
  { id: 'l2', raw: 'AMUL TAAZA 500ML x40', name: 'Amul Taaza Milk 500ml', emoji: '🥛', category: 'Dairy', qty: 40, cost: 24, confidence: 0.96 },
  { id: 'l3', raw: 'PARLE G GLUCO 800', name: 'Parle-G Biscuit', emoji: '🍪', category: 'Snacks', qty: 30, cost: 8, confidence: 0.94 },
  { id: 'l4', raw: 'FRTUNE SNFLWR OIL 1L x12', name: 'Fortune Sunflower Oil 1L', emoji: '🛢️', category: 'Staples', qty: 12, cost: 132, confidence: 0.88 },
  { id: 'l5', raw: 'TATA SALT IODISD 1KG', name: 'Tata Salt 1kg', emoji: '🧂', category: 'Staples', qty: 20, cost: 24, confidence: 0.91 },
  { id: 'l6', raw: 'HALDIRAM ALOO BHUJIA 200', name: 'Haldiram Aloo Bhujia 200g', emoji: '🥨', category: 'Snacks', qty: 18, cost: 42, confidence: 0.72 },
]

const STEPS = [
  'Reading image',
  'Extracting line items',
  'Matching to your SKUs',
  'Calculating totals',
]

export default function BillScan() {
  const navigate = useNavigate()
  const { products, applyBill } = useData()
  const [stage, setStage] = useState<Stage>('upload')
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState<ParsedLine[]>(PARSED)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (stage !== 'parsing') return
    setProgress(0)
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setStage('review')
          return 100
        }
        return p + 4
      })
    }, 70)
    return () => clearInterval(t)
  }, [stage])

  // resolve each parsed line against the live catalogue (by name)
  const matchOf = useMemo(() => {
    const byName = new Map(products.map((p) => [p.name.toLowerCase(), p.id]))
    return (name: string) => byName.get(name.toLowerCase())
  }, [products])

  const activeStep = Math.min(STEPS.length - 1, Math.floor(progress / 25))
  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0)
  const matchedCount = lines.filter((l) => matchOf(l.name)).length

  const setQty = (id: string, d: number) =>
    setLines((ls) =>
      ls.map((l) => (l.id === id ? { ...l, qty: Math.max(0, l.qty + d) } : l)),
    )
  const remove = (id: string) => setLines((ls) => ls.filter((l) => l.id !== id))

  const apply = async () => {
    setApplying(true)
    try {
      await applyBill(
        'Krishna Distributors',
        lines
          .filter((l) => l.qty > 0)
          .map((l) => ({
            name: l.name,
            emoji: l.emoji,
            qty: l.qty,
            cost: l.cost,
            category: l.category,
            productId: matchOf(l.name),
          })),
      )
      setStage('applied')
    } finally {
      setApplying(false)
    }
  }

  const reset = () => {
    setLines(PARSED)
    setStage('upload')
  }

  return (
    <>
      <Topbar
        title="Bill Scanning"
        subtitle="Snap a supplier bill — AI turns it into stock in seconds"
        search={false}
      />

      <div className="scan-rail">
        {(['upload', 'parsing', 'review', 'applied'] as Stage[]).map((s, i) => {
          const order = ['upload', 'parsing', 'review', 'applied']
          const cur = order.indexOf(stage)
          const labels = ['Upload', 'AI parse', 'Review', 'Applied']
          return (
            <div
              key={s}
              className={
                'rail-step' + (i < cur ? ' done' : i === cur ? ' active' : '')
              }
            >
              <span className="rail-dot">
                {i < cur ? <Icon name="check" size={14} /> : i + 1}
              </span>
              {labels[i]}
              {i < 3 && <span className="rail-line" />}
            </div>
          )
        })}
      </div>

      {stage === 'upload' && (
        <div className="scan-upload fade-up">
          <label className="dropzone">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={() => setStage('parsing')}
            />
            <span className="dz-ic">
              <Icon name="camera" size={34} />
            </span>
            <h3>Snap or upload a bill</h3>
            <p>Drag a photo here, or tap to use your camera</p>
            <span
              className="btn btn-primary"
              onClick={() => setStage('parsing')}
            >
              <Icon name="upload" size={18} /> Choose bill image
            </span>
          </label>

          <div className="scan-tips card">
            <h4>
              <Icon name="sparkle" size={18} /> Works with messy bills
            </h4>
            <ul>
              <li>
                <Icon name="check-circle" size={16} /> Handwritten or printed
              </li>
              <li>
                <Icon name="check-circle" size={16} /> Crumpled, faded, angled
              </li>
              <li>
                <Icon name="check-circle" size={16} /> Auto-matches to your SKUs
              </li>
              <li>
                <Icon name="check-circle" size={16} /> Hindi + English mixed
              </li>
            </ul>
            <div className="recent-scans">
              <span className="muted">Recent scans</span>
              <div className="rs-thumbs">
                <span>🧾</span>
                <span>🧾</span>
                <span>🧾</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'parsing' && (
        <div className="scan-parsing fade-up">
          <div className="parse-visual">
            <div className="bill-ghost">
              <span className="scan-line" />
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="ghost-row" />
              ))}
            </div>
          </div>
          <div className="parse-status">
            <span className="ai-badge">
              <Icon name="sparkle" size={16} /> AI parsing
            </span>
            <h3>Reading your bill…</h3>
            <div className="parse-bar">
              <div className="parse-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <ul className="parse-steps">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={
                    i < activeStep ? 'done' : i === activeStep ? 'active' : ''
                  }
                >
                  <span className="ps-dot">
                    {i < activeStep ? (
                      <Icon name="check" size={12} />
                    ) : (
                      <Icon name="sparkle" size={12} />
                    )}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {stage === 'review' && (
        <div className="scan-review fade-up">
          <div className="review-main card">
            <div className="card-head">
              <div>
                <h2 className="section-title">Review parsed items</h2>
                <p className="muted" style={{ marginTop: 4 }}>
                  {lines.length} items found · {matchedCount} matched to your
                  catalogue
                </p>
              </div>
              <span className="chip chip-green">
                <Icon name="sparkle" size={13} /> 94% confidence
              </span>
            </div>

            <div className="review-list">
              {lines.map((l) => {
                const matched = Boolean(matchOf(l.name))
                return (
                  <div key={l.id} className="review-row">
                    <span className="emoji-box">{l.emoji}</span>
                    <div className="rr-meta">
                      <div className="rr-name">
                        {l.name}
                        {matched ? (
                          <span className="chip chip-green tiny">
                            <Icon name="check" size={11} /> matched
                          </span>
                        ) : (
                          <span className="chip chip-orange tiny">new SKU</span>
                        )}
                      </div>
                      <div className="rr-raw">
                        <Icon name="image" size={12} /> {l.raw}
                      </div>
                    </div>

                    <div className="rr-qty">
                      <button
                        className="step-btn sm"
                        onClick={() => setQty(l.id, -1)}
                      >
                        <Icon name="minus" size={15} />
                      </button>
                      <span>{l.qty}</span>
                      <button
                        className="step-btn sm plus"
                        onClick={() => setQty(l.id, 1)}
                      >
                        <Icon name="plus" size={15} />
                      </button>
                    </div>

                    <div className="rr-cost">
                      <span className="muted">@ {formatINR(l.cost)}</span>
                      <strong>{formatINR(l.qty * l.cost)}</strong>
                    </div>

                    <button
                      className="rr-del"
                      onClick={() => remove(l.id)}
                      aria-label="remove"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="review-side card">
            <h3 className="section-title">Bill summary</h3>
            <div className="rs-line">
              <span className="muted">Supplier</span>
              <span>Krishna Distributors</span>
            </div>
            <div className="rs-line">
              <span className="muted">Line items</span>
              <span>{lines.length}</span>
            </div>
            <div className="rs-line">
              <span className="muted">Total units</span>
              <span>{lines.reduce((s, l) => s + l.qty, 0)}</span>
            </div>
            <div className="rs-line total">
              <span>Bill total</span>
              <span>{formatINR(total)}</span>
            </div>
            <button
              className="btn btn-primary block"
              onClick={apply}
              disabled={applying}
            >
              <Icon name="check-circle" size={18} />
              {applying ? 'Applying…' : 'Apply to inventory'}
            </button>
            <button
              className="btn btn-outline block"
              onClick={reset}
              style={{ marginTop: 10 }}
            >
              <Icon name="refresh" size={16} /> Rescan
            </button>
          </aside>
        </div>
      )}

      {stage === 'applied' && (
        <div className="scan-done fade-up">
          <div className="done-ic">
            <Icon name="check" size={44} strokeWidth={2.6} />
          </div>
          <h2>Inventory updated 🎉</h2>
          <p>
            {lines.length} products restocked ·{' '}
            {lines.reduce((s, l) => s + l.qty, 0)} units added · worth{' '}
            {formatINR(total)}.
          </p>
          <div className="done-actions">
            <button className="btn btn-primary" onClick={reset}>
              <Icon name="camera" size={18} /> Scan another bill
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/app/inventory')}
            >
              <Icon name="inventory" size={18} /> View inventory
            </button>
          </div>
        </div>
      )}
    </>
  )
}
