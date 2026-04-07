import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useAuth, useUser } from '@clerk/react'
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  Select,
  Separator,
  Tabs,
  Text,
  TextField,
} from '@radix-ui/themes'
import '@/styles/App.css'
import {
  createTenantInvitation,
  deleteTenantPendingInvitation,
  fetchTenantClientRoster,
  patchTenantMemberRole,
  type TenantClientMemberDto,
  type TenantPendingInvitationDto,
  type TenantWorkspace,
} from '@/api/saasTenancy'
import { useSaasClient } from '@/contexts/SaasClientContext'
import { useTenantWorkspace } from '@/hooks/useTenantWorkspace'
import { CrudSlidePanel } from '@/Components/SaaS/CrudSlidePanel'
import { saasClerkPublishableKey } from '@/utils/saasClerk'
import {
  isPlausibleInviteEmail,
  normalizeInviteEmailForCompare,
  parseTenantInviteApiError,
  tenantRosterHasInviteEmail,
} from '@/utils/tenantInviteEmail'
import './UsersSettings.css'

/** Demo persona id for local-only transfer / delete rules when not using Clerk. */
const DEMO_VIEWER_USER_ID = 'user-owner-1'
const INITIAL_DEMO_VIEWER_ROLE: TenantRoleKind = 'owner'

export type TenantRoleKind = 'owner' | 'admin' | 'user'

export type TenantUserSource = 'demo' | 'tenant' | 'invitation'

export type TenantUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  role: TenantRoleKind
  /** Soft delete — excluded from roster when true. */
  isDeleted: boolean
  source: TenantUserSource
  /** Present when `source` is `tenant` (Clerk user id). */
  clerkUserId?: string
  membershipId?: string
  /** Present when `source` is `invitation` (pending Resend + DB row). */
  invitationId?: string
}

export type TenantRoleRow = {
  id: string
  name: string
  isSystem: boolean
  permissions: Record<string, boolean>
  isDeleted: boolean
}

export const TENANT_PLACEHOLDER_PERMISSIONS: { id: string; label: string }[] = [
  { id: 'clients.read', label: 'View client profile' },
  { id: 'clients.write', label: 'Edit client profile' },
  { id: 'users.read', label: 'View users' },
  { id: 'users.write', label: 'Manage users' },
  { id: 'roles.read', label: 'View roles' },
  { id: 'roles.write', label: 'Manage roles' },
  { id: 'documents.read', label: 'View documents' },
  { id: 'documents.write', label: 'Create & edit documents' },
  { id: 'reports.read', label: 'View reports' },
  { id: 'settings.read', label: 'View settings' },
]

export function normalizeRoleFromApi(role: string): TenantRoleKind {
  const x = role.trim().toLowerCase()
  if (x === 'owner' || x === 'admin' || x === 'user') return x
  return 'user'
}

function shortenClerkId(id: string): string {
  if (id.length <= 14) return id
  return `${id.slice(0, 10)}…`
}

export function mapDtoToTenantUser(m: TenantClientMemberDto): TenantUser {
  const role = normalizeRoleFromApi(m.role)
  const isYou = m.isCurrentUser
  const emailDisplay =
    typeof m.email === 'string' && m.email.trim() !== '' ? m.email.trim() : m.clerkUserId
  return {
    id: m.membershipId,
    membershipId: m.membershipId,
    clerkUserId: m.clerkUserId,
    source: 'tenant',
    firstName: isYou ? 'You' : 'Member',
    lastName: isYou ? '(signed in)' : shortenClerkId(m.clerkUserId),
    email: emailDisplay,
    phone: '',
    jobTitle: '—',
    role,
    isDeleted: false,
  }
}

export function mapPendingInviteToTenantUser(inv: TenantPendingInvitationDto): TenantUser {
  const role = normalizeRoleFromApi(inv.role)
  return {
    id: `inv-${inv.invitationId}`,
    invitationId: inv.invitationId,
    source: 'invitation',
    firstName: 'Invited',
    lastName: '(pending)',
    email: inv.inviteeEmail,
    phone: '',
    jobTitle: '—',
    role,
    isDeleted: false,
  }
}

function rosterStatusLabel(u: TenantUser): string {
  if (u.source === 'invitation') return 'Invited'
  if (u.source === 'demo') return '—'
  return 'Active'
}

function buildAllPermissions(on: boolean): Record<string, boolean> {
  return Object.fromEntries(TENANT_PLACEHOLDER_PERMISSIONS.map((p) => [p.id, on])) as Record<
    string,
    boolean
  >
}

