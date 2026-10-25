const control =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none";

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
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold">
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
