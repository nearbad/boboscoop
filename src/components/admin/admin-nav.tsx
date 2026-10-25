"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  const isCurrent = (href: string) => (href === "/admin" ? path === "/admin" || path.startsWith("/admin/orders") : path.startsWith(href));
  return (
    <nav className="order-last flex w-full flex-wrap gap-1.5 md:order-none md:w-auto md:flex-1" aria-label="Разделы админки">
      {items.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={isCurrent(n.href) ? "page" : undefined}
          className="flex min-h-10 items-center whitespace-nowrap rounded-full bg-cream px-3 text-sm font-bold text-ink-soft ring-1 ring-line hover:bg-pink-soft hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-white aria-[current=page]:ring-ink md:bg-transparent md:ring-0"
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
