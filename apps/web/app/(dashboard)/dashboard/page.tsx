import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // Fetch client profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch client bookings
  const { data: bookings } = await (supabase.from('bookings') as any)
    .select('*, services(*), professionals(*, profiles(*)), reviews(*)')
    .eq('client_id', user.id)
    .order('scheduled_at', { ascending: false });

  const fullName = profile ? (profile as any).full_name : 'Cliente';

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Olá, {fullName}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aqui você gerencia suas solicitações de serviços, agendamentos ativos e histórico de atendimento.
          </p>
        </div>

        <DashboardClient bookings={bookings || []} />
      </div>
    </div>
  );
}
