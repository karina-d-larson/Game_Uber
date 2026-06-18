type AuthFieldProps = {
  id: string
  label: string
  type?: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
}

/** Labeled auth input with inline validation message. */
export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: AuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-label-md text-label-md text-on-surface-variant"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="gameshelf-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error && <p className="mt-1 text-body-md text-error">{error}</p>}
    </div>
  )
}
