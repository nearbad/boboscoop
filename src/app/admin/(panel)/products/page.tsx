import { deleteProduct, saveProduct, toggleProductAvailable } from "@/app/admin/actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, ImageInput, Input, Textarea } from "@/components/admin/fields";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/db/schema";

function ProductFields({ p }: { p?: Product }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_90px_90px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="Название"><Input name="name" defaultValue={p?.name} required /></Field>
      <Field label="Эмодзи" hint="если нет фото"><Input name="emoji" defaultValue={p?.emoji ?? "🎀"} /></Field>
      <Field label="Порядок"><Input name="sort" type="number" defaultValue={p?.sort ?? 0} /></Field>
      <Field label="Описание (необязательно)" className="sm:col-span-3"><Textarea name="description" rows={2} defaultValue={p?.description} /></Field>
      <div className="sm:col-span-3 flex flex-wrap items-end justify-between gap-4">
        <ImageInput current={p?.imageUrl} />
        <Checkbox name="available" label="В наличии" defaultChecked={p?.available ?? true} />
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Ассортимент</h1>
        <p className="text-sm text-ink-soft">
          Товары показываются на сайте в блоке «Что может попасть в бокс». Предметы «в наличии» покупатель может отметить как «не класть».
        </p>
      </div>
      <Card title="Добавить предмет">
        <ActionForm action={saveProduct} submitLabel="Добавить" resetOnSuccess>
          <ProductFields />
        </ActionForm>
      </Card>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="rounded-2xl border-2 border-line bg-white">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-lilac-soft text-xl">{p.emoji}</span>
                )}
                <span className={`font-bold ${p.available ? "" : "text-ink-soft line-through"}`}>{p.name}</span>
                <span className="ml-auto text-xs text-ink-soft">изменить ▾</span>
              </summary>
              <div className="border-t-2 border-line p-4">
                <ActionForm
                  action={saveProduct}
                  extra={<DeleteButton action={deleteProduct} />}
                >
                  <ProductFields p={p} />
                </ActionForm>
              </div>
            </details>
            <form action={toggleProductAvailable} className="-mt-2 px-3 pb-3">
              <input type="hidden" name="id" value={p.id} />
              <button className={`rounded-full px-3 py-1 text-xs font-extrabold ${p.available ? "bg-teal-mist text-teal-deep" : "bg-lilac-soft text-ink-soft"}`}>
                {p.available ? "✓ в наличии" : "нет в наличии"} · переключить
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
