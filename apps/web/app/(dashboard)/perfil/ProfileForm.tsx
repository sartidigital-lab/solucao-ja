'use client';

import React, { useActionState } from 'react';
import { updateClientProfile } from '@/actions/profile';

interface ProfileFormProps {
  profile: any;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const city = formData.get('city') as string;
      const bairro = formData.get('bairro') as string;

      const res = await updateClientProfile({ fullName, phone, city, bairro });
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

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Nome Completo
        </label>
        <input
          name="fullName"
          type="text"
          required
          defaultValue={profile?.full_name || ''}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Telefone
        </label>
        <input
          name="phone"
          type="tel"
          required
          defaultValue={profile?.phone || ''}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Cidade
          </label>
          <input
            name="city"
            type="text"
            required
            defaultValue={profile?.city || ''}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Bairro
          </label>
          <input
            name="bairro"
            type="text"
            required
            defaultValue={profile?.bairro || ''}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}
