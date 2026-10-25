import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/header";
import { packLimit } from "@/components/pack-card";
import { getDelivery, getPacks, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Корзина · BoboScoop" };

export default async function CartPage() {
  const [settings, delivery, products, packs] = await Promise.all([getSettings(), getDelivery(), getProducts(), getPacks()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-black sm:text-4xl">Корзина</h1>
        <CartView
          pricing={{ tiers: settings.tiers, videoPrice: settings.videoPrice, maxBoxes: settings.maxBoxes }}
          acceptingOrders={settings.acceptingOrders}
          closedMessage={settings.closedMessage}
          methods={delivery.methods.map(({ id, name, price, note }) => ({ id, name, price, note }))}
          packs={packs.map((p) => ({ id: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0] ?? null, limit: packLimit(p) }))}
          zones={delivery.zones.map(({ id, name, extra }) => ({ id, name, extra }))}
          wishOptions={{
            characters: settings.characters,
            colors: settings.colors,
            products: products.filter((p) => p.available).map((p) => p.name),
            maxExclude: settings.maxExclude,
            wishesNote: settings.wishesNote,
          }}
        />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
