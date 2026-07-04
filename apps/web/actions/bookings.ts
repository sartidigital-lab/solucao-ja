'use server';

import { createClient } from '@/lib/supabase/server';
import { bookingSchema, professionalScheduleSchema } from 'shared';
import { revalidatePath } from 'next/cache';
import { notifyStatusChange } from '@/lib/whatsapp';

export async function createBookingAction(formData: unknown) {
  const result = bookingSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados do agendamento inválidos' };
  }

  const { serviceId, scheduledAt, notes, address } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Você precisa estar logado para agendar um serviço' };
  }

  // 1. Fetch service details
  const { data: service, error: serviceError } = await (supabase.from('services') as any)
    .select('*, professionals(*)')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) {
    return { error: 'Serviço não encontrado' };
  }

  const professional = service.professionals;
  if (!professional) {
    return { error: 'Profissional associado não encontrado' };
  }

  // 2. Calculate deposit/reservation amount based on professional policy
  let depositAmount = 0;
  if (professional.deposit_policy === 'fixed_amount') {
    depositAmount = professional.deposit_fixed_amount || 0;
  } else if (professional.deposit_policy === 'percentage') {
    // 30% deposit policy
    depositAmount = Math.round((service.price * 0.3) * 100) / 100;
  }

  const depositStatus = depositAmount > 0 ? 'pending' : 'none';
  const status = depositAmount > 0 ? 'awaiting_deposit' : 'pending_confirmation';

  // 3. Create the booking entry
  const { data: booking, error: insertError } = await (supabase.from('bookings') as any)
    .insert({
      client_id: user.id,
      professional_id: professional.id,
      service_id: service.id,
      status,
      scheduled_at: scheduledAt,
      duration_minutes: service.duration_minutes,
      price: service.price,
      deposit_amount: depositAmount,
      deposit_status: depositStatus,
      address,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Trigger WhatsApp notification for new request
  await notifyStatusChange(booking.id, 'created');

  revalidatePath('/dashboard');
  return { success: true, data: booking };
}

export async function updateBookingStatusAction(bookingId: string, newStatus: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Fetch the current booking details
  const { data: booking, error: fetchError } = await (supabase.from('bookings') as any)
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: 'Agendamento não encontrado' };
  }

  // Check roles
  const isClient = booking.client_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!isClient && !isProfessional) {
    return { error: 'Não autorizado' };
  }

  // Client can only cancel
  if (isClient && newStatus !== 'cancelled') {
    return { error: 'O cliente só pode solicitar o cancelamento do serviço' };
  }

  const { error: updateError } = await (supabase.from('bookings') as any)
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Trigger WhatsApp notifications based on the new status
  if (newStatus === 'confirmed') {
    await notifyStatusChange(bookingId, 'confirmed');
  } else if (newStatus === 'cancelled') {
    await notifyStatusChange(bookingId, 'cancelled');
  } else if (newStatus === 'completed') {
    await notifyStatusChange(bookingId, 'completed');
  }

  revalidatePath('/dashboard');
  revalidatePath('/profissional/agenda');
  return { success: true };
}

export async function updateProfessionalScheduleAction(slots: any[]) {
  const parsed = professionalScheduleSchema.safeParse(slots);
  if (!parsed.success) {
    return { error: 'Configuração da agenda inválida' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Delete all existing schedule entries
  const { error: deleteError } = await (supabase.from('professional_schedules') as any)
    .delete()
    .eq('professional_id', user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (parsed.data.length === 0) {
    revalidatePath('/profissional/agenda');
    return { success: true };
  }

  // Insert new schedule entries
  const insertData = parsed.data.map(slot => ({
    professional_id: user.id,
    day_of_week: slot.dayOfWeek,
    start_time: slot.startTime,
    end_time: slot.endTime,
    is_active: slot.isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error: insertError } = await (supabase.from('professional_schedules') as any)
    .insert(insertData);

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/profissional/agenda');
  return { success: true };
}
