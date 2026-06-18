import { useEffect, useState, type ChangeEvent } from 'react'
import { MaterialIcon } from './MaterialIcon'
import { LISTING_IMAGE_ACCEPT } from '../utils/imageFile'

type ImageUploaderProps = {
  labelId: string
  value: File[]
  onChange: (files: File[]) => void
  error?: string
  maxFiles?: number
  compact?: boolean
  uploadLabel?: string
  uploadHint?: string
  helperText?: string
}

export function ImageUploader({
  labelId,
  value,
  onChange,
  error,
  maxFiles = 1,
  compact = false,
  uploadLabel = 'Upload Game Photos',
  uploadHint = 'Recommended: Front box art & open components',
  helperText: helperTextProp,
}: ImageUploaderProps) {
  const primary = value[0] ?? null
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!primary) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }

    const next = URL.createObjectURL(primary)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(next)
    return () => {
      URL.revokeObjectURL(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary])

  const helperText = helperTextProp ?? (
    maxFiles === 1 ? 'Optional — upload 1 photo for now.' : `Optional — upload up to ${maxFiles} photos.`
  )

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    onChange([file])
    event.target.value = ''
  }

  return (
    <div>
      <label
        htmlFor={labelId}
        className={
          compact
            ? 'group relative flex h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-secondary'
            : 'group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-secondary'
        }
      >
        <input
          id={labelId}
          type="file"
          accept={LISTING_IMAGE_ACCEPT}
          className="sr-only"
          onChange={handleChange}
        />

        {previewUrl ? (
          <>
            <img
              className="absolute inset-0 h-full w-full object-cover"
              alt="Selected game photo preview"
              src={previewUrl}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100">
              <MaterialIcon
                name="add_a_photo"
                className="mb-2 text-4xl text-on-primary"
              />
              <p className="font-label-md text-label-md text-on-primary">
                Change photo
              </p>
            </div>
          </>
        ) : (
          <>
            <MaterialIcon
              name="add_a_photo"
              className={
                compact
                  ? 'mb-1 text-3xl text-outline-variant group-hover:text-secondary'
                  : 'mb-2 text-5xl text-outline-variant group-hover:text-secondary'
              }
            />
            <p
              className={
                compact
                  ? 'font-label-md text-label-md text-on-surface-variant'
                  : 'font-label-md text-label-md tracking-wider text-on-surface-variant uppercase'
              }
            >
              {uploadLabel}
            </p>
            {!compact && (
              <p className="mt-1 text-[10px] text-outline">{uploadHint}</p>
            )}
          </>
        )}
      </label>

      {error && <p className="mt-1 text-body-md text-error">{error}</p>}
      <p className="mt-1 text-label-md text-on-surface-variant">{helperText}</p>
    </div>
  )
}

