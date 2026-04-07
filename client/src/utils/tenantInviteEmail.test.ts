import { describe, expect, it } from 'vitest'
import {
  isPlausibleInviteEmail,
  normalizeInviteEmailForCompare,
  parseTenantInviteApiError,
  tenantRosterHasInviteEmail,
} from './tenantInviteEmail'

describe('tenantInviteEmail', () => {
  it('normalizes for compare', () => {
    expect(normalizeInviteEmailForCompare('  A@B.C  ')).toBe('a@b.c')
  })

  it('validates plausible email', () => {
    expect(isPlausibleInviteEmail('a@b.co')).toBe(true)
    expect(isPlausibleInviteEmail('not-an-email')).toBe(false)
    expect(isPlausibleInviteEmail('')).toBe(false)
  })

  it('detects tenant roster email match only for tenant source with @', () => {
    const members = [
      { source: 'tenant', email: 'User@Example.com' },
      { source: 'demo', email: 'user@example.com' },
      { source: 'tenant', email: 'user_abc123' },
    ]
    expect(tenantRosterHasInviteEmail(members, 'user@example.com')).toBe(true)
    expect(tenantRosterHasInviteEmail(members, 'other@example.com')).toBe(false)
  })

  it('parses API JSON message from Error', () => {
    const err = new Error(
      'API 409: {"message":"A member with this email is already in this tenant."}'
    )
    expect(parseTenantInviteApiError(err)).toBe('A member with this email is already in this tenant.')
  })
})
