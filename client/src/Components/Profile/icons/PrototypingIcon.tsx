type PrototypingIconProps = {
  className?: string
}

export function PrototypingIcon({ className }: PrototypingIconProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M20 25C20 22.2386 22.2386 20 25 20H57"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M72 20H80V80H25C22.2386 80 20 77.7614 20 75V25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 25C20 27.7614 17.7614 30 15 30C12.2386 30 10 27.7614 10 25V75C10 77.7614 12.2386 80 15 80"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 40L65 48V64L50 72L35 64V48L50 40Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50 56L65 48M50 56L35 48M50 56V72"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g transform="translate(68, 15) rotate(45)">
        <path
          d="M0 0H6V20H0Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M0 20L3 26L6 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M3 20V23.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

