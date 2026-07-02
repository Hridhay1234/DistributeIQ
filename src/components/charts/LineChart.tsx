import { useId } from 'react'

type Point = { day: string; value: number }

type Props = {
  data: Point[]
  height?: number
  highlightIndex?: number
}

/** Smooth area + line chart drawn with plain SVG (no chart lib). */
export default function LineChart({ data, height = 240, highlightIndex }: Props) {
  const gid = useId().replace(/:/g, '')
  const W = 720
  const H = height
  const padX = 16
  const padTop = 24
  const padBottom = 34

  const max = Math.max(...data.map((d) => d.value)) * 1.12
  const min = Math.min(...data.map((d) => d.value)) * 0.78
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom

  const xs = data.map((_, i) => padX + (innerW * i) / (data.length - 1))
  const ys = data.map(
    (d) => padTop + innerH - ((d.value - min) / (max - min)) * innerH,
  )

  // Catmull-Rom -> cubic bezier for smooth curve
  const path = () => {
    let d = `M ${xs[0]} ${ys[0]}`
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i === 0 ? 0 : i - 1]
      const y0 = ys[i === 0 ? 0 : i - 1]
      const x1 = xs[i]
      const y1 = ys[i]
      const x2 = xs[i + 1]
      const y2 = ys[i + 1]
      const x3 = xs[i + 2 < xs.length ? i + 2 : i + 1]
      const y3 = ys[i + 2 < ys.length ? i + 2 : i + 1]
      const c1x = x1 + (x2 - x0) / 6
      const c1y = y1 + (y2 - y0) / 6
      const c2x = x2 - (x3 - x1) / 6
      const c2y = y2 - (y3 - y1) / 6
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
    }
    return d
  }

  const line = path()
  const area = `${line} L ${xs[xs.length - 1]} ${padTop + innerH} L ${xs[0]} ${
    padTop + innerH
  } Z`

  const gridLines = 4
  const hi = highlightIndex ?? data.length - 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green-500)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--green-500)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal gridlines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padTop + (innerH * i) / gridLines
        return (
          <line
            key={i}
            x1={padX}
            x2={W - padX}
            y1={y}
            y2={y}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        )
      })}

      {/* highlight band */}
      {hi >= 0 && (
        <rect
          x={xs[hi] - 26}
          y={padTop}
          width="52"
          height={innerH}
          rx="14"
          fill="var(--green-100)"
          opacity="0.7"
        />
      )}

      <path d={area} fill={`url(#area-${gid})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--green-700)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* highlight marker */}
      {hi >= 0 && (
        <>
          <circle cx={xs[hi]} cy={ys[hi]} r="9" fill="#fff" />
          <circle cx={xs[hi]} cy={ys[hi]} r="6" fill="var(--green-700)" />
        </>
      )}

      {/* x labels */}
      {data.map((d, i) => (
        <text
          key={d.day}
          x={xs[i]}
          y={H - 10}
          textAnchor="middle"
          fontSize="13"
          fontWeight={i === hi ? 700 : 500}
          fill={i === hi ? 'var(--green-800)' : 'var(--muted)'}
        >
          {d.day}
        </text>
      ))}
    </svg>
  )
}
