import { deletePack, savePack } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { AddSection, Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { getPacks } from "@/lib/catalog";
import type { Pack } from "@/lib/db/schema";
import { formatRub } from "@/lib/pricing";

function PackFields({ p }: { p?: Pack }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="Название" className="sm:col-span-2"><Input name="title" defaultValue={p?.title} required placeholder="Бокс «Куроми-вечеринка»" /></Field>
      <Field label="Цена, ₽"><Input name="price" type="number" min={1} defaultValue={p?.price} required /></Field>
      <Field label="Предметов внутри"><Input name="itemsCount" type="number" min={0} defaultValue={p?.itemsCount ?? ""} /></Field>
      <Field label="Описание" className="sm:col-span-4"><Textarea name="description" rows={4} defaultValue={p?.description} placeholder="Что внутри, для кого подойдёт…" /></Field>
      <Field label="Остаток, шт." hint="Пусто = без ограничения"><Input name="stock" type="number" min={0} defaultValue={p?.stock ?? ""} /></Field>
      <Field label="Макс. в одном заказе"><Input name="maxPerOrder" type="number" min={1} defaultValue={p?.maxPerOrder ?? 5} /></Field>
      <Field label="Бейдж" hint="Например: Новинка, Хит"><Input name="badge" defaultValue={p?.badge} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={p?.sort ?? 0} /></Field>
      <Field label="Адрес страницы" hint="Латиницей, можно оставить пустым" className="sm:col-span-2">
        <Input name="slug" defaultValue={p?.slug} placeholder="kuromi-party" />
      </Field>
      <div className="flex items-end pb-2 sm:col-span-2">
        <Checkbox name="available" label="Показывать в каталоге" defaultChecked={p?.available ?? true} />
      </div>
      <div className="space-y-2 sm:col-span-4">
        <span className="block text-sm font-extrabold">Фото (первое станет обложкой)</span>
        {p && p.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {p.images.map((src) => (
              <label key={src} className="text-center text-xs font-bold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-20 w-20 rounded-xl border-2 border-line object-cover" />
                <span className="mt-1 flex items-center justify-center gap-1">
                  <input type="checkbox" name="removeImages" value={src} className="accent-pink-deep" /> удалить
                </span>
              </label>
            ))}
          </div>
        )}
        <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="block text-sm" />
      </div>
    </div>
  );
}

export default async function PacksPage() {
  const packs = await getPacks({ includeHidden: true });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Готовые боксы</h1>
        <p className="text-sm text-ink-soft">
          Наборы с фиксированной ценой. Показываются в «Каталоге» и на главной, покупаются без конструктора. Остаток уменьшается после оплаты.
        </p>
      </div>
      <AddSection title="Добавить готовый бокс">
        <ActionForm action={savePack} submitLabel="Добавить" resetOnSuccess>
          <PackFields />
        </ActionForm>
      </AddSection>
      {packs.map((p) => (
        <details key={p.id} className="rounded-3xl border-2 border-line bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            {p.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-pink-soft text-2xl">🎁</span>
            )}
            <span className={`font-black ${p.available ? "" : "text-ink-soft line-through"}`}>{p.title}</span>
            <span className="text-sm text-ink-soft">
              {formatRub(p.price)} · {p.stock === null ? "без лимита" : `осталось ${p.stock}`}
            </span>
            <span className="ml-auto text-xs text-ink-soft">изменить ▾</span>
          </summary>
          <div className="border-t-2 border-line p-4">
            <ActionForm action={savePack} extra={<DeleteButton action={deletePack} />}>
              <PackFields p={p} />
            </ActionForm>
          </div>
        </details>
      ))}
    </div>
  );
}
