"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="dotted-bg grid min-h-dvh place-items-center px-4">
      <form action={action} className="w-full max-w-sm rounded-[2rem] border-2 border-ink bg-white p-8 text-center shadow-pop">
        <Image src="/icon.png" alt="" width={80} height={80} className="mx-auto" />
        <h1 className="mt-3 text-2xl font-black">Админка BoboScoop</h1>
        <label htmlFor="password" className="sr-only">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Пароль"
          className="mt-6 w-full rounded-2xl border-2 border-line px-4 py-3 focus:border-teal focus:outline-none"
        />
        {state?.error && <p className="mt-3 text-sm font-bold text-pink-deep" role="alert">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-full border-2 border-ink bg-pink-deep py-3 font-black text-white shadow-pop active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          Войти
        </button>
      </form>
    </main>
  );
}
