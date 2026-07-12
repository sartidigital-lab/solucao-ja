import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProfessionalDashboardClient from './ProfessionalDashboardClient';

export default async function ProfessionalDashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch professional details & profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Fetch professional stats/metrics from bookings
  // Awaiting deposit, pending confirmation, confirmed, completed, cancelled
  const { data: bookings } = await (supabase.from('bookings') as any)
    .select('*, services(*), profiles:client_id(full_name, phone)')
    .eq('professional_id', user.id);

  const bookingsList = bookings || [];

  const pendingCount = bookingsList.filter((b) => b.status === 'pending_confirmation').length;
  const confirmedCount = bookingsList.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookingsList.filter((b) => b.status === 'completed').length;
  
  // Faturamento is the sum of completed + confirmed bookings prices
  const estimatedRevenue = bookingsList
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const fullName = profile ? (profile as any).full_name : 'Prestador';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] text-[var(--color-ink)] py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
              Painel do Profissional
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
              Bem-vindo de volta, {fullName}! Veja abaixo seu resumo de atividades.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/profissional/agenda"
              className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition flex items-center gap-1.5"
            >
              <Icons.Calendar className="h-4 w-4" /> Editar Agenda
            </Link>
            <Link
              href="/profissional/servicos"
              className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition flex items-center gap-1.5"
            >
              <Icons.Sparkles className="h-4 w-4" /> Meus Serviços
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Revenue Metric */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[var(--color-success-light)] rounded-xl text-[var(--color-success)] border border-[var(--color-success)]/10">
              <Icons.DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block">
                Faturamento Estimado
              </span>
              <span className="text-2xl font-black text-[var(--color-ink)]">
                R$ {estimatedRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Confirmed Metric */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[var(--color-info-light)] rounded-xl text-[var(--color-info)] border border-[var(--color-info)]/10">
              <Icons.CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block">
                Agendamentos Confirmados
              </span>
              <span className="text-2xl font-black text-[var(--color-ink)]">{confirmedCount}</span>
            </div>
          </div>

          {/* Pending Metric */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[var(--color-warning-light)] rounded-xl text-[var(--color-warning)] border border-[var(--color-warning)]/10">
              <Icons.Inbox className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block">
                Pedidos Pendentes
              </span>
              <span className="text-2xl font-black text-[var(--color-ink)]">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Client logic for booking updates */}
        <ProfessionalDashboardClient bookings={bookingsList} />
      </div>
    </div>
  );
}
