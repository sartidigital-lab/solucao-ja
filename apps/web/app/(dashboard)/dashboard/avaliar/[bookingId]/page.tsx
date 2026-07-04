import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AvaliarClient from './AvaliarClient';

export default async function AvaliarPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch booking details along with professional profile info
  const { data: booking, error: bookingError } = await (supabase.from('bookings') as any)
    .select('*, services(*), professionals(*, profiles(*))')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    notFound();
  }

  // Double check client ownership
  if (booking.client_id !== user.id) {
    redirect('/dashboard');
  }

  // Double check booking status
  if (booking.status !== 'completed') {
    redirect('/dashboard');
  }

  // 2. Fetch existing review to prevent duplicate
  const { data: existingReview } = await (supabase.from('reviews') as any)
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (existingReview) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Avaliar Atendimento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compartilhe sua experiência. Sua opinião ajuda a manter a comunidade qualificada.
          </p>
        </div>

        <AvaliarClient booking={booking} />
      </div>
    </div>
  );
}
