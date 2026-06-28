'use client';

import React, { useActionState, useState } from 'react';
import { signUpClient } from '@/actions/auth';

export default function ClienteRegisterPage() {
  const [success, setSuccess] = useState(false);
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const city = formData.get('city') as string;
      const bairro = formData.get('bairro') as string;

      const res = await signUpClient({ email, password, fullName, phone, city, bairro });
      if (res?.error) {
        return res;
      }
      setSuccess(true);
      return null;
    },
    null
  );

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Cadastro Realizado!</h2>
          <p className="text-sm text-slate-300 mb-6">
            Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada.
          </p>
          <a
            href="/login"
            className="inline-block w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500 transition"
          >
            Ir para o Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Cadastro de Cliente
          </h1>
          <p className="mt-2 text-xs text-slate-400">Encontre os melhores profissionais locais</p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Nome Completo
            </label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Telefone
            </label>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="(27) 99999-9999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cidade
              </label>
              <input
                name="city"
                type="text"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Cariacica"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Bairro
              </label>
              <input
                name="bairro"
                type="text"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Campo Grande"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Senha (min 6 caracteres)
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Já tem conta?   {' '}
          <a href="/login" className="text-blue-400 hover:underline font-medium">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
