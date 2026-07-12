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
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] text-[var(--color-ink)] py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
            Olá, {fullName}!
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
            Aqui você gerencia suas solicitações de serviços, agendamentos ativos e histórico de atendimento.
          </p>
        </div>

        <DashboardClient bookings={bookings || []} />
      </div>
    </div>
  );
}
