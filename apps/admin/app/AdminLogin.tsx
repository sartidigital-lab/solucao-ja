'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('E-mail ou senha incorretos. Verifique e tente novamente.');
        } else {
          setError(signInError.message);
        }
      } else {
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white border border-border rounded-xl shadow-sm p-8">
        
        {/* Cabecalho de Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <Logo size={32} showText={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-ink leading-tight tracking-tight">
                  Solução <span style={{ color: 'var(--color-primary)', fontWeight: 950 }}>Já</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-orange-50 text-[var(--color-primary)] border border-orange-200">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-ink tracking-tight mb-1.5">
            Acesso ao painel
          </h1>
          <p className="text-xs text-muted">
            Insira suas credenciais para gerenciar a plataforma.
          </p>
        </div>

        {/* Notificacao de Erro */}
        {error && (
          <div className="bg-error-light border border-error/20 text-error text-xs font-semibold px-4 py-2.5 rounded-md mb-5" role="alert">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-xs font-semibold text-muted">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@solucaoja.com.br"
                className="input pl-10 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-muted">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" aria-hidden="true" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10 text-sm"
              />
            </div>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={isPending}
            className="btn btn-primary btn-lg w-full mt-3 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="opacity-25" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                <span>Verificando acesso...</span>
              </>
            ) : (
              <span>Entrar no painel</span>
            )}
          </button>
        </form>

      </div>
    </main>
  );
}
