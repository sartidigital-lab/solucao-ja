import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AgendaClient from './AgendaClient';

export default async function AgendaPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch current weekly schedule slots
  const { data: weeklySchedule } = await (supabase.from('professional_schedules') as any)
    .select('*')
    .eq('professional_id', user.id)
    .order('day_of_week')
    .order('start_time');

  // 2. Fetch pending confirmation bookings
  const { data: pendingBookings } = await (supabase.from('bookings') as any)
    .select('*, services(*), profiles:client_id(full_name, phone)')
    .eq('professional_id', user.id)
    .eq('status', 'pending_confirmation')
    .order('scheduled_at');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] text-[var(--color-ink)] py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
            Minha Agenda & Agendamentos
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
            Configure seu horário semanal de atendimento e gerencie as solicitações recebidas.
          </p>
        </div>

        <AgendaClient
          initialSchedule={weeklySchedule || []}
          pendingBookings={pendingBookings || []}
        />
      </div>
    </div>
  );
}
