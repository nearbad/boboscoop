import Link from "next/link";
import { deleteCapsulePrize, saveCapsulePrize, updateCapsuleSettings } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { AddSection, Card, Checkbox, control, Field, ImageInput, Input, Textarea } from "@/components/admin/fields";
import { RarityPill } from "@/components/capsule-opener";
import { formatChance, RARITIES, RARITY } from "@/lib/capsule";
import { getCapsuleStats, getPrizePool, isDrawable } from "@/lib/capsules";
import { db, schema } from "@/lib/db";
import type { CapsulePrize } from "@/lib/db/schema";
import { formatRub } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

function PrizeFields({ p }: { p?: CapsulePrize }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="Приз" className="sm:col-span-2"><Input name="name" defaultValue={p?.name} required placeholder="Плюшевая Куроми" /></Field>
      <Field label="Эмодзи" hint="если нет фото"><Input name="emoji" defaultValue={p?.emoji ?? "🎁"} /></Field>
      <Field label="Редкость">
        <select name="rarity" defaultValue={p?.rarity ?? "common"} className={control}>
          {RARITIES.map((r) => (
            <option key={r} value={r}>{RARITY[r].short}</option>
          ))}
        </select>
      </Field>
      <Field label="Вес (шанс)" hint="Шанс = вес / сумма весов"><Input name="weight" type="number" min={0} defaultValue={p?.weight ?? 10} /></Field>
      <Field label="Остаток, шт." hint="Пусто = без ограничения"><Input name="stock" type="number" min={0} defaultValue={p?.stock ?? ""} /></Field>
      <Field label="Себестоимость, ₽" hint="Видите только вы"><Input name="cost" type="number" min={0} defaultValue={p?.cost ?? 0} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={p?.sort ?? 0} /></Field>
      <Field label="Описание (необязательно)" className="sm:col-span-4"><Input name="description" defaultValue={p?.description} placeholder="Покажем покупателю под названием приза" /></Field>
      <div className="flex flex-wrap items-end justify-between gap-4 sm:col-span-4">
        <ImageInput current={p?.imageUrl} />
        <Checkbox name="active" label="Участвует в розыгрыше" defaultChecked={p?.active ?? true} />
      </div>
    </div>
  );
}

function Stat({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-white p-3 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-bold leading-tight text-ink-soft sm:text-sm">{label}</p>
      <p className="mt-1 text-lg font-black sm:text-2xl">{value}</p>
      <p className="text-[11px] leading-tight text-ink-soft sm:text-xs">{children}</p>
    </div>
  );
}

export default async function CapsuleAdminPage() {
  const [settings, prizes, pool, stats] = await Promise.all([
    getSettings(),
    db.select().from(schema.capsulePrizes).orderBy(schema.capsulePrizes.sort, schema.capsulePrizes.id),
    getPrizePool(),
    getCapsuleStats(),
  ]);
  const total = pool.totalWeight;
  const expectedCost = total > 0 ? pool.prizes.filter(isDrawable).reduce((s, p) => s + (p.weight / total) * p.cost, 0) : 0;
  const boxPrice = settings.tiers.find((t) => t.spoons >= settings.capsuleMinSpoons)?.price;
  const issuedOf = (id: number) => stats.perPrize.find((x) => x.prizeId === id)?.n ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">🎰 Капсула Боботика</h1>
        <p className="text-sm text-ink-soft">
          Подарок к каждому боксу от {settings.capsuleMinSpoons} ложек. Приз разыгрывается в момент оплаты, покупатель открывает капсулу на
          странице заказа. <Link href="/capsule" target="_blank" className="underline">Страница для покупателей ↗</Link>
        </p>
      </div>

      {total === 0 && (
        <p className="rounded-2xl bg-pink-soft p-3 text-sm font-bold">
          Нет ни одного приза, который можно выиграть: капсулы сейчас не выдаются и не показываются на сайте.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Stat label="Себестоимость капсулы" value={formatRub(Math.round(expectedCost))}>
          {boxPrice && expectedCost > 0 ? `≈ ${((expectedCost / boxPrice) * 100).toFixed(1).replace(".", ",")}% от цены бокса` : "в среднем"}
        </Stat>
        <Stat label="Выдано капсул" value={String(stats.issued)}>открыто: {stats.opened}</Stat>
        <Stat label="Призов в игре" value={String(pool.prizes.filter(isDrawable).length)}>сумма весов: {total}</Stat>
      </div>

      <Card title="Настройки">
        <ActionForm action={updateCapsuleSettings}>
          <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-end">
            <Checkbox name="capsuleEnabled" label="Капсулы включены" defaultChecked={settings.capsuleEnabled} />
            <Field label="Капсула за бокс от, ложек">
              <Input name="capsuleMinSpoons" type="number" min={1} defaultValue={settings.capsuleMinSpoons} />
            </Field>
          </div>
          <Field label="Правила для покупателей" hint="{spoons} заменится на «на 3 ложки»" className="mt-3">
            <Textarea name="capsuleRules" rows={6} defaultValue={settings.capsuleRules} />
          </Field>
        </ActionForm>
      </Card>

      <AddSection title="Добавить приз">
        <ActionForm action={saveCapsulePrize} submitLabel="Добавить" resetOnSuccess>
          <PrizeFields />
        </ActionForm>
      </AddSection>

      <ul className="space-y-2">
        {prizes.map((p) => (
          <li key={p.id}>
            <details className="rounded-2xl border-2 border-line bg-white">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-lg text-xl" style={{ background: `${RARITY[p.rarity].color}66` }}>
                  {p.emoji}
                </span>
                <span className={`font-bold ${isDrawable(p) ? "" : "text-ink-soft line-through"}`}>{p.name}</span>
                <RarityPill rarity={p.rarity} />
                <span className="text-sm text-ink-soft">
                  шанс {isDrawable(p) ? formatChance(p.weight, total) : "0%"} · {p.stock === null ? "без лимита" : `осталось ${p.stock}`} · выдано{" "}
                  {issuedOf(p.id)}
                </span>
                <span className="ml-auto text-xs text-ink-soft">изменить ▾</span>
              </summary>
              <div className="border-t-2 border-line p-4">
                <ActionForm action={saveCapsulePrize} extra={<DeleteButton action={deleteCapsulePrize} />}>
                  <PrizeFields p={p} />
                </ActionForm>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
