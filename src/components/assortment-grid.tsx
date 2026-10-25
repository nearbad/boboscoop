import Image from "next/image";
import type { Product } from "@/lib/db/schema";

export function AssortmentGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {products.map((p) => (
        <li
          key={p.id}
          className={`overflow-hidden rounded-3xl border-2 bg-white ${p.available ? "border-line" : "border-dashed border-line opacity-60"}`}
        >
          <div className="relative grid aspect-square place-items-center bg-lilac-soft">
            {p.imageUrl ? (
              <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
            ) : (
              <span className="text-5xl" aria-hidden>{p.emoji}</span>
            )}
            {!p.available && (
              <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ink-soft">закончилось</span>
            )}
          </div>
          <div className="p-3">
            <p className="font-extrabold leading-tight">{p.name}</p>
            {p.description && <p className="mt-1 text-xs text-ink-soft">{p.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
