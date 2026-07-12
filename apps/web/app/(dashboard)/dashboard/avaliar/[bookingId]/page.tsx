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
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-bg)] text-[var(--color-ink)] py-10 px-4 md:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Avaliar Atendimento
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-[68ch]">
            Compartilhe sua experiência. Sua opinião ajuda a manter a comunidade qualificada.
          </p>
        </div>

        <AvaliarClient booking={booking} />
      </div>
    </div>
  );
}
