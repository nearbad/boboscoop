"use client";

import Image from "next/image";
import { useState } from "react";

export function PackGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="grid aspect-square place-items-center rounded-blob border-2 border-ink bg-pink-soft text-8xl" aria-hidden>🎁</div>;
  }
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-blob border-2 border-ink bg-white">
        <Image src={images[active]} alt={title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${i === active ? "border-ink" : "border-line"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
