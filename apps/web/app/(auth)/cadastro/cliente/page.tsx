'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { signUpClient } from '@/actions/auth';
import Logo from '@/components/Logo';

const cities = ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Viana'];

export default function ClienteRegisterPage() {
  const [success, setSuccess] = useState(false);
  const [state, action, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const email    = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      const phone    = formData.get('phone') as string;
      const city     = formData.get('city') as string;
      const bairro   = formData.get('bairro') as string;

      const res = await signUpClient({ email, password, fullName, phone, city, bairro });
      if (res?.error) return res;
      setSuccess(true);
      return null;
    },
    null
  );

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[420px] bg-white border border-border rounded-2xl p-8 sm:p-10 text-center shadow-2xs">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-light text-success mb-5 border border-success/15 shadow-2xs">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          
          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight mb-2">
            Cadastro realizado!
          </h2>
          <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
            Perfeito! Enviamos um link de ativação para o seu e-mail. Por favor, confirme a conta antes de efetuar o login.
          </p>
          
          <Link
            href="/login"
            className="w-full btn btn-primary py-3 text-xs font-bold block text-center cursor-pointer rounded-xl bg-primary hover:bg-primary-dark shadow-2xs"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px] bg-white border border-border rounded-2xl p-8 sm:p-10 shadow-2xs">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex mb-6 group"
          >
            <Logo size={28} />
          </Link>
          
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight mb-1">
            Criar conta de cliente
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Encontre e contrate profissionais parceiros pertinho de você.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="bg-error-light border border-error/15 rounded-xl p-3 mb-6 text-xs font-semibold text-error text-center" role="alert">
            {state.error}
          </div>
        )}

        {/* Formulario */}
        <form action={action} className="space-y-4">
          
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="text-xs font-semibold text-muted">Nome completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Ex: Clara Silva"
              className="input text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-semibold text-muted">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="clara@email.com"
              className="input text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-xs font-semibold text-muted">Telefone (WhatsApp)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="(27) 99999-9999"
              className="input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="text-xs font-semibold text-muted">Cidade</label>
              <select
                id="city"
                name="city"
                required
                className="input select text-xs cursor-pointer"
              >
                <option value="">Selecionar...</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="bairro" className="text-xs font-semibold text-muted">Bairro</label>
              <input
                id="bairro"
                name="bairro"
                type="text"
                required
                placeholder="Ex: Jd. da Penha"
                className="input text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-semibold text-muted">Senha (mín. 6 caracteres)</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={6}
              className="input text-xs"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={isPending}
            className="w-full btn btn-primary py-3 mt-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-primary hover:bg-primary-dark shadow-2xs"
          >
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Link Footer */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          Já possui conta? <br className="sm:hidden" />
          <Link href="/login" className="text-primary font-bold hover:underline">
            Fazer Login
          </Link>
          <span className="mx-2 text-border">|</span>
          <Link href="/cadastro/cadastro-profissional" className="text-primary font-bold hover:underline">
            Sou Profissional
          </Link>
        </p>
      </div>
    </div>
  );
}
