import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Icon from '../components/Icon'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../data/mock'
import type { Preferences } from '../lib/types'
import './settings.css'

const DEFAULT_PREFS: Preferences = {
  lowStockAlerts: true,
  dailySummary: true,
  autoMatch: true,
  hindiUi: false,
}

const TOGGLE_META: { key: keyof Preferences; label: string; desc: string }[] = [
  { key: 'lowStockAlerts', label: 'Low-stock alerts', desc: 'Notify on WhatsApp when an SKU drops below reorder level' },
  { key: 'dailySummary', label: 'Daily sales summary', desc: 'A 9 PM recap of the day’s sales every night' },
  { key: 'autoMatch', label: 'Auto-match scanned bills', desc: 'Let AI match bill lines to your catalogue automatically' },
  { key: 'hindiUi', label: 'Hindi interface', desc: 'Show labels in Hindi across the app' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { store, products, bills, updateStore, updatePreferences } = useData()
  const { user, logout } = useAuth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)

  useEffect(() => {
    setName(store?.storeName ?? '')
    setAddress(store?.address ?? '')
    setPrefs(store?.preferences ?? DEFAULT_PREFS)
  }, [store])

  const stockValue = products.reduce((s, p) => s + p.stock * p.cost, 0)

  const saveProfile = async () => {
    await updateStore({ storeName: name.trim() || 'My Store', address })
    setEditing(false)
  }

  const flip = (key: keyof Preferences) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    updatePreferences(next).catch(() => {})
  }

  const doLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your store, plan, and alerts" />

      <div className="settings-grid">
        {/* Store profile */}
        <article className="card">
          <div className="set-head">
            <span className="stat-ic ic-green">
              <Icon name="store" size={20} />
            </span>
            <h2 className="section-title">Store profile</h2>
          </div>

          {editing ? (
            <div className="set-edit">
              <label className="field">
                <span>Store name</span>
                <div className="input-wrap">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </label>
              <label className="field">
                <span>Address</span>
                <div className="input-wrap">
                  <input
                    value={address}
                    placeholder="Shop, street, city"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </label>
              <div className="set-edit-actions">
                <button className="btn btn-primary" onClick={saveProfile}>
                  <Icon name="check" size={16} /> Save
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="set-rows">
                <div className="set-row">
                  <span className="muted">Store name</span>
                  <span className="set-val">{store?.storeName ?? '—'}</span>
                </div>
                <div className="set-row">
                  <span className="muted">Owner</span>
                  <span className="set-val">{store?.ownerName ?? '—'}</span>
                </div>
                <div className="set-row">
                  <span className="muted">Email</span>
                  <span className="set-val">
                    {store?.email ?? user?.email ?? '—'}
                  </span>
                </div>
                <div className="set-row">
                  <span className="muted">Address</span>
                  <span className="set-val">{store?.address || 'Not set'}</span>
                </div>
              </div>
              <button
                className="btn btn-outline block"
                style={{ marginTop: 16 }}
                onClick={() => setEditing(true)}
              >
                <Icon name="edit" size={16} /> Edit
              </button>
            </>
          )}
        </article>

        {/* Plan / usage (live) */}
        <article className="card">
          <div className="set-head">
            <span className="stat-ic ic-blue">
              <Icon name="rupee" size={20} />
            </span>
            <h2 className="section-title">Plan & usage</h2>
          </div>
          <div className="set-rows">
            <div className="set-row">
              <span className="muted">Current plan</span>
              <span className="set-val">{store?.plan ?? 'Pro · ₹299/mo'}</span>
            </div>
            <div className="set-row">
              <span className="muted">Products tracked</span>
              <span className="set-val">{products.length}</span>
            </div>
            <div className="set-row">
              <span className="muted">Bills scanned</span>
              <span className="set-val">{bills.length}</span>
            </div>
            <div className="set-row">
              <span className="muted">Stock value</span>
              <span className="set-val">{formatINR(stockValue)}</span>
            </div>
          </div>
          <button
            className="btn btn-outline block"
            style={{ marginTop: 16 }}
            onClick={doLogout}
          >
            <Icon name="logout" size={16} /> Sign out
          </button>
        </article>

        {/* Preferences */}
        <article className="card prefs">
          <div className="set-head">
            <span className="stat-ic ic-blue">
              <Icon name="bell" size={20} />
            </span>
            <h2 className="section-title">Preferences & alerts</h2>
          </div>
          <div className="toggle-list">
            {TOGGLE_META.map((t) => (
              <div key={t.key} className="toggle-row">
                <div>
                  <div className="tg-label">{t.label}</div>
                  <div className="tg-desc muted">{t.desc}</div>
                </div>
                <button
                  className={'switch' + (prefs[t.key] ? ' on' : '')}
                  onClick={() => flip(t.key)}
                  aria-pressed={prefs[t.key]}
                >
                  <span className="knob" />
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  )
}
