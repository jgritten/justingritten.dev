import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import '@/styles/App.css'
import { AppShell } from './Components/AppShell/AppShell'
import { Dashboard } from './Components/Dashboard/Dashboard'
import {
  Settings,
  AccountSettings,
  ApplicationSettings,
  ClientSettings,
} from './Components/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="/settings/account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="application" element={<ApplicationSettings />} />
            <Route path="client" element={<ClientSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
