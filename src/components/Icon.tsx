import type { CSSProperties } from 'react'

type IconProps = {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}

export type IconName =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'scan'
  | 'reports'
  | 'settings'
  | 'help'
  | 'logout'
  | 'search'
  | 'bell'
  | 'arrow-up-right'
  | 'trend-up'
  | 'trend-down'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'plus'
  | 'minus'
  | 'filter'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'camera'
  | 'upload'
  | 'sparkle'
  | 'edit'
  | 'box'
  | 'cart'
  | 'users'
  | 'rupee'
  | 'store'
  | 'phone'
  | 'shield'
  | 'alert'
  | 'snapshot'
  | 'menu'
  | 'image'
  | 'refresh'
  | 'receipt'
  | 'percent'
  | 'wallet'

const paths: Record<IconName, string> = {
  dashboard:
    'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z',
  sales:
    'M3 3v18h18M7 14l3-3 3 3 5-6',
  inventory:
    'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
  scan:
    'M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M4 12h16',
  reports:
    'M5 21V9M12 21V3M19 21v-6',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
  help:
    'M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01',
  logout:
    'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  search:
    'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
  bell:
    'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  'arrow-up-right': 'M7 17L17 7M9 7h8v8',
  'trend-up': 'M3 17l6-6 4 4 8-8M21 7v6h-6',
  'trend-down': 'M3 7l6 6 4-4 8 8M21 17v-6h-6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  filter: 'M3 5h18M6 12h12M10 19h4',
  check: 'M20 6L9 17l-5-5',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  close: 'M18 6L6 18M6 6l12 12',
  camera:
    'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
  upload:
    'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  sparkle:
    'M12 3l1.9 5.8L20 10.7l-5.4 2 -1.6 6 -2-5.9L5 11l6-1.8zM19 4v3M20.5 5.5h-3',
  edit:
    'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z',
  box:
    'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12',
  cart:
    'M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6',
  users:
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  rupee: 'M6 3h12M6 8h12M16 3c0 5-3 6.5-7 7 5 0 7 3 4 11',
  store:
    'M3 9l1.5-5h15L21 9M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18M9 20v-6h6v6',
  phone:
    'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert:
    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  snapshot:
    'M3 7h4l2-3h6l2 3h4a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1zM12 16a3 3 0 100-6 3 3 0 000 6z',
  menu: 'M3 12h18M3 6h18M3 18h18',
  image:
    'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21',
  refresh:
    'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  receipt:
    'M5 2v20l2.5-1.5L10 22l2-1.5L14 22l2.5-1.5L19 22V2l-2.5 1.5L14 2l-2 1.5L10 2 7.5 3.5zM8 7h8M8 11h8M8 15h5',
  percent: 'M19 5L5 19M6.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  wallet:
    'M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3M21 12h-5a2 2 0 000 4h5a1 1 0 001-1v-2a1 1 0 00-1-1z',
}

const filled: Partial<Record<IconName, boolean>> = {
  rupee: false,
}

export default function Icon({
  name,
  size = 22,
  className,
  style,
  strokeWidth = 1.9,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled[name] ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
