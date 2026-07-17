import { createAdminClient } from '@/lib/supabase/admin';

export async function sendWhatsAppAlert(phone: string, message: string) {
  const formattedPhone = phone.replace(/\D/g, '');
  if (!formattedPhone) return;

  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (apiToken && phoneNumberId && !apiToken.includes('dummy')) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: `55${formattedPhone}`,
            type: 'text',
            text: {
              body: message,
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error('WhatsApp API response error:', errData);
      } else {
        console.log(`WhatsApp message successfully sent to 55${formattedPhone} via Meta API.`);
      }
    } catch (error) {
      console.error('WhatsApp API request failed:', error);
    }
  } else {
    // Print styled ASCII simulation block to server logs
    console.log(`
┌────────────────────────────────────────────────────────────┐
│              SIMULAÇÃO DE NOTIFICAÇÃO WHATSAPP              │
├────────────────────────────────────────────────────────────┤
│ Para: 55${formattedPhone.padEnd(50, ' ')} │
│ Mensagem:                                                  │
│ "${message.padEnd(54, ' ')}"
└────────────────────────────────────────────────────────────┘
`);
  }
}

export async function notifyStatusChange(bookingId: string, event: 'created' | 'confirmed' | 'cancelled' | 'completed') {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    // Notifications are supplementary: a missing integration must not block a
    // booking or payment state transition.
    console.error('Integração de notificações indisponível:', error);
    return;
  }

  const { data: booking } = await (supabase.from('bookings') as any)
    .select('*, services(*), client:client_id(full_name, phone), professional:professional_id(profiles(full_name, phone))')
    .eq('id', bookingId)
    .single();

  if (!booking) return;

  const clientName = booking.client?.full_name || 'Cliente';
  const clientPhone = booking.client?.phone || '';
  const profName = booking.professional?.profiles?.full_name || 'Prestador';
  const profPhone = booking.professional?.profiles?.phone || '';
  const serviceName = booking.services?.name || 'Serviço';

  const scheduledDate = new Date(booking.scheduled_at).toLocaleDateString('pt-BR');
  const scheduledTime = new Date(booking.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (event === 'created') {
    // Notify Professional about new booking request
    if (profPhone) {
      await sendWhatsAppAlert(
        profPhone,
        `Olá ${profName}! Você tem uma nova solicitação de agendamento no Solução Já. Serviço: ${serviceName} para dia ${scheduledDate} às ${scheduledTime}. Acesse seu painel para responder.`
      );
    }
  } else if (event === 'confirmed') {
    // Notify Client booking is confirmed
    if (clientPhone) {
      await sendWhatsAppAlert(
        clientPhone,
        `Olá ${clientName}! Seu agendamento de ${serviceName} com ${profName} para o dia ${scheduledDate} às ${scheduledTime} foi CONFIRMADO com sucesso! Obrigado por usar o Solução Já.`
      );
    }
    // Notify Professional booking is confirmed
    if (profPhone) {
      await sendWhatsAppAlert(
        profPhone,
        `Olá ${profName}! O agendamento de ${serviceName} com ${clientName} para o dia ${scheduledDate} às ${scheduledTime} foi confirmado.`
      );
    }
  } else if (event === 'cancelled') {
    // Notify both parties
    if (clientPhone) {
      await sendWhatsAppAlert(
        clientPhone,
        `Olá ${clientName}! O agendamento de ${serviceName} com ${profName} marcado para dia ${scheduledDate} às ${scheduledTime} foi CANCELADO.`
      );
    }
    if (profPhone) {
      await sendWhatsAppAlert(
        profPhone,
        `Olá ${profName}! O agendamento de ${serviceName} com ${clientName} marcado para dia ${scheduledDate} às ${scheduledTime} foi CANCELADO.`
      );
    }
  } else if (event === 'completed') {
    // Notify client to review service
    if (clientPhone) {
      await sendWhatsAppAlert(
        clientPhone,
        `Olá ${clientName}! O serviço de ${serviceName} com ${profName} foi finalizado. Por favor, acesse seu painel em nosso site para avaliar o prestador!`
      );
    }
  }
}
