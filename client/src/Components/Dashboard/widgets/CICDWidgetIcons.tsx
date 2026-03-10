/** Platform icons for the CI/CD pipeline widget. Inline SVGs for theme compatibility. */

const iconProps = {
  width: 20,
  height: 20,
  'aria-hidden': true,
  focusable: false,
} as const

export function IconCursor() {
  return (
    <svg
      {...iconProps}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4 4 12l4 8" />
      <path d="M16 4l4 8-4 8" />
    </svg>
  )
}

export function IconGitHub() {
  return (
    <svg
      {...iconProps}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export function IconGitHubActions() {
  return (
    <svg
      {...iconProps}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v8l4 2.5-4 2.5V22" />
      <path d="M5 10a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4Z" />
      <path d="M5 14v1a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-1" />
    </svg>
  )
}

export function IconS3Squarespace() {
  return (
    <svg
      {...iconProps}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 0 12 6 6 0 0 0 0-12Z" />
      <path d="M4.5 9.5a6 6 0 0 0 6 6 6 6 0 0 0 6-6" />
      <path d="M19.5 9.5a6 6 0 0 0-6 6 6 6 0 0 0 6-6" />
    </svg>
  )
}
