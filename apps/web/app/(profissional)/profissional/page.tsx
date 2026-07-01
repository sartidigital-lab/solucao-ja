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
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Painel do Profissional
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Bem-vindo de volta, {fullName}! Veja abaixo seu resumo de atividades.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/profissional/agenda"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-teal-500/40 transition flex items-center gap-1.5"
            >
              <Icons.Calendar className="h-4 w-4" /> Editar Agenda
            </Link>
            <Link
              href="/profissional/servicos"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-teal-500/40 transition flex items-center gap-1.5"
            >
              <Icons.Sparkles className="h-4 w-4" /> Meus Serviços
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Revenue Metric */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
              <Icons.DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Faturamento Estimado
              </span>
              <span className="text-2xl font-black text-white">
                R$ {estimatedRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Confirmed Metric */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Icons.CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Agendamentos Confirmados
              </span>
              <span className="text-2xl font-black text-white">{confirmedCount}</span>
            </div>
          </div>

          {/* Pending Metric */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
              <Icons.Inbox className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Pedidos Pendentes
              </span>
              <span className="text-2xl font-black text-white">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Client logic for booking updates */}
        <ProfessionalDashboardClient bookings={bookingsList} />
      </div>
    </div>
  );
}
