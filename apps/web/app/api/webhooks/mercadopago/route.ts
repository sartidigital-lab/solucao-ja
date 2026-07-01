import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Initialize Supabase admin/service role client since webhooks operate outside authenticated browser sessions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isMockMode = () => {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return !token || token.includes('dummy') || token.includes('TEST-XXXXXX');
};

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    // Mercado Pago sends ID either in query parameters (?data.id=X or ?id=X) or in body
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!paymentId) {
      const body = await req.json().catch(() => ({}));
      paymentId = body.data?.id || body.id;
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento não informado' }, { status: 400 });
    }

    // Skip verification if payment is mock
    if (paymentId.startsWith('mock_payment_') || isMockMode()) {
      // Find payment by ID in DB
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('mercado_pago_payment_id', paymentId)
        .single();

      if (payment) {
        // Approve payment
        await supabase
          .from('payments')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', payment.id);

        // Approve booking
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', deposit_status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', payment.booking_id);
      }

      return NextResponse.json({ success: true, message: 'Mock payment approved' });
    }

    // Live Mode verification with Mercado Pago SDK
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    });
    const payment = new Payment(client);
    const mpPayment = await payment.get({ id: paymentId });

    if (mpPayment.status === 'approved') {
      const { data: paymentRow } = await supabase
        .from('payments')
        .select('*')
        .eq('mercado_pago_payment_id', paymentId)
        .single();

      if (paymentRow) {
        // Approve payment
        await supabase
          .from('payments')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', paymentRow.id);

        // Approve booking
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', deposit_status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', paymentRow.booking_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
