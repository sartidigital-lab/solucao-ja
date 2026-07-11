import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChatRoomsAction } from '@/actions/chat';
import ChatRoomsList from '@/components/chat/ChatRoomsList';

export const metadata = {
  title: 'Mensagens — Solução Já',
  description: 'Converse em tempo real com profissionais da Grande Vitória.',
};

export default async function ClientMessagesPage() {
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
        <h1 className="text-xl font-bold text-ink">Minhas Mensagens</h1>
        <p className="text-xs text-muted">Acompanhe suas conversas com prestadores de serviço.</p>
      </div>

      <ChatRoomsList rooms={rooms} role="client" />
    </div>
  );
}