function buildStaffPermissions(): Record<string, boolean> {
  const p = buildAllPermissions(false)
  p['clients.read'] = true
  p['clients.write'] = true
  p['users.read'] = true
  p['users.write'] = true
  p['roles.read'] = true
  p['roles.write'] = true
  p['documents.read'] = true
  p['documents.write'] = true
  p['reports.read'] = true
  p['settings.read'] = true
  return p
}

function buildUserPermissions(): Record<string, boolean> {
  const p = buildAllPermissions(false)
  p['clients.read'] = true
  p['documents.read'] = true
  p['reports.read'] = true
  return p
}

const INITIAL_DEMO_USERS: TenantUser[] = [
  {
    id: 'user-owner-1',
    firstName: 'Jordan',
    lastName: 'Rivera',
    email: 'jordan@example.com',
    phone: '+1 555-0100',
    jobTitle: 'Principal',
    role: 'owner',
    isDeleted: false,
    source: 'demo',
  },
  {
    id: 'user-admin-1',
    firstName: 'Alex',
    lastName: 'Nguyen',
    email: 'alex@example.com',
    phone: '+1 555-0101',
    jobTitle: 'Operations',
    role: 'admin',
    isDeleted: false,
    source: 'demo',
  },
  {
    id: 'user-member-1',
    firstName: 'Sam',
    lastName: 'Lee',
    email: 'sam@example.com',
    phone: '',
    jobTitle: 'Coordinator',
    role: 'user',
    isDeleted: false,
    source: 'demo',
  },
]

const INITIAL_ROLES: TenantRoleRow[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    isSystem: true,
    isDeleted: false,
    permissions: buildAllPermissions(true),
  },
  {
    id: 'role-admin',
    name: 'Admin',
    isSystem: true,
    isDeleted: false,
    permissions: buildStaffPermissions(),
  },
  {
    id: 'role-user',
    name: 'User',
    isSystem: true,
    isDeleted: false,
    permissions: buildUserPermissions(),
  },
  {
    id: 'role-estimator',
    name: 'Estimator',
    isSystem: false,
    isDeleted: false,
    permissions: {
      ...buildUserPermissions(),
      'documents.write': true,
    },
  },
]

type UserDraft = Omit<TenantUser, 'isDeleted'>
type RoleDraft = Pick<TenantRoleRow, 'id' | 'name' | 'permissions' | 'isSystem'>

export type UsersSettingsProps = {
  /** For tests or deep links; defaults to Users. */
  initialTab?: 'users' | 'roles'
}

type ClerkMode = 'guest' | 'signedOut' | 'signedIn'

type UsersSettingsBodyProps = UsersSettingsProps & {
  clerkMode: ClerkMode
  clerkUserId: string | null
  /** Primary email from Clerk (signed-in); used to block self-invite in the UI. */
  viewerAccountEmail: string | null
  getToken: () => Promise<string | null>
  workspace: TenantWorkspace | null
  tenantMembers: TenantUser[]
  setTenantMembers: Dispatch<SetStateAction<TenantUser[]>>
  membersError: string | null
  membersLoading: boolean
  refreshMembers: () => Promise<void>
}

function rowIsViewer(u: TenantUser, clerkId: string | null): boolean {
  if (u.source === 'invitation') return false
  if (u.source === 'tenant') return clerkId != null && u.clerkUserId === clerkId
  return u.id === DEMO_VIEWER_USER_ID
}

