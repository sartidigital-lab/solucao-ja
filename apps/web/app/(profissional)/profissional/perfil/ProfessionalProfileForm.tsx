'use client';

import React, { useActionState, useState } from 'react';
import { updateProfessionalProfile } from '@/actions/profile';

interface ProfessionalProfileFormProps {
  profile: any;
  professional: any;
}

export default function ProfessionalProfileForm({ profile, professional }: ProfessionalProfileFormProps) {
  const [policy, setPolicy] = useState(professional?.deposit_policy || 'no_deposit');

  const [plan, setPlan] = useState(professional?.subscription_plan || 'gratuito');

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const city = formData.get('city') as string;
      const bairro = formData.get('bairro') as string;
      const bio = formData.get('bio') as string;
      const cpfCnpj = formData.get('cpfCnpj') as string;
      const attendanceType = formData.get('attendanceType') as 'home' | 'salon' | 'both';
      const serviceAreaRadiusKm = Number(formData.get('serviceAreaRadiusKm'));
      const isAvailableNow = formData.get('isAvailableNow') === 'true';
      const depositPolicy = formData.get('depositPolicy') as 'no_deposit' | 'fixed_amount' | 'percentage';
      const depositFixedAmount = Number(formData.get('depositFixedAmount'));
      const subscriptionPlan = formData.get('subscriptionPlan') as 'gratuito' | 'profissional' | 'destaque';

      const res = await updateProfessionalProfile({
        fullName,
        phone,
        city,
        bairro,
        bio,
        cpfCnpj,
        attendanceType,
        serviceAreaRadiusKm,
        isAvailableNow,
        depositPolicy,
        depositFixedAmount,
        subscriptionPlan,
      });

      return res || { success: true };
    },
    null
  );

  return (
    <form action={action} className="space-y-6 bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
          Perfil atualizado com sucesso!
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
            Dados Básicos
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
            <input
              name="fullName"
              type="text"
              required
              defaultValue={profile?.full_name || ''}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Telefone</label>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={profile?.phone || ''}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cidade</label>
              <input
                name="city"
                type="text"
                required
                defaultValue={profile?.city || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Bairro</label>
              <input
                name="bairro"
                type="text"
                required
                defaultValue={profile?.bairro || ''}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">CPF ou CNPJ</label>
            <input
              name="cpfCnpj"
              type="text"
              required
              defaultValue={professional?.cpf_cnpj || ''}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Right Column: Professional Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
            Informações do Serviço
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Tipo de Atendimento</label>
            <select
              name="attendanceType"
              defaultValue={professional?.attendance_type || 'home'}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            >
              <option value="home">A Domicílio</option>
              <option value="salon">No meu Estabelecimento</option>
              <option value="both">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Raio de Cobertura (KM)</label>
            <input
              name="serviceAreaRadiusKm"
              type="number"
              required
              min="1"
              max="100"
              defaultValue={professional?.service_area_radius_km || 10}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Status de Disponibilidade</label>
            <select
              name="isAvailableNow"
              defaultValue={professional?.is_available_now ? 'true' : 'false'}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            >
              <option value="true">Disponível Agora</option>
              <option value="false">Ocupado / Indisponível</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Política de Sinal (Reserva)</label>
            <select
              name="depositPolicy"
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
            >
              <option value="no_deposit">Sem sinal (Pagamento integral no local)</option>
              <option value="percentage">Sinal padrão de 30% do valor do serviço</option>
              <option value="fixed_amount">Sinal com Valor Fixo</option>
            </select>
          </div>

          {policy === 'fixed_amount' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor do Sinal Fixo (R$)</label>
              <input
                name="depositFixedAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={professional?.deposit_fixed_amount || 0}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition"
              />
            </div>
          )}

          <div className="md:col-span-2 border-t border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <span className="text-teal-400">⚡</span> Escolha seu Plano de Assinatura
            </h3>
            
            <input type="hidden" name="subscriptionPlan" value={plan} />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Gratuito */}
              <button
                type="button"
                onClick={() => setPlan('gratuito')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  plan === 'gratuito'
                    ? 'border-teal-500 bg-teal-500/5'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">Gratuito</span>
                  <span className="text-xl font-black text-white">Grátis</span>
                  <ul className="text-[10px] text-slate-450 space-y-1.5 mt-3 border-t border-slate-800/60 pt-3">
                    <li>✓ Limite de 3 serviços</li>
                    <li>✓ Limite de 3 fotos</li>
                    <li className="text-slate-600">✗ Busca priorizada</li>
                  </ul>
                </div>
                <div className={`mt-4 w-full py-1.5 rounded-lg text-center text-[10px] font-bold ${
                  plan === 'gratuito' ? 'bg-teal-500 text-slate-950' : 'bg-slate-850 text-slate-400'
                }`}>
                  {plan === 'gratuito' ? 'Ativo' : 'Selecionar'}
                </div>
              </button>

              {/* Profissional */}
              <button
                type="button"
                onClick={() => setPlan('profissional')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  plan === 'profissional'
                    ? 'border-teal-500 bg-teal-500/5'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-teal-400 block mb-1">Profissional</span>
                  <span className="text-xl font-black text-white">R$ 29,90<span className="text-xs font-normal text-slate-500">/mês</span></span>
                  <ul className="text-[10px] text-slate-450 space-y-1.5 mt-3 border-t border-slate-800/60 pt-3">
                    <li>✓ Serviços ilimitados</li>
                    <li>✓ Limite de 10 fotos</li>
                    <li className="text-slate-650">✗ Busca priorizada</li>
                  </ul>
                </div>
                <div className={`mt-4 w-full py-1.5 rounded-lg text-center text-[10px] font-bold ${
                  plan === 'profissional' ? 'bg-teal-500 text-slate-950' : 'bg-slate-850 text-slate-400'
                }`}>
                  {plan === 'profissional' ? 'Ativo' : 'Selecionar'}
                </div>
              </button>

              {/* Destaque */}
              <button
                type="button"
                onClick={() => setPlan('destaque')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                  plan === 'destaque'
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-bl">
                  POPULAR
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 block mb-1">Destaque</span>
                  <span className="text-xl font-black text-white">R$ 59,90<span className="text-xs font-normal text-slate-500">/mês</span></span>
                  <ul className="text-[10px] text-slate-450 space-y-1.5 mt-3 border-t border-slate-800/60 pt-3">
                    <li>✓ Serviços ilimitados</li>
                    <li>✓ Limite de 30 fotos</li>
                    <li className="text-amber-400 font-bold">✓ Busca priorizada (topo)</li>
                  </ul>
                </div>
                <div className={`mt-4 w-full py-1.5 rounded-lg text-center text-[10px] font-bold ${
                  plan === 'destaque' ? 'bg-amber-500 text-slate-950' : 'bg-slate-850 text-slate-400'
                }`}>
                  {plan === 'destaque' ? 'Ativo' : 'Selecionar'}
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Sobre mim (Biografia)</label>
            <textarea
              name="bio"
              required
              rows={4}
              defaultValue={professional?.bio || ''}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white outline-none focus:border-teal-500 transition resize-none"
              placeholder="Descreva suas habilidades e especialidades..."
            ></textarea>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-teal-500 hover:to-emerald-500 transition disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}
