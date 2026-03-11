import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import '@/styles/App.css'
import { GlobalLayout } from './Components/AppShell/GlobalLayout'
import { Profile } from './Components/Profile/Profile'
import { SaasEntry } from './Components/SaaS/SaasEntry'
import { SaasAppShell } from './Components/SaaS/SaasAppShell'
import { SaasDashboard } from './Components/SaaS/SaasDashboard'
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
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<Profile />} />
          <Route path="saas">
            <Route index element={<SaasEntry />} />
            <Route element={<SaasAppShell />}>
              <Route path="dashboard" element={<SaasDashboard />} />
              <Route path="settings" element={<Settings />}>
                <Route
                  index
                  element={<Navigate to="/saas/settings/account" replace />}
                />
                <Route path="account" element={<AccountSettings />} />
                <Route path="application" element={<ApplicationSettings />} />
                <Route path="client" element={<ClientSettings />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
