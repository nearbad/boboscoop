import { updateSettings } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Card, Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { TiersEditor } from "@/components/admin/tiers-editor";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-black">Цены и тексты</h1>
      <ActionForm action={updateSettings} className="mt-4 space-y-4">
        <Card title="Приём заказов">
          <Checkbox name="acceptingOrders" label="Принимаем заказы" defaultChecked={s.acceptingOrders} />
          <Field label="Сообщение, когда заказы закрыты" className="mt-3">
            <Textarea name="closedMessage" defaultValue={s.closedMessage} rows={2} />
          </Field>
        </Card>

        <Card title="Цены">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-sm font-extrabold">Стоимость боксов</span>
              <TiersEditor initial={s.tiers} />
              <p className="mt-2 text-xs text-ink-soft">Максимум ложек в боксе = самый большой вариант.</p>
            </div>
            <div className="space-y-3">
              <Field label="Запись видео, ₽"><Input name="videoPrice" type="number" min={0} defaultValue={s.videoPrice} /></Field>
              <Field label="Предметов в боксе в среднем"><Input name="avgItems" type="number" min={0} defaultValue={s.avgItems} /></Field>
              <Field label="Максимум боксов в заказе"><Input name="maxBoxes" type="number" min={1} max={50} defaultValue={s.maxBoxes} /></Field>
            </div>
          </div>
        </Card>

        <Card title="Пожелания">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Персонажи" hint="По одному на строку">
              <Textarea name="characters" rows={8} defaultValue={s.characters.join("\n")} />
            </Field>
            <Field label="Цвета" hint="По одному на строку">
              <Textarea name="colors" rows={8} defaultValue={s.colors.join("\n")} />
            </Field>
            <Field label="Примечание к пожеланиям" className="md:col-span-2">
              <Textarea name="wishesNote" defaultValue={s.wishesNote} />
            </Field>
            <Field label="Текст про видео" className="md:col-span-2">
              <Textarea name="videoNote" defaultValue={s.videoNote} />
            </Field>
          </div>
        </Card>

        <Card title="Тексты на главной">
          <div className="space-y-3">
            <Field label="Заголовок"><Input name="heroTitle" defaultValue={s.heroTitle} /></Field>
            <Field label="Подзаголовок" hint="{items} заменится на число предметов в боксе">
              <Textarea name="heroSubtitle" rows={2} defaultValue={s.heroSubtitle} />
            </Field>
            <Field label="Про доставку"><Textarea name="deliveryNote" rows={2} defaultValue={s.deliveryNote} /></Field>
            <Field label="Заголовок блока про Боботика"><Input name="aboutTitle" defaultValue={s.aboutTitle} /></Field>
            <Field label="Текст про Боботика"><Textarea name="aboutText" rows={4} defaultValue={s.aboutText} /></Field>
          </div>
        </Card>

        <Card title="Соцсети и контакты">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Telegram"><Input name="telegramUrl" defaultValue={s.telegramUrl} /></Field>
            <Field label="Instagram"><Input name="instagramUrl" defaultValue={s.instagramUrl} /></Field>
            <Field label="TikTok"><Input name="tiktokUrl" defaultValue={s.tiktokUrl} /></Field>
            <Field label="Продавец (ФИО, ИНН)" hint="Показывается в подвале сайта" className="md:col-span-2">
              <Input name="sellerInfo" defaultValue={s.sellerInfo} />
            </Field>
            <Field label="E-mail для связи"><Input name="contactEmail" type="email" defaultValue={s.contactEmail} /></Field>
          </div>
        </Card>

        <Card title="Документы">
          <div className="space-y-3">
            <Field label="Публичная оферта"><Textarea name="offerText" rows={8} defaultValue={s.offerText} /></Field>
            <Field label="Политика конфиденциальности"><Textarea name="privacyText" rows={8} defaultValue={s.privacyText} /></Field>
          </div>
        </Card>
      </ActionForm>
    </div>
  );
}
