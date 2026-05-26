import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { MaterialIcon } from './MaterialIcon'
import { LISTING_IMAGE_ACCEPT } from '../utils/imageFile'

type ImageUploaderProps = {
  labelId: string
  value: File[]
  onChange: (files: File[]) => void
  error?: string
  maxFiles?: number
}

export function ImageUploader({
  labelId,
  value,
  onChange,
  error,
  maxFiles = 1,
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

  const helperText = useMemo(() => {
    if (maxFiles === 1) return 'Upload 1 photo for now.'
    return `Upload up to ${maxFiles} photos.`
  }, [maxFiles])

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
        className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-secondary"
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
              className="mb-2 text-5xl text-outline-variant group-hover:text-secondary"
            />
            <p className="font-label-md text-label-md tracking-wider text-on-surface-variant uppercase">
              Upload Game Photos
            </p>
            <p className="mt-1 text-[10px] text-outline">
              Recommended: Front box art &amp; open components
            </p>
          </>
        )}
      </label>

      {error && <p className="mt-1 text-body-md text-error">{error}</p>}
      <p className="mt-2 text-[10px] text-on-surface-variant">{helperText}</p>
    </div>
  )
}

