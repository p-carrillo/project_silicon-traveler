'use client';

import { useEffect, useState } from 'react';

interface AdminDeleteRoutePointButtonProps {
  formId: string;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  action: (formData: FormData) => void | Promise<void>;
}

export default function AdminDeleteRoutePointButton({
  formId,
  triggerLabel,
  title,
  description,
  confirmLabel,
  cancelLabel,
  action,
}: AdminDeleteRoutePointButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-10 rounded-md border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-800"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-2xl">
            <h2 id="admin-delete-modal-title" className="text-base font-semibold text-zinc-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{description}</p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                form={formId}
                formAction={action}
                formNoValidate
                className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
