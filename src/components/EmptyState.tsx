import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest px-lg py-xl text-center">
      <div className="max-w-[22rem] space-y-sm">
        <p className="font-headline-md text-headline-md text-on-surface">
          {title}
        </p>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

