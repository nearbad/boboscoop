import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddPackButton } from "@/components/add-pack-button";
import { SiteHeader } from "@/components/header";
import { PackGallery } from "@/components/pack-gallery";
import { packLimit } from "@/components/pack-card";
import { SiteFooter } from "@/components/site-footer";
import { getPack } from "@/lib/catalog";
import { formatRub } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pack = await getPack((await params).slug);
  return { title: pack ? `${pack.title} · BoboScoop` : "BoboScoop", openGraph: pack?.images[0] ? { images: [pack.images[0]] } : undefined };
}

export default async function PackPage({ params }: Props) {
  const [pack, settings] = await Promise.all([getPack((await params).slug), getSettings()]);
  if (!pack) notFound();
  const limit = packLimit(pack);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/shop" className="text-sm font-bold text-ink-soft">← Каталог</Link>
        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <PackGallery images={pack.images} title={pack.title} />
          <div>
            {pack.badge && <p className="inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold">{pack.badge}</p>}
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{pack.title}</h1>
            <p className="mt-3 text-3xl font-black text-teal-deep">{formatRub(pack.price)}</p>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
              {pack.itemsCount && <li className="rounded-full bg-lilac-soft px-3 py-1.5">🎀 {pack.itemsCount} предметов</li>}
              {pack.stock !== null && pack.stock > 0 && <li className="rounded-full bg-pink-soft px-3 py-1.5">осталось {pack.stock} шт.</li>}
              <li className="rounded-full bg-teal-mist px-3 py-1.5">📦 доставка ЯМ / Ozon / WB</li>
            </ul>
            {pack.description && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-soft">{pack.description}</p>}
            <div className="mt-8">
              <AddPackButton packId={pack.id} limit={limit} />
            </div>
            {!settings.acceptingOrders && <p className="mt-4 rounded-2xl bg-lilac-soft p-3 text-sm font-bold">{settings.closedMessage}</p>}
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
