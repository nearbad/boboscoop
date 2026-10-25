// 16px text: smaller inputs make iOS Safari (phones and iPads) zoom the page on focus.
export const control =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-base focus:border-teal focus:outline-none";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-extrabold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-teal" />
      {label}
    </label>
  );
}

export function ImageInput({ current }: { current?: string | null }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-extrabold">Фото</span>
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="h-20 w-20 rounded-xl border-2 border-line object-cover" />
      )}
      <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" className="block text-sm" />
      {current && <Checkbox name="removeImage" label="Удалить фото" />}
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border-2 border-line bg-white p-5">
      {title && <h2 className="mb-4 text-lg font-black">{title}</h2>}
      {children}
    </section>
  );
}

// Collapsed "add new" form, so on phones the list you manage is visible right away.
export function AddSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-3xl border-2 border-dashed border-teal bg-white">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-black text-teal-deep [&::-webkit-details-marker]:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-lg text-white transition group-open:rotate-45" aria-hidden>
          +
        </span>
        {title}
      </summary>
      <div className="border-t-2 border-line p-5">{children}</div>
    </details>
  );
}
