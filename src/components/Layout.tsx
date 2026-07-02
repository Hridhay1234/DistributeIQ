import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon, { type IconName } from './Icon'
import { useAuth } from '../context/AuthContext'
import './layout.css'

const mainNav: { to: string; label: string; icon: IconName }[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/app/sales', label: 'Daily Sales', icon: 'sales' },
  { to: '/app/inventory', label: 'Shelf Count', icon: 'inventory' },
  { to: '/app/scan', label: 'Bill Scan', icon: 'scan' },
  { to: '/app/reports', label: 'Reports', icon: 'reports' },
]

const otherNav: { to: string; label: string; icon: IconName }[] = [
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
  { to: '/app/help', label: 'Help & Support', icon: 'help' },
]

// bottom-nav (mobile mental model) — the 5 highest-frequency actions
const bottomNav: { to: string; label: string; icon: IconName }[] = [
  { to: '/app/dashboard', label: 'Home', icon: 'dashboard' },
  { to: '/app/sales', label: 'Sales', icon: 'sales' },
  { to: '/app/scan', label: 'Scan', icon: 'scan' },
  { to: '/app/inventory', label: 'Stock', icon: 'inventory' },
  { to: '/app/reports', label: 'Reports', icon: 'reports' },
]

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Icon name="store" size={22} strokeWidth={2.2} />
      </div>
      <div className="brand-text">
        <span className="brand-name">DistributeIQ</span>
        <span className="brand-sub">Kirana OS</span>
      </div>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <nav className="nav">
          <p className="nav-group">Main</p>
          {mainNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <Icon name={n.icon} size={20} />
              <span>{n.label}</span>
            </NavLink>
          ))}

          <p className="nav-group">Other</p>
          {otherNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <Icon name={n.icon} size={20} />
              <span>{n.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="nav-item nav-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={20} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="help-card">
          <div className="help-glow" />
          <p className="help-title">Scan a bill in seconds</p>
          <p className="help-sub">
            Snap a supplier bill — AI updates your stock automatically.
          </p>
          <NavLink to="/app/scan" className="btn btn-primary help-btn">
            <Icon name="camera" size={18} /> Scan now
          </NavLink>
        </div>
      </aside>

      <main className="main" key={pathname}>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {bottomNav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              'bn-item' + (isActive ? ' active' : '')
            }
          >
            <Icon name={n.icon} size={22} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
