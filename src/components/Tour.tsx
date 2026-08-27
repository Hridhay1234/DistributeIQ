import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Icon, { type IconName } from './Icon'
import './tour.css'

type Step = {
  target?: string // CSS selector; omit for a centered step
  icon: IconName
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: 'store',
    title: 'Welcome to RetailLens! 👋',
    body: "Let's take a quick 20-second tour of your new store. You can skip anytime.",
  },
  {
    target: '[data-tour="sales"]',
    icon: 'sales',
    title: 'Log daily sales',
    body: 'Search the full product catalogue and tap + as items sell. Saving updates your revenue instantly.',
  },
  {
    target: '[data-tour="scan"]',
    icon: 'scan',
    title: 'Scan supplier bills',
    body: 'Photograph any bill — AI reads it, matches your products, and restocks inventory in seconds.',
  },
  {
    target: '[data-tour="inventory"]',
    icon: 'inventory',
    title: 'Track your shelf',
    body: 'Update counts on big cards and add products. Low-stock items flag themselves automatically.',
  },
  {
    target: '[data-tour="reports"]',
    icon: 'reports',
    title: 'See live analytics',
    body: 'Revenue, profit, best-sellers and trends — all computed live from your real sales.',
  },
  {
    icon: 'check-circle',
    title: "You're all set!",
    body: 'Start by logging a sale or scanning a bill. Your dashboard fills in as you go.',
  },
]

type Rect = { top: number; left: number; width: number; height: number }
const GAP = 14
const MARGIN = 16

export default function Tour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [tip, setTip] = useState<{ top: number; left: number }>({
    top: -9999,
    left: -9999,
  })
  const tipRef = useRef<HTMLDivElement>(null)
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  const measure = useCallback(() => {
    if (!step.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(step.target) as HTMLElement | null
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) {
      setRect(null)
      return
    }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step.target])

  // On each step: scroll the target into view, then measure (after the
  // smooth-scroll settles) — repeated a few times so we catch the final layout.
  useEffect(() => {
    const el = step.target
      ? (document.querySelector(step.target) as HTMLElement | null)
      : null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    const raf = requestAnimationFrame(measure)
    const timers = [
      setTimeout(measure, 120),
      setTimeout(measure, 320),
      setTimeout(measure, 520),
    ]
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [i, step.target, measure])

  // Keep the highlight aligned while the user scrolls/resizes.
  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  // Position the tooltip relative to the highlight, clamped to the viewport.
  useLayoutEffect(() => {
    const el = tipRef.current
    if (!el) return
    const tw = el.offsetWidth
    const th = el.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (!rect) {
      setTip({ top: (vh - th) / 2, left: (vw - tw) / 2 })
      return
    }

    // Prefer the right of the target; fall back to below, then above.
    let left = rect.left + rect.width + GAP
    let top = rect.top
    if (left + tw > vw - MARGIN) {
      left = rect.left
      top = rect.top + rect.height + GAP
      if (top + th > vh - MARGIN) top = rect.top - th - GAP
    }
    left = Math.min(Math.max(MARGIN, left), vw - tw - MARGIN)
    top = Math.min(Math.max(MARGIN, top), vh - th - MARGIN)
    setTip({ top, left })
  }, [rect, i])

  const pad = 8

  return (
    <div className="tour-root">
      {rect ? (
        <div
          className="tour-hole"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      ) : (
        <div className="tour-dim" />
      )}

      <div
        ref={tipRef}
        className="tour-tip"
        style={{ top: tip.top, left: tip.left }}
      >
        <div className="tour-tip-head">
          <span className="tour-ic">
            <Icon name={step.icon} size={20} />
          </span>
          <button className="tour-skip" onClick={onDone}>
            Skip tour
          </button>
        </div>
        <h3>{step.title}</h3>
        <p>{step.body}</p>

        <div className="tour-foot">
          <div className="tour-dots">
            {STEPS.map((_, k) => (
              <span key={k} className={'tour-dot' + (k === i ? ' on' : '')} />
            ))}
          </div>
          <div className="tour-actions">
            {i > 0 && (
              <button
                className="btn btn-outline tour-btn"
                onClick={() => setI((v) => v - 1)}
              >
                Back
              </button>
            )}
            <button
              className="btn btn-primary tour-btn"
              onClick={() => (last ? onDone() : setI((v) => v + 1))}
            >
              {last ? 'Start' : 'Next'}
              {!last && <Icon name="chevron-right" size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
