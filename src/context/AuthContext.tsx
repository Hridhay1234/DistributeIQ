import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase'

type AuthValue = {
  user: User | null
  authLoading: boolean
  configured: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false)
      return
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      authLoading,
      configured: isFirebaseConfigured,
      error,
      async signInWithGoogle() {
        setError(null)
        try {
          await signInWithPopup(auth, googleProvider)
        } catch (e) {
          const code = (e as { code?: string }).code ?? ''
          if (code === 'auth/popup-closed-by-user') return
          setError(
            code === 'auth/unauthorized-domain'
              ? 'This domain is not authorised in Firebase Auth settings.'
              : 'Sign-in failed. Please try again.',
          )
        }
      },
      async logout() {
        if (isFirebaseConfigured) await signOut(auth)
      },
    }),
    [user, authLoading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
