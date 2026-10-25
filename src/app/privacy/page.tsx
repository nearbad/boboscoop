import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Политика конфиденциальности · BoboScoop" };

export default async function Page() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Политика конфиденциальности</h1>
        <div className="mt-6 whitespace-pre-line rounded-blob border-2 border-line bg-white p-6 leading-relaxed">
          {settings.privacyText}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
