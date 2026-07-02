import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

type Props = {
  title: string
  subtitle?: string
  search?: boolean
}

function initials(name?: string | null) {
  if (!name) return 'ST'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Topbar({ title, subtitle, search = true }: Props) {
  const { store } = useData()
  const { user } = useAuth()

  const ownerName = store?.ownerName ?? user?.displayName ?? 'Store Owner'
  const storeName = store?.storeName ?? 'My Store'
  const photo = store?.photoURL || user?.photoURL || ''

  return (
    <header className="topbar">
      <div className="topbar-titles">
        <h1 className="h-title">{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>

      {search && (
        <div className="search">
          <Icon name="search" size={18} />
          <input placeholder="Search products, bills, customers…" />
        </div>
      )}

      <button className="icon-btn" aria-label="Notifications">
        <Icon name="bell" size={20} />
      </button>

      <div className="user-chip">
        {photo ? (
          <img className="avatar" src={photo} alt={ownerName} />
        ) : (
          <div className="avatar">{initials(ownerName)}</div>
        )}
        <div className="user-meta">
          <span className="user-name">{ownerName}</span>
          <span className="user-mail">{storeName}</span>
        </div>
      </div>
    </header>
  )
}
