import type { Metadata } from "next";
import Link from "next/link";
import { AssortmentGrid } from "@/components/assortment-grid";
import { SiteHeader } from "@/components/header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Что может попасть в бокс · BoboScoop" };

export default async function AssortmentPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle as="h1" eyebrow="Ассортимент" title="Что может попасть в бокс">
          Это не отдельные товары, а то, из чего Боботик собирает сюрприз-боксы на ложки. Каждый бокс уникален, в среднем в нём ~
          {settings.avgItems} предмета. До {settings.maxExclude} предметов можно исключить в пожеланиях.
        </SectionTitle>
        <AssortmentGrid products={products} />
        <div className="mt-10 text-center">
          <Link href="/#builder" className="inline-block rounded-full border-2 border-ink bg-pink-deep px-7 py-4 text-lg font-black text-white shadow-pop active:translate-y-1 active:shadow-none">
            Собрать бокс
          </Link>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
