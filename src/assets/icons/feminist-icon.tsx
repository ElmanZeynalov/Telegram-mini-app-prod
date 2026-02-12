interface IconProps {
  className?: string
}

/**
 * Feminist Venus symbol (♀) with raised fist
 * Classic feminist movement logo
 */
export function FeministIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
    >
      {/* Outer circle ring */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 0C27.909 0 10 17.909 10 40C10 62.091 27.909 80 50 80C72.091 80 90 62.091 90 40C90 17.909 72.091 0 50 0ZM50 8C68.778 8 82 21.222 82 40C82 58.778 68.778 72 50 72C31.222 72 18 58.778 18 40C18 21.222 31.222 8 50 8Z"
      />
      {/* Vertical stem */}
      <rect x="46" y="72" width="8" height="28" />
      {/* Horizontal cross */}
      <rect x="35" y="82" width="30" height="8" />
      {/* Raised fist - wrist */}
      <path d="M42 58C42 58 40 52 40 48C40 46 41 45 42 45L58 45C59 45 60 46 60 48C60 52 58 58 58 58L42 58Z" />
      {/* Raised fist - palm and fingers */}
      <path d="M38 46C38 46 36 44 36 40C36 38 37 36 39 36C41 36 42 38 42 40L42 46L38 46Z" />
      <path d="M42 34C42 32 43 28 45 28C47 28 48 30 48 32L48 42L42 42L42 34Z" />
      <path d="M48 32C48 30 49 26 51 26C53 26 54 28 54 30L54 42L48 42L48 32Z" />
      <path d="M54 34C54 32 55 28 57 28C59 28 60 30 60 32L60 42L54 42L54 34Z" />
      <path d="M60 40C60 38 61 36 63 36C65 36 66 38 66 40C66 44 64 46 64 46L60 46L60 40Z" />
    </svg>
  )
}

