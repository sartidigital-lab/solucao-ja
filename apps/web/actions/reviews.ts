'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createReviewAction(
  bookingId: string,
  rating: number,
  comment: string | null
) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Não autorizado. Por favor, faça login.' };
  }

  if (rating < 1 || rating > 5) {
    return { error: 'A avaliação deve ser entre 1 e 5 estrelas.' };
  }

  // 2. Fetch booking details to verify client and status
  const { data: booking, error: bookingError } = await supabase.from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return { error: 'Agendamento não encontrado.' };
  }

  if (booking.client_id !== user.id) {
    return { error: 'Você não tem permissão para avaliar este agendamento.' };
  }

  if (booking.status !== 'completed') {
    return { error: 'Você só pode avaliar serviços concluídos.' };
  }

  // 3. Check if review already exists
  const { data: existingReview } = await supabase.from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (existingReview) {
    return { error: 'Você já avaliou este serviço.' };
  }

  // 4. Insert new review
  const { error: insertError } = await supabase.from('reviews')
    .insert({
      booking_id: bookingId,
      client_id: user.id,
      professional_id: booking.professional_id,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    return { error: insertError.message };
  }

  // 5. Revalidate dashboards and search page
  revalidatePath('/dashboard');
  revalidatePath('/busca');
  revalidatePath('/');

  return { success: true };
}
