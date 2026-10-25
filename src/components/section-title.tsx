export function SectionTitle({ eyebrow, title, children, as = "h2" }: { eyebrow: string; title: string; children?: React.ReactNode; as?: "h1" | "h2" }) {
  const Heading = as;
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-sm font-extrabold uppercase tracking-widest text-pink-deep">{eyebrow}</p>
      <Heading className="mt-1 text-3xl font-black leading-tight sm:text-4xl">{title}</Heading>
      {children && <p className="mt-3 text-lg leading-relaxed text-ink-soft">{children}</p>}
    </div>
  );
}
