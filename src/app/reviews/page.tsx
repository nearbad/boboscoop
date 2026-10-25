import type { Metadata } from "next";
import { SiteHeader } from "@/components/header";
import { ReviewWall } from "@/components/review-wall";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { getVisibleReviews } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Отзывы · BoboScoop" };

export default async function ReviewsPage() {
  const [settings, reviews] = await Promise.all([getSettings(), getVisibleReviews()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle as="h1" eyebrow="Отзывы" title="Что говорят бобоскупики">
          Настоящие сообщения от покупателей 💌
        </SectionTitle>
        {reviews.length > 0 ? (
          <ReviewWall reviews={reviews} />
        ) : (
          <p className="rounded-blob border-2 border-dashed border-line bg-white p-8 text-center text-ink-soft">Отзывы скоро появятся</p>
        )}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
