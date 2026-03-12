type DrawIoIconProps = {
  className?: string
}

export function DrawIoIcon({ className }: DrawIoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width="96"
      height="96"
      role="img"
      aria-label="Draw.io"
      className={className}
    >
      <title>Draw.io</title>
      <rect width="96" height="96" rx="8" fill="#F28C00" />
      <path d="M61 12 96 47v41H30L12 70l25-40z" fill="#E37200" />
      <path d="M42 34 28 58h6l13-22zm12 0-5 0 13 22h6z" fill="#F3F3F3" />
      <rect x="34" y="12" width="28" height="24" rx="5" fill="#F3F3F3" />
      <rect x="12" y="54" width="28" height="24" rx="5" fill="#F3F3F3" />
      <rect x="56" y="54" width="28" height="24" rx="5" fill="#F3F3F3" />
    </svg>
  )
}
