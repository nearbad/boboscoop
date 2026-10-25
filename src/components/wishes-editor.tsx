"use client";

import type { Wishes } from "@/lib/pricing";

export type WishOptions = {
  characters: string[];
  colors: string[];
  products: string[];
  wishesNote: string;
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipGroup({
  legend,
  hint,
  options,
  selected,
  onChange,
  tone,
}: {
  legend: string;
  hint?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  tone: "pink" | "teal" | "no";
}) {
  const on = {
    pink: "border-pink-deep bg-pink-soft text-ink",
    teal: "border-teal bg-teal-mist text-ink",
    no: "border-ink-soft bg-lilac-soft text-ink line-through decoration-pink-deep decoration-2",
  }[tone];
  if (options.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-1 font-extrabold">{legend}</legend>
      {hint && <p className="mb-2 text-sm text-ink-soft">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(toggle(selected, o))}
              className={`min-h-10 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition ${
                active ? on : "border-line bg-white text-ink-soft hover:border-pink"
              }`}
            >
              {tone === "no" && active ? "🚫 " : active ? "✓ " : ""}
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function WishesEditor({
  value,
  onChange,
  options,
  idPrefix,
}: {
  value: Wishes;
  onChange: (w: Wishes) => void;
  options: WishOptions;
  idPrefix: string;
}) {
  return (
    <div className="space-y-6">
      <ChipGroup
        legend="Любимые персонажи"
        hint="Можно выбрать несколько"
        options={options.characters}
        selected={value.characters}
        onChange={(characters) => onChange({ ...value, characters })}
        tone="pink"
      />
      <ChipGroup
        legend="Любимые цвета"
        options={options.colors}
        selected={value.colors}
        onChange={(colors) => onChange({ ...value, colors })}
        tone="teal"
      />
      <ChipGroup
        legend="Что не класть в бокс"
        hint="Отметьте предметы, которые не хотите получать. Заменим их на другие"
        options={options.products}
        selected={value.exclude}
        onChange={(exclude) => onChange({ ...value, exclude })}
        tone="no"
      />
      <div>
        <label htmlFor={`${idPrefix}-comment`} className="mb-1 block font-extrabold">
          Ещё пожелания
        </label>
        <textarea
          id={`${idPrefix}-comment`}
          value={value.comment}
          maxLength={1000}
          rows={3}
          onChange={(e) => onChange({ ...value, comment: e.target.value })}
          placeholder="Например: это подарок подруге на день рождения, она обожает Куроми и всё фиолетовое"
          className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 placeholder:text-ink-soft/60 focus:border-teal focus:outline-none"
        />
      </div>
      <p className="flex gap-3 rounded-2xl bg-lilac-soft p-4 text-sm leading-relaxed text-ink-soft">
        <span aria-hidden className="text-xl">🐾</span>
        <span>{options.wishesNote}</span>
      </p>
    </div>
  );
}
