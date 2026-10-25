import { asc } from "drizzle-orm";
import { deleteFaq, saveFaq } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { AddSection, Card, Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { db, schema } from "@/lib/db";
import type { FaqItem } from "@/lib/db/schema";

function FaqFields({ f }: { f?: FaqItem }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
      {f && <input type="hidden" name="id" value={f.id} />}
      <Field label="Вопрос"><Input name="question" defaultValue={f?.question} required /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={f?.sort ?? 0} /></Field>
      <Field label="Ответ" className="sm:col-span-2"><Textarea name="answer" rows={4} defaultValue={f?.answer} required /></Field>
      <Checkbox name="visible" label="Показывать на сайте" defaultChecked={f?.visible ?? true} />
    </div>
  );
}

export default async function FaqPage() {
  const items = await db.select().from(schema.faq).orderBy(asc(schema.faq.sort));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Частые вопросы</h1>
      {items.map((f) => (
        <Card key={f.id}>
          <ActionForm action={saveFaq} extra={<DeleteButton action={deleteFaq} />}>
            <FaqFields f={f} />
          </ActionForm>
        </Card>
      ))}
      <AddSection title="Добавить вопрос">
        <ActionForm action={saveFaq} submitLabel="Добавить" resetOnSuccess>
          <FaqFields />
        </ActionForm>
      </AddSection>
    </div>
  );
}
