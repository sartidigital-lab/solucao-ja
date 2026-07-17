import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyStatusChange } from '@/lib/whatsapp';

function isValidSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');

  if (!secret || !signature || !requestId) return false;

  const entries = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, value] = part.trim().split('=', 2);
      return [key, value];
    }),
  );
  const timestamp = entries.ts;
  const receivedHash = entries.v1;
  if (!timestamp || !receivedHash) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');
  const expected = Buffer.from(expectedHash, 'hex');
  const received = Buffer.from(receivedHash, 'hex');

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const dataId = new URL(request.url).searchParams.get('data.id');

  if (!accessToken || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    console.error('Webhook Mercado Pago não configurado.');
    return NextResponse.json({ error: 'Integração indisponível' }, { status: 503 });
  }
  if (!dataId || !isValidSignature(request, dataId)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  try {
    const mpPayment = await new Payment(new MercadoPagoConfig({ accessToken })).get({ id: dataId });
    const supabase = createAdminClient();
    const payments = supabase.from('payments') as any;
    const bookings = supabase.from('bookings') as any;
    const { data: paymentRow, error: paymentError } = await payments
      .select('*')
      .eq('mercado_pago_payment_id', dataId)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!paymentRow) return NextResponse.json({ received: true });

    if (paymentRow.booking_id) {
      const externalReference = (mpPayment as { external_reference?: string | null }).external_reference;
      if (externalReference !== paymentRow.booking_id) {
        console.error('Pagamento Mercado Pago não corresponde ao agendamento.', { dataId });
        return NextResponse.json({ error: 'Referência de pagamento inválida' }, { status: 400 });
      }
    } else {
      const externalReference = (mpPayment as { external_reference?: string | null }).external_reference;
      if (!externalReference || !externalReference.startsWith('coins_')) {
        console.error('Pagamento de moedas com referência inválida.', { dataId });
        return NextResponse.json({ error: 'Referência de pagamento inválida' }, { status: 400 });
      }
    }

    if (mpPayment.status !== 'approved' || paymentRow.status === 'approved') {
      return NextResponse.json({ received: true });
    }

    const { error: paymentUpdateError } = await payments
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', paymentRow.id)
      .eq('status', 'pending');
    if (paymentUpdateError) throw paymentUpdateError;

    if (paymentRow.booking_id) {
      // 1. Fluxo de pagamento de sinal de agendamento (cliente)
      const { error: bookingUpdateError } = await bookings
        .update({ status: 'confirmed', deposit_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', paymentRow.booking_id)
        .eq('status', 'awaiting_deposit');
      if (bookingUpdateError) throw bookingUpdateError;

      await notifyStatusChange(paymentRow.booking_id, 'confirmed');
    } else if (paymentRow.professional_id && paymentRow.coins_amount) {
      // 2. Fluxo de compra de pacote de moedas (profissional)
      const professionals = supabase.from('professionals') as any;
      const transactions = supabase.from('coins_transactions') as any;

      // Buscar o saldo de moedas atual
      const { data: prof, error: fetchProfError } = await professionals
        .select('coins_balance')
        .eq('id', paymentRow.professional_id)
        .single();
      if (fetchProfError) throw fetchProfError;

      const newBalance = (prof?.coins_balance || 0) + paymentRow.coins_amount;

      // Atualizar o saldo de moedas do profissional
      const { error: balanceUpdateError } = await professionals
        .update({ coins_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', paymentRow.professional_id);
      if (balanceUpdateError) throw balanceUpdateError;

      // Inserir registro na tabela de transações de moedas
      const packageName = paymentRow.coins_package_id === 'conexao' ? 'Conexão' : paymentRow.coins_package_id === 'avanco' ? 'Avanço' : 'Prospera';
      const { error: txInsertError } = await transactions.insert({
        professional_id: paymentRow.professional_id,
        booking_id: null,
        amount: paymentRow.coins_amount,
        transaction_type: 'purchase',
        description: `Compra do Pacote ${packageName} (+${paymentRow.coins_amount} moedas)`,
        created_at: new Date().toISOString(),
      });
      if (txInsertError) throw txInsertError;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
