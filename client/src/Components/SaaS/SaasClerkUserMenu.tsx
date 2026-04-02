import { UserButton } from '@clerk/react'

/** Clerk account control for the SaaS shell menu bar (must render under `ClerkProvider`). */
export function SaasClerkUserMenu() {
  return (
    <div className="menu-bar__clerk-user">
      <UserButton />
    </div>
  )
}
