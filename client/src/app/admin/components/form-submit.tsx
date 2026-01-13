'use client';

import { useFormStatus } from 'react-dom';

type FormSubmitProps = {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
};

export function FormSubmit({
  idleLabel,
  pendingLabel = 'Saving...',
  className,
}: FormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
