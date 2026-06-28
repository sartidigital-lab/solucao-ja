'use client';

import React, { useActionState, useState } from 'react';
import { signUpProfessional } from '@/actions/auth';

export default function ProfessionalRegisterPage() {
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const city = formData.get('city') as string;
      const bairro = formData.get('bairro') as string;
      const bio = formData.get('bio') as string;
      const cpfCnpj = formData.get('cpfCnpj') as string;
      const category = formData.get('category') as string;

      const res = await signUpProfessional({
        email,
        password,
        fullName,
        phone,
        city,
        bairro,
        bio,
        cpfCnpj,
        category,
      });

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
          <h2 className="text-2xl font-bold text-teal-400 mb-4">Cadastro de Profissional Enviado!</h2>
          <p className="text-sm text-slate-300 mb-6">
            Seu cadastro foi recebido com sucesso. Enviamos um e-mail de confirmação e nossa equipe analisará seus dados e documentos.
          </p>
          <a
            href="/login"
            className="inline-block w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold hover:bg-teal-500 transition"
          >
            Ir para o Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Seja um Profissional Parceiro
          </h1>
          <p className="mt-2 text-xs text-slate-400">Trabalhe perto de casa na Grande Vitória</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-teal-500' : 'bg-slate-700'}`}></span>
            <span className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`}></span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nome Completo
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  placeholder="Ex: Ana Souza"
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
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  placeholder="ana@email.com"
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
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  placeholder="(27) 98888-8888"
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                    placeholder="Ex: Vila Velha"
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                    placeholder="Ex: Itapuã"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-500"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Categoria de Serviço
                </label>
                <select
                  name="category"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Manicure">Manicure</option>
                  <option value="Cabeleireira">Cabeleireira</option>
                  <option value="Diarista">Diarista / Faxineira</option>
                  <option value="Eletricista">Eletricista</option>
                  <option value="Encanador">Encanador</option>
                  <option value="Pintor">Pintor</option>
                  <option value="Montador de móveis">Montador de Móveis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  CPF ou CNPJ (apenas números)
                </label>
                <input
                  name="cpfCnpj"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  placeholder="12345678909"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Biografia / Sobre seus Serviços
                </label>
                <textarea
                  name="bio"
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 resize-none"
                  placeholder="Fale um pouco sobre suas habilidades e experiência de trabalho..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Senha (mínimo 6 caracteres)
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-lg border border-slate-700 bg-slate-800/30 py-3 text-sm font-semibold text-white hover:bg-slate-800/60"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50"
                >
                  {isPending ? 'Enviando Cadastro...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Já tem conta?{' '}
          <a href="/login" className="text-teal-400 hover:underline font-medium">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
