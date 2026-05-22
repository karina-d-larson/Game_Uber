type MaterialIconProps = {
  name: string
  filled?: boolean
  className?: string
}

export function MaterialIcon({ name, filled, className = '' }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={{
        fontFamily: "'Material Symbols Outlined'",
        ...(filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : {}),
      }}
      aria-hidden={true}
    >
      {name}
    </span>
  )
}
