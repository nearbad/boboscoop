import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDelivery, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Корзина · BoboScoop" };

export default async function CartPage() {
  const [settings, delivery, products] = await Promise.all([getSettings(), getDelivery(), getProducts()]);
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
          zones={delivery.zones.map(({ id, name, extra }) => ({ id, name, extra }))}
          wishOptions={{
            characters: settings.characters,
            colors: settings.colors,
            products: products.filter((p) => p.available).map((p) => p.name),
            wishesNote: settings.wishesNote,
          }}
        />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
