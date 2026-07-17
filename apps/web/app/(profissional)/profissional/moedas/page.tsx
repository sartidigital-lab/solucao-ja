import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CoinsClient from './CoinsClient';

export const metadata = {
  title: 'Minhas Moedas — Solução Já',
};

export default async function CoinsPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // 1. Buscar saldo de moedas do profissional
  const { data: prof } = await supabase.from('professionals')
    .select('coins_balance')
    .eq('id', user.id)
    .single();

  const balance = prof?.coins_balance || 0;

  // 2. Buscar histórico de transações de moedas
  const { data: transactions } = await supabase.from('coins_transactions')
    .select('*')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false });

  // 3. Buscar pagamentos pendentes de moedas para exibir Pix em aberto
  const { data: pendingPayments } = await supabase.from('payments')
    .select('*')
    .eq('professional_id', user.id)
    .eq('status', 'pending')
    .is('booking_id', null)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
          Minhas Moedas
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
          Gerencie seus créditos, compre novos pacotes de moedas e acompanhe seu histórico de desbloqueios de leads.
        </p>
      </div>

      <CoinsClient
        initialBalance={balance}
        initialTransactions={transactions || []}
        initialPendingPayments={pendingPayments || []}
      />
    </div>
  );
}
