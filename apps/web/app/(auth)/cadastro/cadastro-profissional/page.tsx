'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { signUpProfessional } from '@/actions/auth';
import Logo from '@/components/Logo';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[460px] bg-white border border-border rounded-2xl p-8 sm:p-10 text-center shadow-2xs">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-light text-success mb-5 border border-success/15 shadow-2xs">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight mb-2">
            Cadastro Recebido!
          </h2>
          <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
            Perfeito! Seus dados foram recebidos. Enviamos um link de confirmação no seu e-mail e nossa administração analisará sua solicitação local para liberação do perfil profissional.
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
      <div className="w-full max-w-[480px] bg-white border border-border rounded-2xl p-8 sm:p-10 shadow-2xs">
        
        {/* Header com Logo */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex mb-4 group"
          >
            <Logo size={28} />
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            Seja um Profissional Parceiro
          </h1>
          <p className="mt-1 text-xs text-muted">Aumente sua carteira de clientes trabalhando perto de casa na Grande Vitória</p>
          
          {/* Indicador de etapas simples e sofisticado */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-border'}`}></span>
            <span className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-border'}`}></span>
          </div>
        </div>

        {/* Form Actions */}
        <form action={action} className="space-y-4">
          
          {state?.error && (
            <div className="bg-error-light border border-error/15 rounded-xl p-3 text-xs font-semibold text-error text-center" role="alert">
              {state.error}
            </div>
          )}

          {/* Etapa 1: Dados do Cadastro Pessoal */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Nome Completo</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  className="input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">E-mail de Trabalho</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="joao@email.com"
                  className="input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Telefone Celular (WhatsApp)</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(27) 99999-9999"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Cidade</label>
                  <input
                    name="city"
                    type="text"
                    required
                    placeholder="Ex: Vitória"
                    className="input text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Bairro</label>
                  <input
                    name="bairro"
                    type="text"
                    required
                    placeholder="Ex: Jd. Camburi"
                    className="input text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full btn btn-primary py-3 mt-2 text-xs font-bold flex items-center justify-center cursor-pointer rounded-xl bg-primary hover:bg-primary-dark shadow-2xs"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Etapa 2: Especialidade e Profissão */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Especialidade / Negócio</label>
                <select
                  name="category"
                  required
                  className="input select text-xs cursor-pointer"
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

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">CPF ou CNPJ (apenas números)</label>
                <input
                  name="cpfCnpj"
                  type="text"
                  required
                  placeholder="12345678909"
                  className="input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Breve Biografia / Apresentação</label>
                <textarea
                  name="bio"
                  required
                  rows={3}
                  placeholder="Fale brevemente sobre o seu trabalho, tempo de atividade e qualificações..."
                  className="input text-xs resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted">Senha de acesso (mínimo 6 caracteres)</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 btn btn-secondary text-xs py-3 border-border hover:bg-surface cursor-pointer rounded-xl font-bold"
                >
                  Voltar
                </button>
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 btn btn-primary py-3 text-xs font-bold flex items-center justify-center cursor-pointer rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-55 shadow-2xs"
                >
                  {isPending ? 'Enviando Dados...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Links Footer */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          Já possui cadastro? <br className="sm:hidden" />
          <Link href="/login" className="text-primary font-bold hover:underline">
            Fazer Login
          </Link>
          <span className="mx-2 text-border">|</span>
          <Link href="/cadastro/cliente" className="text-primary font-bold hover:underline">
            Sou Cliente
          </Link>
        </p>

      </div>
    </div>
  );
}
