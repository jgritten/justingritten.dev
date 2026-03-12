type DesignSystemsIconProps = {
  className?: string
}

export function DesignSystemsIcon({ className }: DesignSystemsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <line x1="12" y1="9" x2="12" y2="5" />
      <line x1="12" y1="15" x2="12" y2="19" />
      <line x1="9" y1="12" x2="5" y2="12" />
      <line x1="15" y1="12" x2="19" y2="12" />
      <rect x="10" y="3" width="4" height="2" rx="0.5" />
      <rect x="10" y="19" width="4" height="2" rx="0.5" />
      <rect x="3" y="10" width="2" height="4" rx="0.5" />
      <rect x="19" y="10" width="2" height="4" rx="0.5" />
    </svg>
  )
}

