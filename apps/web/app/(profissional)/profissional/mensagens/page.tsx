import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChatRoomsAction } from '@/actions/chat';
import ChatRoomsList from '@/components/chat/ChatRoomsList';

export const metadata = {
  title: 'Mensagens do Prestador — Solução Já',
  description: 'Converse em tempo real com seus clientes do Solução Já.',
};

export default async function ProfessionalMessagesPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const res = await getChatRoomsAction();
  const rooms = res.data || [];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-ink">Mensagens Recebidas</h1>
        <p className="text-xs text-muted">Responda a chamadas de orçamento e tire dúvidas dos clientes.</p>
      </div>

      <ChatRoomsList rooms={rooms} role="professional" />
    </div>
  );
}
