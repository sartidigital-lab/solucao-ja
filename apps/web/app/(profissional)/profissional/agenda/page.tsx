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
    <div className="min-h-screen bg-slate-950 text-white py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Minha Agenda & Agendamentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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
