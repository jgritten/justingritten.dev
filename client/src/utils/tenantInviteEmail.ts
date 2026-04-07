/** Lowercase trimmed email for comparisons (matches server NormalizeEmail). */
export function normalizeInviteEmailForCompare(email: string): string {
  return email.trim().toLowerCase()
}

/** Lightweight shape check; server is authoritative. */
export function isPlausibleInviteEmail(email: string): boolean {
  const t = email.trim()
  if (t.length === 0 || t.length > 320) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

export type TenantInviteRosterEntry = {
  source: string
  email: string
}

/** True if a **tenant** roster row shows this email (ignores demo sample rows). */
export function tenantRosterHasInviteEmail(
  members: TenantInviteRosterEntry[],
  inviteEmailInput: string
): boolean {
  const norm = normalizeInviteEmailForCompare(inviteEmailInput)
  if (!norm) return false
  return members.some((m) => {
    if (m.source !== 'tenant') return false
    const e = m.email.trim()
    if (!e.includes('@')) return false
    return normalizeInviteEmailForCompare(e) === norm
  })
}

export function parseTenantInviteApiError(error: unknown): string {
  if (!(error instanceof Error)) return 'Could not send invitation.'
  const match = error.message.match(/^API (\d+): ([\s\S]*)$/)
  if (!match) return error.message
  const body = match[2].trim()
  if (!body) return `Request failed (${match[1]}).`
  try {
    const j = JSON.parse(body) as { message?: string }
    if (typeof j.message === 'string' && j.message.length > 0) return j.message
  } catch {
    /* plain text body */
  }
  return body
}
