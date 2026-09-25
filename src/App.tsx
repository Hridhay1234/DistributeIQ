import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SalesLog from './pages/SalesLog'
import SalesRecords from './pages/SalesRecords'
import Inventory from './pages/Inventory'
import BillScan from './pages/BillScan'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Help from './pages/Help'
import Trends from './pages/Trends'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sales" element={<SalesLog />} />
              <Route path="records" element={<SalesRecords />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="scan" element={<BillScan />} />
              <Route path="reports" element={<Reports />} />
              <Route path="trends" element={<Trends />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  )
}
