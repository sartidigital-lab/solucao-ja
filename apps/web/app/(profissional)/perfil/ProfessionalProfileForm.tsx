'use client';

import React, { useActionState } from 'react';
import { updateProfessionalProfile } from '@/actions/profile';

interface ProfessionalProfileFormProps {
  profile: any;
  professional: any;
}

export default function ProfessionalProfileForm({ profile, professional }: ProfessionalProfileFormProps) {
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
