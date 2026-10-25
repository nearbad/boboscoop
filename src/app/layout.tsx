import "@fontsource-variable/nunito";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BoboScoop — сюрприз-боксы Sanrio и Chiikawa",
  description:
    "Подарочные сюрприз-боксы в тематике Sanrio и Chiikawa. Собираем ложечками: 1, 2 или 3 ложки, в среднем ~22 предмета. Доставка Яндекс Маркет, Ozon, Wildberries.",
  openGraph: {
    title: "BoboScoop — сюрприз-боксы Sanrio и Chiikawa",
    description: "Собираем подарок ложечками 💓",
    images: ["/bobotik/logo.png"],
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#fff9fb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
