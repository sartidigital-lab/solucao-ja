'use client';

import React, { useActionState } from 'react';
import { loginWithPassword, loginWithGoogle } from '@/actions/auth';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const res = await loginWithPassword({ email, password });
      return res || null;
    },
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent">
            Solução Já
          </h1>
          <p className="mt-2 text-sm text-slate-400">Chamou, resolveu.</p>
        </div>

        <form action={action} className="space-y-6">
          {state?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-slate-800"></span>
          <span className="text-xs text-slate-500 uppercase">ou</span>
          <span className="w-1/5 border-b border-slate-800"></span>
        </div>

        <button
          onClick={async () => {
            await loginWithGoogle();
          }}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/30 py-3 text-sm font-semibold text-white hover:bg-slate-800/60 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>

        <div className="mt-8 text-center text-xs text-slate-400">
          Não tem uma conta?{' '}
          <div className="mt-2 flex justify-center gap-4">
            <a href="/cadastro/cliente" className="text-blue-400 hover:underline">
              Cadastro Cliente
            </a>
            <span className="text-slate-600">|</span>
            <a href="/cadastro/cadastro-profissional" className="text-teal-400 hover:underline">
              Cadastro Profissional
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
