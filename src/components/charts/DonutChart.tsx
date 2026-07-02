type Slice = { label: string; value: number; color: string }

type Props = {
  data: Slice[]
  size?: number
  centerTop?: string
  centerSub?: string
}

/** Donut / ring chart with rounded segment gaps, plain SVG. */
export default function DonutChart({
  data,
  size = 220,
  centerTop,
  centerSub,
}: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const stroke = 26
  const r = (size - stroke) / 2 - 6
  const c = size / 2
  const circumference = 2 * Math.PI * r
  const gap = 0.04 * circumference // gap between segments

  let offset = 0
  const segments = data.map((d) => {
    const frac = d.value / total
    const len = Math.max(frac * circumference - gap, 0)
    const seg = {
      ...d,
      dash: `${len} ${circumference - len}`,
      dashoffset: -offset,
    }
    offset += frac * circumference
    return seg
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${c} ${c})`}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={s.dash}
            strokeDashoffset={s.dashoffset}
          />
        ))}
      </g>
      {centerTop && (
        <text
          x={c}
          y={c - 2}
          textAnchor="middle"
          fontSize="30"
          fontWeight="800"
          fill="var(--ink)"
        >
          {centerTop}
        </text>
      )}
      {centerSub && (
        <text
          x={c}
          y={c + 22}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--green-700)"
        >
          {centerSub}
        </text>
      )}
    </svg>
  )
}
