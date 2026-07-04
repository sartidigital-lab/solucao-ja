'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { notifyStatusChange } from '@/lib/whatsapp';

// Helper to determine if we should run in Mock mode
const isMockMode = () => {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return !token || token.includes('dummy') || token.includes('TEST-XXXXXX');
};

export async function generatePixPaymentAction(bookingId: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // 1. Fetch booking details along with client details
  const { data: booking, error: bookingError } = await (supabase.from('bookings') as any)
    .select('*, services(*), profiles:client_id(*)')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return { error: 'Agendamento não encontrado' };
  }

  if (booking.deposit_amount <= 0) {
    return { error: 'Este agendamento não exige pagamento de sinal.' };
  }

  // Check if a payment has already been approved
  const { data: existingPayment } = await (supabase.from('payments') as any)
    .select('*')
    .eq('booking_id', bookingId)
    .eq('status', 'approved')
    .single();

  if (existingPayment) {
    return { error: 'O sinal de reserva para este agendamento já foi pago.' };
  }

  let paymentId = 'mock_payment_' + Math.random().toString(36).substring(2, 9);
  let qrCode = '00020101021226830014br.gov.bcb.pix25610014br.gov.bcb.pix0139solucaoja-pix-mock-test-code520400005303986540515.005802BR5910SolucaoJa6008Vitoria62070503***63041D9C';
  let qrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // Single pixel placeholder

  if (!isMockMode()) {
    try {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
      });
      const payment = new Payment(client);

      const mpResponse = await payment.create({
        body: {
          transaction_amount: booking.deposit_amount,
          description: `Sinal: ${booking.services?.name || 'Serviço'}`,
          payment_method_id: 'pix',
          payer: {
            email: user.email || 'cliente@solucaoja.com',
            first_name: booking.profiles?.full_name?.split(' ')[0] || 'Cliente',
            last_name: booking.profiles?.full_name?.split(' ').slice(1).join(' ') || 'Solução Já',
          },
        },
      });

      if (mpResponse.id) {
        paymentId = mpResponse.id.toString();
        const transactionData = mpResponse.point_of_interaction?.transaction_data;
        qrCode = transactionData?.qr_code || qrCode;
        qrCodeBase64 = transactionData?.qr_code_base64 || qrCodeBase64;
      }
    } catch (e: any) {
      console.error('Error generating Mercado Pago Pix payment, falling back to Mock:', e);
    }
  }

  // Create payment record in database
  const { data: newPayment, error: insertError } = await (supabase.from('payments') as any)
    .insert({
      booking_id: bookingId,
      amount: booking.deposit_amount,
      status: 'pending',
      payment_method: 'pix',
      mercado_pago_payment_id: paymentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  return {
    success: true,
    data: {
      paymentId,
      qrCode,
      qrCodeBase64,
      amount: booking.deposit_amount,
    },
  };
}

export async function simulateMercadoPagoWebhookAction(bookingId: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // 1. Update all pending payments for this booking to approved
  const { error: paymentError } = await (supabase.from('payments') as any)
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('booking_id', bookingId)
    .eq('status', 'pending');

  if (paymentError) {
    return { error: paymentError.message };
  }

  // 2. Update booking status to confirmed and deposit_status to paid
  const { error: bookingError } = await (supabase.from('bookings') as any)
    .update({
      status: 'confirmed',
      deposit_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (bookingError) {
    return { error: bookingError.message };
  }

  // Trigger WhatsApp alerts for confirmed booking
  await notifyStatusChange(bookingId, 'confirmed');

  revalidatePath('/dashboard');
  return { success: true };
}
