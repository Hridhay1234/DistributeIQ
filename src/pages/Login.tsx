import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Splash from '../components/Splash'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import './login.css'

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6c1.9-5.6 7.1-9.8 13.7-9.8z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.8-9.7 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.3 28.3c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.8-6C.9 16.3 0 20 0 24s.9 7.7 2.5 11l7.8-6.7z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.6 0-11.8-4.2-13.7-9.8l-7.8 6C6.4 42.6 14.6 48 24 48z" />
    </svg>
  )
}

const STEP_LABELS = ['Sign in', 'Set up store']

export default function Login() {
  const navigate = useNavigate()
  const { user, authLoading, configured, error, signInWithGoogle } = useAuth()
  const { onboarded, loading, createStore } = useData()

  const [storeName, setStoreName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.displayName) {
      setStoreName((s) => s || `${user.displayName!.split(' ')[0]}'s Store`)
    }
  }, [user])

  if (authLoading) return <Splash label="Starting DistributeIQ…" />

  // already signed in + set up → straight to the app
  if (configured && user && !loading && onboarded) {
    return <Navigate to="/app/dashboard" replace />
  }

  const step: 0 | 1 = user && !onboarded ? 1 : 0

  const finishSetup = async () => {
    if (!user) return
    setSaving(true)
    try {
      await createStore({
        storeName: storeName.trim() || 'My Store',
        ownerName: user.displayName ?? 'Store Owner',
        email: user.email ?? '',
        photoURL: user.photoURL ?? '',
      })
      navigate('/app/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="auth">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="ab-glow ab-glow-1" />
        <div className="ab-glow ab-glow-2" />
        <button className="ab-top ab-home" onClick={() => navigate('/')}>
          <div className="brand-mark lg">
            <Icon name="store" size={26} strokeWidth={2.2} />
          </div>
          <span className="ab-name">DistributeIQ</span>
        </button>

        <div className="ab-mid">
          <h1>Run your kirana like a pro.</h1>
          <p>
            Log sales in one tap, scan supplier bills with AI, and watch your
            shop's numbers — all in the language of WhatsApp-simple.
          </p>
          <ul className="ab-feats">
            <li>
              <span className="ab-fic">
                <Icon name="sales" size={18} />
              </span>
              One-tap daily sales logging
            </li>
            <li>
              <span className="ab-fic">
                <Icon name="scan" size={18} />
              </span>
              AI bill scanning → instant stock
            </li>
            <li>
              <span className="ab-fic">
                <Icon name="reports" size={18} />
              </span>
              Live 7-day sales & profit insights
            </li>
          </ul>
        </div>

        <div className="ab-foot">
          <div className="ab-avatars">
            <span>RK</span>
            <span>SW</span>
            <span>IS</span>
          </div>
          Trusted by 12,000+ kirana owners across India
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form">
        <div className="af-inner">
          {!configured ? (
            <ConfigNotice />
          ) : (
            <>
              <div className="af-steps">
                {STEP_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={'af-step' + (i <= step ? ' done' : '')}
                  >
                    <span className="af-dot">
                      {i < step ? <Icon name="check" size={13} /> : i + 1}
                    </span>
                    {label}
                  </div>
                ))}
              </div>

              {step === 0 && (
                <div className="af-body fade-up">
                  <h2>Welcome 👋</h2>
                  <p className="af-sub">
                    Sign in with Google to open your store dashboard or create a
                    new one.
                  </p>
                  <button
                    className="btn google-btn block"
                    onClick={signInWithGoogle}
                  >
                    <GoogleG /> Continue with Google
                  </button>
                  {error && <p className="auth-error">{error}</p>}
                  <p className="af-fine">
                    By continuing you agree to our Terms & Privacy Policy.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="af-body fade-up">
                  <h2>Name your store</h2>
                  <p className="af-sub">
                    Welcome, {user?.displayName?.split(' ')[0] ?? 'there'}! Your
                    store starts empty — you'll add products by scanning a bill
                    or adding them yourself. We'll show you how.
                  </p>
                  <label className="field">
                    <span>Store name</span>
                    <div className="input-wrap">
                      <Icon name="store" size={18} />
                      <input
                        autoFocus
                        placeholder="e.g. Sharma General Store"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                      />
                    </div>
                  </label>

                  <button
                    className="btn btn-primary block"
                    onClick={finishSetup}
                    disabled={saving}
                  >
                    {saving ? (
                      'Setting up…'
                    ) : (
                      <>
                        Enter my dashboard{' '}
                        <Icon name="arrow-up-right" size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfigNotice() {
  return (
    <div className="af-body fade-up">
      <div className="config-badge">
        <Icon name="shield" size={18} /> Setup required
      </div>
      <h2>Connect Firebase</h2>
      <p className="af-sub">
        Add your Firebase Web App config to <code>.env.local</code> and restart
        the dev server to enable Google sign-in and the live database.
      </p>
      <ol className="config-steps">
        <li>
          Create a project at <strong>console.firebase.google.com</strong>
        </li>
        <li>
          Enable <strong>Authentication → Google</strong> sign-in
        </li>
        <li>
          Create a <strong>Firestore</strong> database
        </li>
        <li>
          Copy the web config into <code>.env.local</code> (see{' '}
          <code>.env.example</code>)
        </li>
      </ol>
      <pre className="config-env">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
      </pre>
    </div>
  )
}
