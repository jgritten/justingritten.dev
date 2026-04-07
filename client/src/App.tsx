import { BrowserRouter, Navigate, Routes, Route, Outlet } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import '@/styles/App.css'
import { GlobalLayout } from './Components/AppShell/GlobalLayout'
import { Profile } from './Components/Profile/Profile'
import { BuildActivityPage } from './Components/Profile/BuildActivityPage'
import { SaasEntry } from './Components/SaaS/SaasEntry'
import { SaasPostSignIn } from './Components/SaaS/SaasPostSignIn'
import { SaasAppShell } from './Components/SaaS/SaasAppShell'
import { SaasDashboard } from './Components/SaaS/SaasDashboard'
import { SaasClientProvider } from './contexts/SaasClientContext'
import { saasClerkPublishableKey } from './utils/saasClerk'
import {
  Settings,
  AccountSettings,
  ApplicationSettings,
  ClientSettings,
  UsersSettings,
} from './Components/SaaS/Settings'

function SaasRoutesLayout() {
  const inner = (
    <SaasClientProvider>
      <Outlet />
    </SaasClientProvider>
  )
  if (!saasClerkPublishableKey) {
    return inner
  }
  return (
    <ClerkProvider
      publishableKey={saasClerkPublishableKey}
      // Post-auth workspace hub (invites, clients, Create Client) before dashboard; optional default-client skip.
      signInForceRedirectUrl="/saas/post-sign-in"
      signUpForceRedirectUrl="/saas/post-sign-in"
      signInFallbackRedirectUrl="/saas/post-sign-in"
      signUpFallbackRedirectUrl="/saas/post-sign-in"
    >
      {inner}
    </ClerkProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<Profile />} />
          <Route path="build" element={<BuildActivityPage />} />
          <Route path="saas" element={<SaasRoutesLayout />}>
            <Route index element={<SaasEntry />} />
            <Route path="post-sign-in" element={<SaasPostSignIn />} />
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
                <Route path="users" element={<UsersSettings />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
