import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Image src="/bobotik/bobotik-hi.png" alt="" width={200} height={180} className="mx-auto" />
        <h1 className="mt-4 text-3xl font-black">Боботик не нашёл эту страницу</h1>
        <Link href="/" className="mt-6 inline-block rounded-full border-2 border-ink bg-pink-deep px-6 py-3 font-black text-white shadow-pop">
          На главную
        </Link>
      </div>
    </main>
  );
}
