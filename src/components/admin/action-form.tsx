"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";

type Action = (prev: ActionState, f: FormData) => Promise<ActionState>;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-teal px-5 py-2 text-sm font-extrabold text-white transition hover:bg-teal-deep disabled:opacity-50"
    >
      {pending ? "Сохраняем…" : label}
    </button>
  );
}

// Form bound to a server action, showing a saved/error message next to the submit button.
export function ActionForm({
  action,
  children,
  submitLabel = "Сохранить",
  resetOnSuccess = false,
  className = "",
  extra,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
  extra?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Submit label={submitLabel} />
        {extra}
        {state?.ok && <span className="text-sm font-bold text-teal-deep" role="status">Сохранено ✓</span>}
        {state?.error && <span className="text-sm font-bold text-pink-deep" role="alert">{state.error}</span>}
      </div>
    </form>
  );
}

// Submits the surrounding form to a different server action (e.g. delete) after a confirm dialog.
export function DeleteButton({ action, message = "Точно удалить?" }: { action: (f: FormData) => Promise<void>; message?: string }) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft hover:bg-pink-soft hover:text-ink"
    >
      Удалить
    </button>
  );
}
