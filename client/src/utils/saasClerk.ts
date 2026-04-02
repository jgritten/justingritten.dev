/** Clerk publishable key for SaaS routes (safe to expose in the client bundle). */
export const saasClerkPublishableKey =
  typeof import.meta.env.VITE_CLERK_PUBLISHABLE_KEY === 'string'
    ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.trim()
    : ''
