"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Review } from "@/lib/db/schema";

// Masonry of reviews; screenshots open full-size in a dialog.
export function ReviewWall({ reviews }: { reviews: Review[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Review | null>(null);

  function show(r: Review) {
    setOpen(r);
    dialog.current?.showModal();
  }

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {reviews.map((r) => (
          <li key={r.id} className="mb-4 break-inside-avoid rounded-blob border-2 border-ink bg-white p-4 shadow-pop">
            {r.imageUrl && (
              <button type="button" onClick={() => show(r)} className="block w-full overflow-hidden rounded-2xl bg-lilac-soft" aria-label="Открыть скриншот отзыва">
                <Image src={r.imageUrl} alt={r.text ? "" : `Отзыв${r.author ? ` от ${r.author}` : ""}`} width={600} height={800} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-auto w-full" />
              </button>
            )}
            {r.text && <p className={`leading-relaxed ${r.imageUrl ? "mt-3" : ""}`}>{r.text}</p>}
            {(r.author || !r.imageUrl) && (
              <p className="mt-3 flex items-center justify-between gap-2">
                <span className="font-extrabold">{r.author}</span>
                <span className="text-pink-deep" aria-label={`Оценка ${r.rating} из 5`}>
                  {"★".repeat(r.rating)}
                  <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                </span>
              </p>
            )}
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92dvh] max-w-[min(92vw,640px)] rounded-3xl bg-transparent p-0 backdrop:bg-ink/70"
      >
        {open?.imageUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.imageUrl} alt="" className="max-h-[92dvh] w-auto rounded-3xl" />
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-lg font-black"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
