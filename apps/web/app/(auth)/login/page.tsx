'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginWithPassword, loginWithGoogle } from '@/actions/auth';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const res = await loginWithPassword({ email, password });
      return res || null;
    },
    null
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white border border-border rounded-2xl p-8 sm:p-10 shadow-2xs">
        
        {/* Logo e Titulos */}
        <div className="mb-8">
          <Link
            href="/"
            aria-label="Solução Já — Página inicial"
            className="inline-flex mb-6 group"
          >
            <Logo size={28} />
          </Link>
          
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight mb-1">
            Boas-vindas de volta
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Entre na sua conta para buscar e contratar profissionais ativos.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="bg-error-light border border-error/15 rounded-xl p-3 mb-6 text-xs font-semibold text-error text-center" role="alert">
            {state.error === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos. Por favor, verifique.'
              : state.error}
          </div>
        )}

        {/* Formulario */}
        <form action={action} className="space-y-4">
          
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-semibold text-muted">Endereço de E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="exemplo@email.com"
              className="input text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-muted">Senha</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input text-xs"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isPending}
            className="w-full btn btn-primary py-3 mt-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-primary hover:bg-primary-dark shadow-2xs"
          >
            {isPending ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25"/>
                  <path d="M21 12a9 9 0 00-9-9"/>
                </svg>
                <span>Acessando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        {/* Linha Divisoria */}
        <div className="flex items-center gap-3 my-6">
          <hr className="flex-1 border-border" />
          <span className="text-[10px] uppercase font-bold text-subtle tracking-wider select-none">Ou continue com</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Google Login */}
        <button
          id="google-login"
          type="button"
          onClick={async () => { await loginWithGoogle(); }}
          className="w-full btn btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-2 border-border/80 hover:bg-surface cursor-pointer rounded-xl text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com o Google
        </button>

        {/* Links de Registro */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          Não possui uma conta? <br className="sm:hidden" />
          <Link href="/cadastro/cliente" className="text-primary font-bold hover:underline">
            Cadastrar Cliente
          </Link>
          <span className="mx-2 text-border">|</span>
          <Link href="/cadastro/cadastro-profissional" className="text-primary font-bold hover:underline">
            Trabalhar como Profissional
          </Link>
        </p>
      </div>
    </div>
  );
}
