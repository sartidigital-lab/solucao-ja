import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AgendarClient from './AgendarClient';

export default async function AgendarPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch service details along with the professional info
  const { data: service, error: serviceError } = await (supabase.from('services') as any)
    .select('*, professionals(*, profiles(*))')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) {
    notFound();
  }

  const professional = service.professionals;
  if (!professional) {
    notFound();
  }

  // 2. Fetch professional weekly schedule config
  const { data: schedule } = await (supabase.from('professional_schedules') as any)
    .select('*')
    .eq('professional_id', professional.id)
    .eq('is_active', true);

  // 3. Fetch future bookings for this professional (to avoid conflicts)
  // Let's select bookings from today onwards
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: existingBookings } = await (supabase.from('bookings') as any)
    .select('*')
    .eq('professional_id', professional.id)
    .neq('status', 'cancelled')
    .gte('scheduled_at', `${todayStr}T00:00:00Z`);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] text-[var(--color-ink)] py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
            Solicitar Agendamento
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
            Escolha uma data e horário de preferência abaixo para o serviço com {professional.profiles?.full_name}.
          </p>
        </div>

        <AgendarClient
          service={service}
          professional={professional}
          weeklySchedule={schedule || []}
          existingBookings={existingBookings || []}
        />
      </div>
    </div>
  );
}
