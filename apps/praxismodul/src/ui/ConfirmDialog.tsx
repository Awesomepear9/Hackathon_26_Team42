import { useEffect, useRef } from 'react'

/** Modale Rückfrage (natives <dialog>: Fokus bleibt im Dialog, Escape bricht ab) */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(e) => {
        e.preventDefault() // Escape: schließen übernimmt der Zustand
        onCancel()
      }}
      className="inset-x-4 inset-y-0 m-auto h-fit w-auto max-w-sm rounded-3xl bg-white p-5 text-navy-900 shadow-card backdrop:bg-navy-950/60 dark:bg-navy-900 dark:text-navy-50"
    >
      <h2 id="confirm-title" className="text-h3 font-bold">
        {title}
      </h2>
      <p id="confirm-message" className="mt-2 text-body text-navy-700 dark:text-navy-200">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="rounded-full bg-cyan-500 px-5 py-2.5 font-bold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 dark:focus-visible:outline-navy-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full px-5 py-2.5 font-bold text-red-700 ring-2 ring-red-200 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-red-300 dark:ring-red-800 dark:hover:bg-red-950"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
