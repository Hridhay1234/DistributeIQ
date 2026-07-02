import { useId } from 'react'

type Props = {
  values: number[]
  color?: string
  width?: number
  height?: number
  fill?: boolean
}

/** Tiny inline trend line for stat cards. */
export default function Sparkline({
  values,
  color = 'var(--green-600)',
  width = 110,
  height = 44,
  fill = true,
}: Props) {
  const gid = useId().replace(/:/g, '')
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)
  const pts = values.map((v, i) => {
    const x = i * step
    const y = height - 4 - ((v - min) / range) * (height - 8)
    return [x, y] as const
  })

  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [x, y] = pts[i]
    const cx = (px + x) / 2
    d += ` Q ${px} ${py}, ${cx} ${(py + y) / 2} T ${x} ${y}`
  }
  const areaD = `${d} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#spark-${gid})`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
