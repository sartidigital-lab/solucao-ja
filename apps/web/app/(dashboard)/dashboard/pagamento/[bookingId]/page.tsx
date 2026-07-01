import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generatePixPaymentAction } from '@/actions/payments';
import PagamentoClient from './PagamentoClient';

export default async function PagamentoPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch booking details
  const { data: booking, error: bookingError } = await (supabase.from('bookings') as any)
    .select('*, services(*), professionals(*, profiles(*))')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    notFound();
  }

  // Double check that it belongs to the user
  if (booking.client_id !== user.id) {
    redirect('/dashboard');
  }

  // 2. Generate or fetch Pix payment info
  const paymentRes = await generatePixPaymentAction(bookingId);

  if (paymentRes.error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full w-fit mx-auto">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Erro no Pagamento</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{paymentRes.error}</p>
          <a
            href="/dashboard"
            className="block w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold rounded-lg transition"
          >
            Voltar para o Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Pagamento do Sinal Pix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Efetue o pagamento do sinal para confirmar o agendamento de seu serviço.
          </p>
        </div>

        <PagamentoClient
          booking={booking}
          paymentInfo={paymentRes.data}
        />
      </div>
    </div>
  );
}