function UsersSettingsBody({
  initialTab = 'users',
  clerkMode,
  clerkUserId,
  viewerAccountEmail,
  getToken,
  workspace,
  tenantMembers,
  setTenantMembers: _setTenantMembers,
  membersError,
  membersLoading,
  refreshMembers,
}: UsersSettingsBodyProps) {
  const { activeClient } = useSaasClient()
  const [demoViewerRole, setDemoViewerRole] = useState<TenantRoleKind>(INITIAL_DEMO_VIEWER_ROLE)
  const [demoUsers, setDemoUsers] = useState<TenantUser[]>(INITIAL_DEMO_USERS)
  const [roles, setRoles] = useState<TenantRoleRow[]>(INITIAL_ROLES)
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>(initialTab)

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userDraft, setUserDraft] = useState<UserDraft | null>(null)
  const [userBaseline, setUserBaseline] = useState('')

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null)
  const [roleBaseline, setRoleBaseline] = useState('')

  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState<string>('')

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Admin' | 'User'>('User')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null)
  const [revokeInviteError, setRevokeInviteError] = useState<string | null>(null)
  const [confirmRevokeInviteUser, setConfirmRevokeInviteUser] = useState<TenantUser | null>(null)
  const [confirmDeleteDemoUser, setConfirmDeleteDemoUser] = useState<TenantUser | null>(null)
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<TenantRoleRow | null>(null)

  const effectiveViewerRole = useMemo(() => {
    if (clerkMode === 'signedIn' && workspace && activeClient?.id) {
      const m = workspace.memberships.find((x) => x.clientId === activeClient.id)
      return m ? normalizeRoleFromApi(m.role) : ('user' as TenantRoleKind)
    }
    return demoViewerRole
  }, [clerkMode, workspace, activeClient?.id, demoViewerRole])

  const canManageUsers = effectiveViewerRole === 'owner' || effectiveViewerRole === 'admin'
  const isOwnerViewer = effectiveViewerRole === 'owner'

  const visibleUsers = useMemo(
    () => [...tenantMembers, ...demoUsers].filter((u) => !u.isDeleted),
    [tenantMembers, demoUsers]
  )
  const visibleRoles = useMemo(() => roles.filter((r) => !r.isDeleted), [roles])

  const userDirty = useMemo(
    () => (userDraft ? JSON.stringify(userDraft) !== userBaseline : false),
    [userDraft, userBaseline]
  )
  const roleDirty = useMemo(
    () => (roleDraft ? JSON.stringify(roleDraft) !== roleBaseline : false),
    [roleDraft, roleBaseline]
  )

  const openUserEditor = useCallback((user: TenantUser) => {
    setEditingRoleId(null)
    setRoleDraft(null)
    setRoleBaseline('')
    const draft: UserDraft = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      jobTitle: user.jobTitle,
      role: user.role,
      source: user.source,
      clerkUserId: user.clerkUserId,
      membershipId: user.membershipId,
      invitationId: user.invitationId,
    }
    setUserDraft(draft)
    setUserBaseline(JSON.stringify(draft))
    setEditingUserId(user.id)
    setPanelOpen(true)
  }, [])

  const openRoleEditor = useCallback((role: TenantRoleRow) => {
    setEditingUserId(null)
    setUserDraft(null)
    setUserBaseline('')
    const draft: RoleDraft = {
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissions: { ...role.permissions },
    }
    setRoleDraft(draft)
    setRoleBaseline(JSON.stringify(draft))
    setEditingRoleId(role.id)
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setEditingUserId(null)
    setEditingRoleId(null)
    setUserDraft(null)
    setRoleDraft(null)
    setUserBaseline('')
    setRoleBaseline('')
  }, [])

  const openInviteDialog = useCallback(() => {
    setInviteEmail('')
    setInviteRole('User')
    setInviteError(null)
    setInviteSuccess(null)
    setRevokeInviteError(null)
    setConfirmRevokeInviteUser(null)
    setConfirmDeleteDemoUser(null)
    setConfirmDeleteRole(null)
    setInviteDialogOpen(true)
  }, [])

  const sendInvitation = useCallback(async () => {
    setInviteError(null)
    setInviteSuccess(null)
    setRevokeInviteError(null)
    const trimmed = inviteEmail.trim()
    if (!isPlausibleInviteEmail(trimmed)) {
      setInviteError('Enter a valid email address.')
      return
    }
    const norm = normalizeInviteEmailForCompare(trimmed)
    if (
      viewerAccountEmail &&
      normalizeInviteEmailForCompare(viewerAccountEmail) === norm
    ) {
      setInviteError('You cannot invite your own account email.')
      return
    }
    const rosterDupCheck = tenantMembers
      .filter((u) => u.source === 'tenant' || u.source === 'invitation')
      .map((u) => ({ source: 'tenant' as const, email: u.email }))
    if (tenantRosterHasInviteEmail(rosterDupCheck, trimmed)) {
      setInviteError('This email is already a member or has a pending invitation for this client.')
      return
    }
    if (!activeClient?.id) {
      setInviteError('Select a client before sending an invitation.')
      return
    }
    setInviteBusy(true)
    try {
      const token = await getToken()
      await createTenantInvitation(token, activeClient.id, trimmed, inviteRole)
      setInviteSuccess(
        `Invitation emailed to ${trimmed} (${inviteRole}). They appear below as Invited until they accept.`
      )
      setInviteEmail('')
      await refreshMembers()
    } catch (e) {
      setInviteError(parseTenantInviteApiError(e))
    } finally {
      setInviteBusy(false)
    }
  }, [inviteEmail, inviteRole, activeClient?.id, getToken, tenantMembers, viewerAccountEmail, refreshMembers])

  const saveUser = useCallback(async () => {
    if (!userDraft) return
    if (userDraft.source === 'tenant') {
      if (!activeClient?.id || userDraft.role === 'owner') return
      const token = await getToken()
      await patchTenantMemberRole(
        token,
        activeClient.id,
        userDraft.id,
        userDraft.role === 'admin' ? 'Admin' : 'User'
      )
      await refreshMembers()
    } else {
      setDemoUsers((prev) =>
        prev.map((u) =>
          u.id === userDraft.id
            ? {
                ...u,
                firstName: userDraft.firstName,
                lastName: userDraft.lastName,
                email: userDraft.email,
                phone: userDraft.phone,
                jobTitle: userDraft.jobTitle,
                role: userDraft.role,
              }
            : u
        )
      )
    }
    setUserBaseline(JSON.stringify(userDraft))
  }, [userDraft, activeClient?.id, getToken, refreshMembers])

  const saveRole = useCallback(async () => {
    if (!roleDraft) return
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleDraft.id
          ? {
              ...r,
              name: roleDraft.name,
              permissions: { ...roleDraft.permissions },
            }
          : r
      )
    )
    setRoleBaseline(JSON.stringify(roleDraft))
  }, [roleDraft])

  const softDeleteUser = useCallback((id: string) => {
    setDemoUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isDeleted: true } : u)))
  }, [])

  const revokePendingInvitation = useCallback(
    async (u: TenantUser) => {
      if (u.source !== 'invitation' || !u.invitationId || !activeClient?.id) return
      setRevokeInviteError(null)
      setRevokingInvitationId(u.invitationId)
      try {
        const token = await getToken()
        await deleteTenantPendingInvitation(token, activeClient.id, u.invitationId)
        await refreshMembers()
      } catch (e) {
        setRevokeInviteError(e instanceof Error ? e.message : 'Could not revoke invitation.')
      } finally {
        setRevokingInvitationId(null)
      }
    },
    [activeClient?.id, getToken, refreshMembers]
  )

  const softDeleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, isDeleted: true } : r)))
  }, [])

  const transferCandidates = useMemo(
    () =>
      visibleUsers.filter(
        (u) =>
          u.source === 'demo' &&
          u.id !== DEMO_VIEWER_USER_ID &&
          u.role !== 'owner' &&
          (u.role === 'admin' || u.role === 'user')
      ),
    [visibleUsers]
  )

  const applyTransfer = useCallback(() => {
    if (!transferTargetId) return
    setDemoUsers((prev) =>
      prev.map((u) => {
        if (u.id === DEMO_VIEWER_USER_ID) return { ...u, role: 'admin' as const }
        if (u.id === transferTargetId) return { ...u, role: 'owner' as const }
        return u
      })
    )
    setDemoViewerRole('admin')
    if (userDraft && userDraft.id === DEMO_VIEWER_USER_ID) {
      const next = { ...userDraft, role: 'admin' as const }
      setUserDraft(next)
      setUserBaseline(JSON.stringify(next))
    }
    setTransferOpen(false)
    setTransferTargetId('')
    closePanel()
  }, [transferTargetId, userDraft, closePanel])

  const showTransferOnUser =
    isOwnerViewer &&
    userDraft &&
    userDraft.source === 'demo' &&
    userDraft.id === DEMO_VIEWER_USER_ID &&
    userDraft.role === 'owner' &&
    transferCandidates.length > 0

  const panelTitle =
    activeTab === 'users'
      ? editingUserId
        ? 'Edit user'
        : ''
      : editingRoleId
        ? 'Edit role'
        : ''

  const editingTenantUser = userDraft?.source === 'tenant'

  const mainContent = (
    <div
      className={`content-card settings__card users-settings__card${panelOpen ? ' content-card--adjoin-right' : ''}`}
    >
      <Heading as="h2" size="6" className="settings__heading">
        Users & roles
      </Heading>
      <Text as="p" size="2" color="gray" className="settings__description">
        Manage people and role templates for{' '}
        <Text weight="medium">{activeClient?.name ?? 'this client'}</Text>. Invites use{' '}
        <Text weight="medium">Admin</Text> or <Text weight="medium">User</Text> only;{' '}
        <Text weight="medium">Owner</Text> is assigned when a tenant is created and can only be moved via transfer.
        Each invitation is scoped to this client—the same email can have separate pending invites for other clients.
        Owners and Admins can revoke a pending invite (for example a wrong address) from the Users table; that removes the row so you can send a new invite.
        Workspace members are loaded from the API when you are signed in; sample personas are labeled{' '}
        <Badge color="orange">Demo</Badge>.
      </Text>

      {clerkMode === 'signedOut' ? (
        <Text as="p" size="2" color="gray">
          Sign in to load real workspace members for the selected client (requires{' '}
          <Text weight="medium">X-Tenant-Client-Id</Text> on API calls).
        </Text>
      ) : null}
      {clerkMode === 'guest' ? (
        <Text as="p" size="2" color="gray">
          Clerk is not configured in this environment — only <Badge color="orange">Demo</Badge> rows are shown.
        </Text>
      ) : null}
      {membersLoading ? (
        <Text as="p" size="2" color="gray">
          Loading workspace members…
        </Text>
      ) : null}
      {membersError ? (
        <Text as="p" size="2" color="red">
          {membersError}
        </Text>
      ) : null}
      {revokeInviteError ? (
        <Text as="p" size="2" color="red">
          {revokeInviteError}
        </Text>
      ) : null}

      {!canManageUsers ? (
        <Text as="p" size="2" color="orange">
          Your role cannot manage users or roles. Contact an Owner or Admin.
        </Text>
      ) : null}

      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'users' | 'roles')
          if (panelOpen) closePanel()
          setConfirmRevokeInviteUser(null)
          setConfirmDeleteDemoUser(null)
          setConfirmDeleteRole(null)
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="users">
          <Separator size="4" my="3" />
          {clerkMode === 'signedIn' && canManageUsers && activeClient?.id ? (
            <Flex justify="between" align="center" wrap="wrap" gap="3" mb="3">
              <Text size="2" color="gray">
                Invite someone by email. They must sign in with that email to accept.
              </Text>
              <Button type="button" onClick={openInviteDialog}>
                Send invitation…
              </Button>
            </Flex>
          ) : null}
          <div className="users-settings__table-wrap">
            <table className="users-settings__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Job title</th>
                  <th>Source</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr
                    key={`${u.source}-${u.id}`}
                    className={
                      panelOpen && editingUserId === u.id ? 'users-settings__row--editing' : undefined
                    }
                  >
                    <td>
                      <Flex align="center" gap="2" wrap="wrap">
                        <span>
                          {u.firstName} {u.lastName}
                        </span>
                        {u.source === 'demo' ? (
                          <Badge color="orange">Demo</Badge>
                        ) : u.source === 'invitation' ? (
                          <Badge color="blue">Invite</Badge>
                        ) : (
                          <Badge color="gray">Account</Badge>
                        )}
                      </Flex>
                    </td>
                    <td>
                      <Text
                        size="2"
                        style={
                          u.source === 'tenant' && !u.email.includes('@')
                            ? { fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }
                            : undefined
                        }
                      >
                        {u.email}
                      </Text>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>
                      <Text size="2">{rosterStatusLabel(u)}</Text>
                    </td>
                    <td>{u.jobTitle || '—'}</td>
                    <td>
                      {u.source === 'demo'
                        ? 'Sample data'
                        : u.source === 'invitation'
                          ? 'Invitation'
                          : 'Database'}
                    </td>
                    <td>
                      <div className="users-settings__row-actions">
                        <Button
                          size="1"
                          variant="soft"
                          disabled={!canManageUsers || u.source === 'invitation'}
                          onClick={() => openUserEditor(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          disabled={
                            !canManageUsers ||
                            u.source === 'tenant' ||
                            (u.source === 'invitation' &&
                              (!u.invitationId || revokingInvitationId === u.invitationId)) ||
                            (u.source === 'demo' &&
                              (rowIsViewer(u, clerkUserId) || u.role === 'owner'))
                          }
                          onClick={() =>
                            u.source === 'invitation'
                              ? setConfirmRevokeInviteUser(u)
                              : setConfirmDeleteDemoUser(u)
                          }
                        >
                          {u.source === 'invitation'
                            ? revokingInvitationId === u.invitationId
                              ? 'Revoking…'
                              : 'Revoke invite'
                            : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="roles">
          <Separator size="4" my="3" />
          <div className="users-settings__table-wrap">
            <table className="users-settings__table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Type</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleRoles.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      panelOpen && editingRoleId === r.id ? 'users-settings__row--editing' : undefined
                    }
                  >
                    <td>{r.name}</td>
                    <td>{r.isSystem ? 'System' : 'Custom'}</td>
                    <td>
                      <div className="users-settings__row-actions">
                        <Button
                          size="1"
                          variant="soft"
                          disabled={!canManageUsers}
                          onClick={() => openRoleEditor(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          disabled={!canManageUsers || r.isSystem}
                          onClick={() => setConfirmDeleteRole(r)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )

  const userForm = userDraft && (
    <Flex direction="column" gap="3">
      {editingTenantUser ? (
        <Text size="2" color="gray">
          Profile fields are managed in Clerk; this client only stores the role. Saving updates the membership via
          the API (requires Owner or Admin).
        </Text>
      ) : null}
      <div className="users-settings__form-grid">
        <label>
          <Text size="1" weight="medium" as="div" mb="1">
            First name
          </Text>
          <TextField.Root
            value={userDraft.firstName}
            disabled={editingTenantUser}
            onChange={(e) => setUserDraft({ ...userDraft, firstName: e.target.value })}
          />
        </label>
        <label>
          <Text size="1" weight="medium" as="div" mb="1">
            Last name
          </Text>
          <TextField.Root
            value={userDraft.lastName}
            disabled={editingTenantUser}
            onChange={(e) => setUserDraft({ ...userDraft, lastName: e.target.value })}
          />
        </label>
        <label className="users-settings__form-grid--full">
          <Text size="1" weight="medium" as="div" mb="1">
            Email
          </Text>
          <TextField.Root
            value={userDraft.email}
            disabled={editingTenantUser}
            onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })}
          />
        </label>
        <label>
          <Text size="1" weight="medium" as="div" mb="1">
            Phone
          </Text>
          <TextField.Root
            value={userDraft.phone}
            disabled={editingTenantUser}
            onChange={(e) => setUserDraft({ ...userDraft, phone: e.target.value })}
          />
        </label>
        <label>
          <Text size="1" weight="medium" as="div" mb="1">
            Job title
          </Text>
          <TextField.Root
            value={userDraft.jobTitle}
            disabled={editingTenantUser}
            onChange={(e) => setUserDraft({ ...userDraft, jobTitle: e.target.value })}
          />
        </label>
        <label className="users-settings__form-grid--full">
          <Text size="1" weight="medium" as="div" mb="1">
            Role
          </Text>
          {userDraft.role === 'owner' ? (
            <Text size="2" color="gray">
              Owner (cannot be assigned here — use transfer when supported for live accounts).
            </Text>
          ) : (
            <Select.Root
              value={userDraft.role}
              onValueChange={(v) => setUserDraft({ ...userDraft, role: v as TenantRoleKind })}
              disabled={!canManageUsers}
            >
              <Select.Trigger placeholder="Role" />
              <Select.Content>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="user">User</Select.Item>
              </Select.Content>
            </Select.Root>
          )}
        </label>
      </div>
      {showTransferOnUser ? (
        <Flex direction="column" gap="2">
          <Separator size="4" />
          <Text size="2" color="gray">
            Transfer assigns Owner to another demo persona and moves you to Admin (sample data only).
          </Text>
          <div>
            <Button type="button" variant="outline" onClick={() => setTransferOpen(true)}>
              Transfer ownership…
            </Button>
          </div>
        </Flex>
      ) : null}
      {userDraft.source === 'tenant' && userDraft.role === 'owner' && isOwnerViewer ? (
        <Text size="2" color="gray">
          Transferring live ownership will use a dedicated API in a future update.
        </Text>
      ) : null}
    </Flex>
  )

  const roleForm = roleDraft && (
    <Flex direction="column" gap="3">
      <label>
        <Text size="1" weight="medium" as="div" mb="1">
          Role name
        </Text>
        <TextField.Root
          value={roleDraft.name}
          disabled={roleDraft.isSystem}
          onChange={(e) => setRoleDraft({ ...roleDraft, name: e.target.value })}
        />
      </label>
      <div>
        <Text size="2" weight="medium" as="div" mb="2">
          Permissions
        </Text>
        <div className="users-settings__perm-matrix">
          {TENANT_PLACEHOLDER_PERMISSIONS.map((p) => {
            const ownerLocked = roleDraft.id === 'role-owner'
            const checked = Boolean(roleDraft.permissions[p.id])
            return (
              <label key={p.id} className="users-settings__perm-row">
                <Text size="2">{p.label}</Text>
                <Checkbox
                  checked={checked}
                  disabled={ownerLocked}
                  onCheckedChange={(v) =>
                    setRoleDraft({
                      ...roleDraft,
                      permissions: { ...roleDraft.permissions, [p.id]: v === true },
                    })
                  }
                />
              </label>
            )
          })}
        </div>
      </div>
    </Flex>
  )

  return (
    <>
      <CrudSlidePanel
        open={panelOpen}
        onOpenChange={(next) => {
          if (!next) closePanel()
          else setPanelOpen(true)
        }}
        title={panelTitle}
        isDirty={activeTab === 'users' ? userDirty : roleDirty}
        onSave={activeTab === 'users' ? saveUser : saveRole}
        main={mainContent}
      >
        {activeTab === 'users' ? userForm : roleForm}
      </CrudSlidePanel>

      <Dialog.Root
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          setInviteDialogOpen(open)
          if (!open) {
            setInviteError(null)
            setInviteSuccess(null)
            setInviteEmail('')
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: 440 }} aria-describedby="send-invite-desc">
          <Dialog.Title>Send invitation</Dialog.Title>
          <Flex direction="column" gap="3" mt="2">
            <Text id="send-invite-desc" size="2" color="gray" as="p">
              Adds a pending invitation for <Text weight="medium">{activeClient?.name ?? 'this client'}</Text> only.
              Role <Text weight="medium">Owner</Text> cannot be assigned by invite.
            </Text>
            <label>
              <Text size="1" weight="medium" as="div" mb="1">
                Email
              </Text>
              <TextField.Root
                type="email"
                autoComplete="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteBusy}
              />
            </label>
            <label>
              <Text size="1" weight="medium" as="div" mb="1">
                Role when they join
              </Text>
              <Select.Root
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as 'Admin' | 'User')}
                disabled={inviteBusy}
              >
                <Select.Trigger placeholder="Role" />
                <Select.Content>
                  <Select.Item value="User">User</Select.Item>
                  <Select.Item value="Admin">Admin</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
            {inviteError ? (
              <Text size="2" color="red" as="p">
                {inviteError}
              </Text>
            ) : null}
            {inviteSuccess ? (
              <Text size="2" color="green" as="p">
                {inviteSuccess}
              </Text>
            ) : null}
            <Flex gap="2" justify="end" wrap="wrap">
              <Button
                type="button"
                variant="soft"
                disabled={inviteBusy}
                onClick={() => setInviteDialogOpen(false)}
              >
                {inviteSuccess ? 'Close' : 'Cancel'}
              </Button>
              {!inviteSuccess ? (
                <Button type="button" disabled={inviteBusy} onClick={() => void sendInvitation()}>
                  {inviteBusy ? 'Sending…' : 'Send invite'}
                </Button>
              ) : null}
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={transferOpen} onOpenChange={setTransferOpen}>
        <Dialog.Content style={{ maxWidth: 420 }} aria-describedby="transfer-ownership-desc">
          <Dialog.Title>Transfer ownership</Dialog.Title>
          <Flex direction="column" gap="3" mt="2">
            <Text id="transfer-ownership-desc" size="2" color="gray" as="p">
              Choose a demo Admin or User to become Owner. You will become an Admin after you confirm.
            </Text>
            <Select.Root value={transferTargetId} onValueChange={setTransferTargetId}>
              <Select.Trigger placeholder="Select user" />
              <Select.Content>
                {transferCandidates.map((u) => (
                  <Select.Item key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Flex gap="2" justify="end" wrap="wrap">
              <Button type="button" variant="soft" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={!transferTargetId} onClick={applyTransfer}>
                Transfer
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={confirmRevokeInviteUser !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmRevokeInviteUser(null)
        }}
      >
        <Dialog.Content style={{ maxWidth: 440 }} aria-describedby="revoke-invite-desc">
          <Dialog.Title>Revoke invitation?</Dialog.Title>
          <Flex direction="column" gap="3" mt="2">
            <Text id="revoke-invite-desc" size="2" color="gray" as="p">
              This removes the pending invite for{' '}
              <Text weight="medium">{confirmRevokeInviteUser?.email ?? ''}</Text> from{' '}
              <Text weight="medium">{activeClient?.name ?? 'this client'}</Text>. They will not be able to accept it.
              You can send a new invitation afterward. This does not unsend email that was already delivered.
            </Text>
            <Flex gap="2" justify="end" wrap="wrap">
              <Button type="button" variant="soft" onClick={() => setConfirmRevokeInviteUser(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                disabled={!confirmRevokeInviteUser?.invitationId}
                onClick={() => {
                  const target = confirmRevokeInviteUser
                  if (!target || target.source !== 'invitation' || !target.invitationId) return
                  setConfirmRevokeInviteUser(null)
                  void revokePendingInvitation(target)
                }}
              >
                Revoke invitation
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={confirmDeleteDemoUser !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteDemoUser(null)
        }}
      >
        <Dialog.Content style={{ maxWidth: 420 }} aria-describedby="delete-demo-user-desc">
          <Dialog.Title>Remove sample user?</Dialog.Title>
          <Flex direction="column" gap="3" mt="2">
            <Text id="delete-demo-user-desc" size="2" color="gray" as="p">
              Remove{' '}
              <Text weight="medium">
                {confirmDeleteDemoUser
                  ? `${confirmDeleteDemoUser.firstName} ${confirmDeleteDemoUser.lastName}`
                  : ''}
              </Text>{' '}
              ({confirmDeleteDemoUser?.email}) from the demo list. This only affects sample data in your browser
              session, not workspace members.
            </Text>
            <Flex gap="2" justify="end" wrap="wrap">
              <Button type="button" variant="soft" onClick={() => setConfirmDeleteDemoUser(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                onClick={() => {
                  const id = confirmDeleteDemoUser?.id
                  if (id) softDeleteUser(id)
                  setConfirmDeleteDemoUser(null)
                }}
              >
                Remove
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={confirmDeleteRole !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteRole(null)
        }}
      >
        <Dialog.Content style={{ maxWidth: 420 }} aria-describedby="delete-role-desc">
          <Dialog.Title>Delete role?</Dialog.Title>
          <Flex direction="column" gap="3" mt="2">
            <Text id="delete-role-desc" size="2" color="gray" as="p">
              Delete the custom role <Text weight="medium">{confirmDeleteRole?.name ?? ''}</Text>? Demo users
              assigned this role in the UI will keep their row until you edit them; this only removes the role
              template from the sample list.
            </Text>
            <Flex gap="2" justify="end" wrap="wrap">
              <Button type="button" variant="soft" onClick={() => setConfirmDeleteRole(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                onClick={() => {
                  const id = confirmDeleteRole?.id
                  if (id) softDeleteRole(id)
                  setConfirmDeleteRole(null)
                }}
              >
                Delete role
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

function UsersSettingsSignedInRoute(props: UsersSettingsProps) {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { workspace } = useTenantWorkspace()
  const { activeClient } = useSaasClient()
  const [tenantMembers, setTenantMembers] = useState<TenantUser[]>([])
  const [membersError, setMembersError] = useState<string | null>(null)
  const [membersLoading, setMembersLoading] = useState(false)

  const refreshMembers = useCallback(async () => {
    if (!activeClient?.id) {
      setTenantMembers([])
      setMembersError(null)
      return
    }
    setMembersLoading(true)
    setMembersError(null)
    try {
      const token = await getToken()
      const roster = await fetchTenantClientRoster(token, activeClient.id)
      setTenantMembers([
        ...roster.members.map(mapDtoToTenantUser),
        ...roster.pendingInvitations.map(mapPendingInviteToTenantUser),
      ])
    } catch (e) {
      setTenantMembers([])
      setMembersError(e instanceof Error ? e.message : 'Could not load members.')
    } finally {
      setMembersLoading(false)
    }
  }, [activeClient?.id, getToken])

  useEffect(() => {
    void refreshMembers()
  }, [refreshMembers])

  const viewerAccountEmail =
    user?.primaryEmailAddress?.emailAddress?.trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.trim() ||
    null

  return (
    <UsersSettingsBody
      {...props}
      clerkMode="signedIn"
      clerkUserId={user?.id ?? null}
      viewerAccountEmail={viewerAccountEmail}
      getToken={getToken}
      workspace={workspace}
      tenantMembers={tenantMembers}
      setTenantMembers={setTenantMembers}
      membersError={membersError}
      membersLoading={membersLoading}
      refreshMembers={refreshMembers}
    />
  )
}

function UsersSettingsWithClerk(props: UsersSettingsProps) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <UsersSettingsBody
        {...props}
        clerkMode="signedOut"
        clerkUserId={null}
        viewerAccountEmail={null}
        getToken={async () => null}
        workspace={null}
        tenantMembers={[]}
        setTenantMembers={() => {}}
        membersError={null}
        membersLoading
        refreshMembers={async () => {}}
      />
    )
  }

  if (isSignedIn) {
    return <UsersSettingsSignedInRoute {...props} />
  }

  return (
    <UsersSettingsBody
      {...props}
      clerkMode="signedOut"
      clerkUserId={null}
      viewerAccountEmail={null}
      getToken={async () => null}
      workspace={null}
      tenantMembers={[]}
      setTenantMembers={() => {}}
      membersError={null}
      membersLoading={false}
      refreshMembers={async () => {}}
    />
  )
}

export function UsersSettings(props: UsersSettingsProps) {
  if (!saasClerkPublishableKey) {
    return (
      <UsersSettingsBody
        {...props}
        clerkMode="guest"
        clerkUserId={null}
        viewerAccountEmail={null}
        getToken={async () => null}
        workspace={null}
        tenantMembers={[]}
        setTenantMembers={() => {}}
        membersError={null}
        membersLoading={false}
        refreshMembers={async () => {}}
      />
    )
  }

  return <UsersSettingsWithClerk {...props} />
}
