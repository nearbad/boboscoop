import { asc } from "drizzle-orm";
import { deleteDeliveryMethod, deleteDeliveryZone, saveDeliveryMethod, saveDeliveryZone } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, Input } from "@/components/admin/fields";
import { db, schema } from "@/lib/db";
import type { DeliveryMethod, DeliveryZone } from "@/lib/db/schema";

function MethodFields({ m }: { m?: DeliveryMethod }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_120px_90px]">
      {m && <input type="hidden" name="id" value={m.id} />}
      <Field label="Служба"><Input name="name" defaultValue={m?.name} required /></Field>
      <Field label="Цена, ₽"><Input name="price" type="number" min={0} defaultValue={m?.price ?? 0} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={m?.sort ?? 0} /></Field>
      <Field label="Подсказка покупателю" className="sm:col-span-2"><Input name="note" defaultValue={m?.note} /></Field>
      <div className="flex items-end pb-2"><Checkbox name="active" label="Включена" defaultChecked={m?.active ?? true} /></div>
    </div>
  );
}

function ZoneFields({ z }: { z?: DeliveryZone }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_120px_90px_auto]">
      {z && <input type="hidden" name="id" value={z.id} />}
      <Field label="Регион"><Input name="name" defaultValue={z?.name} required placeholder="Москва и МО" /></Field>
      <Field label="Надбавка, ₽"><Input name="extra" type="number" min={0} defaultValue={z?.extra ?? 0} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={z?.sort ?? 0} /></Field>
      <div className="flex items-end pb-2"><Checkbox name="active" label="Включён" defaultChecked={z?.active ?? true} /></div>
    </div>
  );
}

export default async function DeliveryPage() {
  const [methods, zones] = await Promise.all([
    db.select().from(schema.deliveryMethods).orderBy(asc(schema.deliveryMethods.sort)),
    db.select().from(schema.deliveryZones).orderBy(asc(schema.deliveryZones.sort)),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Доставка</h1>
        <p className="text-sm text-ink-soft">
          Стоимость доставки = цена службы + надбавка региона. Если регионов нет, покупатель выбирает только службу.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-black">Службы доставки</h2>
        {methods.map((m) => (
          <Card key={m.id}>
            <ActionForm action={saveDeliveryMethod} extra={<DeleteButton action={deleteDeliveryMethod} />}>
              <MethodFields m={m} />
            </ActionForm>
          </Card>
        ))}
        <Card title="Добавить службу">
          <ActionForm action={saveDeliveryMethod} submitLabel="Добавить" resetOnSuccess>
            <MethodFields />
          </ActionForm>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black">Регионы (необязательно)</h2>
        {zones.map((z) => (
          <Card key={z.id}>
            <ActionForm action={saveDeliveryZone} extra={<DeleteButton action={deleteDeliveryZone} />}>
              <ZoneFields z={z} />
            </ActionForm>
          </Card>
        ))}
        <Card title="Добавить регион">
          <ActionForm action={saveDeliveryZone} submitLabel="Добавить" resetOnSuccess>
            <ZoneFields />
          </ActionForm>
        </Card>
      </section>
    </div>
  );
}
