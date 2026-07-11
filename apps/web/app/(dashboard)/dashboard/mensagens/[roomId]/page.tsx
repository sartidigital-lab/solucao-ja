import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChatMessagesAction, getChatRoomsAction } from '@/actions/chat';
import ChatRoomWindow from '@/components/chat/ChatRoomWindow';

export const metadata = {
  title: 'Conversa — Solução Já',
};

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function ClientChatRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // 1. Carregar as salas para validar acesso e obter dados do outro participante
  const roomsRes = await getChatRoomsAction();
  if (roomsRes.error || !roomsRes.data) {
    notFound();
  }

  const activeRoom = roomsRes.data.find((r) => r.id === roomId);
  if (!activeRoom) {
    notFound();
  }

  // 2. Carregar o histórico de mensagens da sala
  const messagesRes = await getChatMessagesAction(roomId);
  const initialMessages = messagesRes.data || [];

  return (
    <div className="max-w-xl mx-auto">
      <ChatRoomWindow
        roomId={roomId}
        userId={user.id}
        otherPartyName={activeRoom.other_party_name}
        otherPartyAvatar={activeRoom.other_party_avatar}
        initialMessages={initialMessages}
        role="client"
      />
    </div>
  );
}
