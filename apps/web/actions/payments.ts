'use server';

import { createClient } from '@/lib/supabase/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function generatePixPaymentAction(bookingId: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return { error: 'Pagamentos estão temporariamente indisponíveis.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Não autorizado' };

  const { data: booking, error: bookingError } = await supabase.from('bookings')
    .select('*, services(*), profiles:client_id(*)')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) return { error: 'Agendamento não encontrado' };
  if (booking.client_id !== user.id) return { error: 'Não autorizado' };
  if (booking.deposit_amount <= 0) return { error: 'Este agendamento não exige pagamento de sinal.' };

  const { data: existingPayment } = await supabase.from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (existingPayment?.status === 'approved') {
    return { error: 'O sinal de reserva para este agendamento já foi pago.' };
  }
  if (existingPayment?.status === 'pending') {
    return { error: 'Já existe um pagamento pendente para este agendamento.' };
  }

  try {
    const payment = new Payment(new MercadoPagoConfig({ accessToken }));
    const mpResponse = await payment.create({
      body: {
        transaction_amount: booking.deposit_amount,
        description: `Sinal: ${booking.services?.name || 'Serviço'}`,
        payment_method_id: 'pix',
        external_reference: booking.id,
        metadata: { booking_id: booking.id },
        payer: {
          email: user.email || 'cliente@solucaoja.com',
          first_name: booking.profiles?.full_name?.split(' ')[0] || 'Cliente',
          last_name: booking.profiles?.full_name?.split(' ').slice(1).join(' ') || 'Solução Já',
        },
      },
    });

    const transactionData = mpResponse.point_of_interaction?.transaction_data;
    if (!mpResponse.id || !transactionData?.qr_code || !transactionData.qr_code_base64) {
      return { error: 'Não foi possível gerar o código Pix. Tente novamente.' };
    }

    const { error: insertError } = await supabase.from('payments').insert({
      booking_id: bookingId,
      amount: booking.deposit_amount,
      status: 'pending',
      payment_method: 'pix',
      mercado_pago_payment_id: mpResponse.id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) return { error: insertError.message };

    return {
      success: true,
      data: {
        paymentId: mpResponse.id.toString(),
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
        amount: booking.deposit_amount,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar Pix no Mercado Pago:', error);
    return { error: 'Não foi possível iniciar o pagamento. Tente novamente.' };
  }
}

export async function generateCoinsPaymentAction(packageId: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return { error: 'Pagamentos estão temporariamente indisponíveis.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Não autorizado' };

  // Validar se o usuário é um profissional
  const { data: profile } = await supabase.from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'professional') {
    return { error: 'Apenas profissionais podem comprar pacotes de moedas.' };
  }

  let amount = 0;
  let coinsAmount = 0;
  let packageName = '';

  if (packageId === 'conexao') {
    amount = 49.90;
    coinsAmount = 500;
    packageName = 'Pacote Conexão';
  } else if (packageId === 'avanco') {
    amount = 79.90;
    coinsAmount = 1000;
    packageName = 'Pacote Avanço';
  } else if (packageId === 'prospera') {
    amount = 129.90;
    coinsAmount = 2000;
    packageName = 'Pacote Prospera';
  } else {
    return { error: 'Pacote de moedas inválido.' };
  }

  try {
    const payment = new Payment(new MercadoPagoConfig({ accessToken }));
    const externalReference = `coins_${user.id}_${Date.now()}`;
    const mpResponse = await payment.create({
      body: {
        transaction_amount: amount,
        description: `Compra: ${packageName} (${coinsAmount} moedas)`,
        payment_method_id: 'pix',
        external_reference: externalReference,
        metadata: {
          professional_id: user.id,
          coins_package_id: packageId,
          coins_amount: coinsAmount,
        },
        payer: {
          email: user.email || 'profissional@solucaoja.com',
          first_name: profile.full_name?.split(' ')[0] || 'Profissional',
          last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'Solução Já',
        },
      },
    });

    const transactionData = mpResponse.point_of_interaction?.transaction_data;
    if (!mpResponse.id || !transactionData?.qr_code || !transactionData.qr_code_base64) {
      return { error: 'Não foi possível gerar o código Pix. Tente novamente.' };
    }

    const { error: insertError } = await supabase.from('payments').insert({
      booking_id: null,
      amount,
      status: 'pending',
      payment_method: 'pix',
      mercado_pago_payment_id: mpResponse.id.toString(),
      professional_id: user.id,
      coins_package_id: packageId,
      coins_amount: coinsAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) return { error: insertError.message };

    return {
      success: true,
      data: {
        paymentId: mpResponse.id.toString(),
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
        amount,
        coinsAmount,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar Pix de moedas no Mercado Pago:', error);
    return { error: 'Não foi possível iniciar o pagamento. Tente novamente.' };
  }
}
