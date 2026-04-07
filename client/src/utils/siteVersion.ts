export const SITE_VERSION = '0.11.0' as const

export type SemVer = {
  major: number
  minor: number
  patch: number
}

export function parseSiteVersion(version: string = SITE_VERSION): SemVer {
  const [major, minor, patch] = version.split('.').map((part) => Number(part) || 0)
  return { major, minor, patch }
}

export const SITE_VERSION_NOTES = {
  major: 'Major portfolio revamp or showcase-ready release.',
  minor: 'New features, sections, or notable UI/content improvements.',
  patch: 'Bug fixes and small visual or copy tweaks.',
} as const

