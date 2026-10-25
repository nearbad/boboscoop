import Image from "next/image";
import Link from "next/link";
import { AddPackButton } from "@/components/add-pack-button";
import type { Pack } from "@/lib/db/schema";
import { formatRub } from "@/lib/pricing";

export function packLimit(p: Pack) {
  return p.stock === null ? p.maxPerOrder : Math.min(p.stock, p.maxPerOrder);
}

export function PackCard({ pack }: { pack: Pack }) {
  const cover = pack.images[0];
  return (
    <li className="flex flex-col overflow-hidden rounded-blob border-2 border-ink bg-white shadow-pop">
      <Link href={`/shop/${pack.slug}`} className="relative block aspect-[4/3] bg-pink-soft">
        {cover ? (
          <Image src={cover} alt={pack.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-6xl" aria-hidden>🎁</span>
        )}
        {pack.badge && (
          <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold">{pack.badge}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/shop/${pack.slug}`} className="text-xl font-black hover:underline">{pack.title}</Link>
        <p className="mt-1 text-sm text-ink-soft">
          {pack.itemsCount ? `${pack.itemsCount} предметов` : "Готовый набор"}
          {pack.stock !== null && pack.stock > 0 && pack.stock <= 5 ? ` · осталось ${pack.stock}` : ""}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <span className="text-2xl font-black text-teal-deep">{formatRub(pack.price)}</span>
          <AddPackButton packId={pack.id} limit={packLimit(pack)} compact />
        </div>
      </div>
    </li>
  );
}
