import { asc } from "drizzle-orm";
import { deleteReview, saveReview, uploadReviewScreenshots } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, ImageInput, Input, Textarea } from "@/components/admin/fields";
import { db, schema } from "@/lib/db";
import type { Review } from "@/lib/db/schema";

function ReviewFields({ r }: { r?: Review }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_100px_90px]">
      {r && <input type="hidden" name="id" value={r.id} />}
      <Field label="Автор (необязательно)"><Input name="author" defaultValue={r?.author} placeholder="@nickname" /></Field>
      <Field label="Оценка"><Input name="rating" type="number" min={1} max={5} defaultValue={r?.rating ?? 5} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={r?.sort ?? 0} /></Field>
      <Field label="Текст (необязательно, если есть скриншот)" className="sm:col-span-3"><Textarea name="text" defaultValue={r?.text} /></Field>
      <div className="sm:col-span-3 flex flex-wrap items-end justify-between gap-4">
        <ImageInput current={r?.imageUrl} />
        <Checkbox name="visible" label="Показывать на сайте" defaultChecked={r?.visible ?? true} />
      </div>
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await db.select().from(schema.reviews).orderBy(asc(schema.reviews.sort));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Отзывы</h1>
        <p className="text-sm text-ink-soft">Блок «Отзывы» появляется на сайте, когда есть хотя бы один видимый отзыв.</p>
      </div>
      <Card title="📸 Загрузить скриншоты отзывов">
        <ActionForm action={uploadReviewScreenshots} submitLabel="Загрузить" resetOnSuccess>
          <p className="mb-3 text-sm text-ink-soft">
            Выберите сразу несколько скриншотов сообщений от покупателей: каждый станет отдельным отзывом. Перед публикацией
            замажьте личные данные (номера телефонов, адреса), если они видны.
          </p>
          <input type="file" name="images" multiple required accept="image/jpeg,image/png,image/webp" className="block text-sm" />
        </ActionForm>
      </Card>
      <Card title="Добавить текстовый отзыв">
        <ActionForm action={saveReview} submitLabel="Добавить" resetOnSuccess>
          <ReviewFields />
        </ActionForm>
      </Card>
      {reviews.map((r) => (
        <Card key={r.id}>
          <ActionForm action={saveReview} extra={<DeleteButton action={deleteReview} />}>
            <ReviewFields r={r} />
          </ActionForm>
        </Card>
      ))}
    </div>
  );
}
