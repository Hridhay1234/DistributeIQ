import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { formatINR } from '../data/mock'
import {
  fileToDataUrl,
  isGroqConfigured,
  scanBill,
  type ScannedItem,
} from '../lib/groq'
import './billscan.css'

type Stage = 'upload' | 'parsing' | 'review' | 'applied' | 'error'
type Tab = 'scan' | 'history'

type Line = ScannedItem & { id: string }

const STEPS = [
  'Reading the image',
  'Extracting line items',
  'Matching to your SKUs',
  'Calculating totals',
]

let lineSeq = 0

export default function BillScan() {
  const navigate = useNavigate()
  const { products, bills, applyBill } = useData()

  const [tab, setTab] = useState<Tab>('scan')
  const [stage, setStage] = useState<Stage>('upload')
  const [activeStep, setActiveStep] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [supplier, setSupplier] = useState('Supplier bill')
  const [billDate, setBillDate] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // cycle the parsing steps while we await the real API response
  useEffect(() => {
    if (stage !== 'parsing') return
    setActiveStep(0)
    const t = setInterval(
      () => setActiveStep((s) => (s + 1) % STEPS.length),
      1100,
    )
    return () => clearInterval(t)
  }, [stage])

  const matchOf = useMemo(() => {
    const byName = new Map(products.map((p) => [p.name.toLowerCase(), p.id]))
    return (name: string) => byName.get(name.toLowerCase())
  }, [products])

  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0)
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)
  const matchedCount = lines.filter((l) => matchOf(l.name)).length

  const onFile = async (file?: File) => {
    if (!file) return
    setError('')
    setStage('parsing')
    try {
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
      const result = await scanBill(dataUrl)
      setSupplier(result.supplier)
      setBillDate(result.date)
      setLines(result.items.map((it) => ({ ...it, id: `l${lineSeq++}` })))
      setStage('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed. Please try again.')
      setStage('error')
    }
  }

  const setQty = (id: string, d: number) =>
    setLines((ls) =>
      ls.map((l) => (l.id === id ? { ...l, qty: Math.max(0, l.qty + d) } : l)),
    )
  const setName = (id: string, name: string) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, name } : l)))
  const setCost = (id: string, cost: number) =>
    setLines((ls) =>
      ls.map((l) => (l.id === id ? { ...l, cost: Math.max(0, cost) } : l)),
    )
  const remove = (id: string) => setLines((ls) => ls.filter((l) => l.id !== id))

  const apply = async () => {
    setApplying(true)
    try {
      await applyBill(
        supplier,
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
    setLines([])
    setPreview(null)
    setError('')
    setStage('upload')
  }

  return (
    <>
      <Topbar
        title="Bill Scanning"
        subtitle="Snap a supplier bill — AI turns it into stock in seconds"
        search={false}
      />

      {/* Tabs */}
      <div className="scan-tabs">
        <button
          className={'scan-tab' + (tab === 'scan' ? ' on' : '')}
          onClick={() => setTab('scan')}
        >
          <Icon name="scan" size={17} /> Scan a bill
        </button>
        <button
          className={'scan-tab' + (tab === 'history' ? ' on' : '')}
          onClick={() => setTab('history')}
        >
          <Icon name="reports" size={17} /> Recorded bills
          <span className="scan-tab-badge">{bills.length}</span>
        </button>
      </div>

      {tab === 'history' ? (
        <BillHistory />
      ) : (
        <>
          {stage !== 'error' && (
            <div className="scan-rail">
              {(['upload', 'parsing', 'review', 'applied'] as Stage[]).map(
                (s, i) => {
                  const order = ['upload', 'parsing', 'review', 'applied']
                  const cur = order.indexOf(stage)
                  const labels = ['Upload', 'AI parse', 'Review', 'Applied']
                  return (
                    <div
                      key={s}
                      className={
                        'rail-step' +
                        (i < cur ? ' done' : i === cur ? ' active' : '')
                      }
                    >
                      <span className="rail-dot">
                        {i < cur ? <Icon name="check" size={14} /> : i + 1}
                      </span>
                      {labels[i]}
                      {i < 3 && <span className="rail-line" />}
                    </div>
                  )
                },
              )}
            </div>
          )}

          {stage === 'upload' && (
            <div className="scan-upload fade-up">
              <label
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  onFile(e.dataTransfer.files?.[0])
                }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <span className="dz-ic">
                  <Icon name="camera" size={34} />
                </span>
                <h3>Snap or upload a bill</h3>
                <p>Drag a photo here, or tap to use your camera</p>
                <span className="btn btn-primary">
                  <Icon name="upload" size={18} /> Choose bill image
                </span>
              </label>

              <div className="scan-tips card">
                <h4>
                  <Icon name="sparkle" size={18} /> Powered by Llama-4 Scout
                </h4>
                <ul>
                  <li>
                    <Icon name="check-circle" size={16} /> Handwritten or printed
                  </li>
                  <li>
                    <Icon name="check-circle" size={16} /> Crumpled, faded,
                    angled
                  </li>
                  <li>
                    <Icon name="check-circle" size={16} /> Auto-matches to your
                    SKUs
                  </li>
                  <li>
                    <Icon name="check-circle" size={16} /> Hindi + English mixed
                  </li>
                </ul>
                {!isGroqConfigured && (
                  <div className="scan-config-warn">
                    <Icon name="alert" size={16} />
                    <span>
                      Add <code>VITE_GROQ_API_KEY</code> to <code>.env.local</code>{' '}
                      and restart to enable scanning.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {stage === 'parsing' && (
            <div className="scan-parsing fade-up">
              <div className="parse-visual">
                <div className="bill-ghost">
                  <span className="scan-line" />
                  {preview ? (
                    <img className="bill-preview" src={preview} alt="bill" />
                  ) : (
                    Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="ghost-row" />
                    ))
                  )}
                </div>
              </div>
              <div className="parse-status">
                <span className="ai-badge">
                  <Icon name="sparkle" size={16} /> AI parsing
                </span>
                <h3>Reading your bill…</h3>
                <div className="parse-bar">
                  <div className="parse-bar-fill indeterminate" />
                </div>
                <ul className="parse-steps">
                  {STEPS.map((s, i) => (
                    <li
                      key={s}
                      className={
                        i < activeStep
                          ? 'done'
                          : i === activeStep
                            ? 'active'
                            : ''
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

          {stage === 'error' && (
            <div className="scan-error fade-up card">
              <span className="scan-error-ic">
                <Icon name="alert" size={30} />
              </span>
              <h3>Couldn't read that bill</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={reset}>
                <Icon name="refresh" size={16} /> Try again
              </button>
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
                    <Icon name="sparkle" size={13} /> AI parsed
                  </span>
                </div>

                <div className="review-list">
                  {lines.map((l) => {
                    const matched = Boolean(matchOf(l.name))
                    return (
                      <div key={l.id} className="review-row">
                        <span className="emoji-box">{l.emoji}</span>
                        <div className="rr-meta">
                          <div className="rr-name-edit">
                            <input
                              className="rr-name-input"
                              value={l.name}
                              onChange={(e) => setName(l.id, e.target.value)}
                              placeholder="Item name"
                              aria-label="Item name"
                            />
                            {matched ? (
                              <span className="chip chip-green tiny">
                                <Icon name="check" size={11} /> matched
                              </span>
                            ) : (
                              <span className="chip chip-orange tiny">
                                new SKU
                              </span>
                            )}
                          </div>
                          <div className="rr-costedit">
                            <Icon name="box" size={12} /> {l.category}
                            <span className="rr-dot">·</span>
                            <span className="rr-costlabel">@ ₹</span>
                            <input
                              className="rr-cost-input"
                              inputMode="numeric"
                              value={l.cost || ''}
                              placeholder="0"
                              onChange={(e) =>
                                setCost(l.id, Number(e.target.value) || 0)
                              }
                              aria-label="Unit cost"
                            />
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
                {preview && (
                  <img className="review-thumb" src={preview} alt="scanned bill" />
                )}
                <h3 className="section-title">Bill summary</h3>
                <div className="rs-line">
                  <span className="muted">Supplier</span>
                  <span>{supplier}</span>
                </div>
                {billDate && (
                  <div className="rs-line">
                    <span className="muted">Bill date</span>
                    <span>{billDate}</span>
                  </div>
                )}
                <div className="rs-line">
                  <span className="muted">Line items</span>
                  <span>{lines.length}</span>
                </div>
                <div className="rs-line">
                  <span className="muted">Total units</span>
                  <span>{totalUnits}</span>
                </div>
                <div className="rs-line total">
                  <span>Bill total</span>
                  <span>{formatINR(total)}</span>
                </div>
                <button
                  className="btn btn-primary block"
                  onClick={apply}
                  disabled={applying || lines.length === 0}
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
                {lines.length} products restocked · {totalUnits} units added ·
                worth {formatINR(total)}. Saved to your bill records.
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
      )}
    </>
  )
}

function BillHistory() {
  const { bills } = useData()

  if (bills.length === 0) {
    return (
      <div className="empty-block" style={{ padding: '60px 16px' }}>
        <Icon name="reports" size={28} />
        <p>No bills recorded yet. Scan your first supplier bill to see it here.</p>
      </div>
    )
  }

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="bill-history fade-up">
      {bills.map((b) => (
        <details key={b.id} className="bill-card">
          <summary>
            <span className="bill-ic">🧾</span>
            <div className="bill-meta">
              <span className="bill-supplier">{b.supplier}</span>
              <span className="bill-sub">
                {fmt(b.date)} · {b.lines.length} items · {b.totalUnits} units
              </span>
            </div>
            <span className="bill-total">{formatINR(b.total)}</span>
            <Icon name="chevron-down" size={18} />
          </summary>
          <div className="bill-lines">
            {b.lines.map((l, i) => (
              <div key={i} className="bill-line">
                <span className="bill-line-emoji">{l.emoji}</span>
                <span className="bill-line-name">{l.name}</span>
                <span className="bill-line-qty">×{l.qty}</span>
                <span className="bill-line-cost">
                  {formatINR(l.qty * l.cost)}
                </span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
