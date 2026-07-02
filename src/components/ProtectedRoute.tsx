import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Layout from './Layout'
import Splash from './Splash'

export default function ProtectedRoute() {
  const { user, authLoading, configured } = useAuth()
  const { loading, onboarded } = useData()

  if (!configured) return <Navigate to="/" replace />
  if (authLoading) return <Splash />
  if (!user) return <Navigate to="/" replace />
  if (loading) return <Splash />
  if (!onboarded) return <Navigate to="/" replace />

  return <Layout />
}
