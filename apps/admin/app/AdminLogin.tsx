'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createClient } from '../lib/supabase/client';

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Solução Já Admin
          </h1>
          <p className="text-[11px] text-slate-500">
            Entre com suas credenciais de administrador para acessar o painel.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-400 block">
              E-mail Administrativo
            </label>
            <div className="relative">
              <Icons.Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@solucaoja.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-400 block">
              Senha de Acesso
            </label>
            <div className="relative">
              <Icons.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg hover:from-red-550 hover:to-rose-550 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-red-950/20"
          >
            {isPending ? (
              <>
                <Icons.Loader2 className="h-4 w-4 animate-spin" /> Verificando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
