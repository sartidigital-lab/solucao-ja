'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  client_id: string;
  professional_id: string;
  booking_id?: string | null;
  created_at: string;
  other_party_name: string;
  other_party_avatar?: string | null;
  last_message?: string | null;
  last_message_time?: string | null;
  unread_count: number;
}

/**
 * Cria ou obtém uma sala de chat direta existente entre o cliente e o profissional.
 */
export async function createOrGetChatRoomAction(professionalId: string, bookingId?: string | null) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Descobrir se o usuário logado é o cliente ou o profissional
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado' };
  }

  let clientId = '';
  let profId = '';

  if (profile.role === 'client') {
    clientId = user.id;
    profId = professionalId;
  } else {
    clientId = professionalId; // Caso o profissional inicie o chat
    profId = user.id;
  }

  // 1. Tentar buscar a sala existente
  const { data: existingRoom, error: fetchError } = await (supabase.from('chat_rooms') as any)
    .select('id')
    .eq('client_id', clientId)
    .eq('professional_id', profId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching chat room:', fetchError);
    return { error: fetchError.message };
  }

  if (existingRoom) {
    return { success: true, roomId: existingRoom.id };
  }

  // 2. Criar nova sala se não existir
  const { data: newRoom, error: insertError } = await (supabase.from('chat_rooms') as any)
    .insert({
      client_id: clientId,
      professional_id: profId,
      booking_id: bookingId || null,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating chat room:', insertError);
    return { error: insertError.message };
  }

  return { success: true, roomId: newRoom.id };
}

/**
 * Retorna as salas de chat ativas do usuário conectado.
 */
export async function getChatRoomsAction() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Obter o papel (role) do usuário
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado' };
  }

  const isClient = profile.role === 'client';

  // Buscar salas onde o usuário participa
  const query = (supabase.from('chat_rooms') as any)
    .select(`
      id,
      client_id,
      professional_id,
      booking_id,
      created_at
    `);

  if (isClient) {
    query.eq('client_id', user.id);
  } else {
    query.eq('professional_id', user.id);
  }

  const { data: rooms, error: roomsError } = await query;

  if (roomsError) {
    return { error: roomsError.message };
  }

  const roomsList: ChatRoom[] = [];

  for (const room of rooms) {
    // Buscar info do outro participante
    const otherPartyId = isClient ? room.professional_id : room.client_id;
    const { data: otherProfile } = await (supabase.from('profiles') as any)
      .select('full_name, avatar_url')
      .eq('id', otherPartyId)
      .single();

    // Buscar a última mensagem da sala
    const { data: lastMsgs } = await (supabase.from('chat_messages') as any)
      .select('content, created_at')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastMsg = lastMsgs?.[0];

    // Contar mensagens não lidas
    const { count } = await (supabase.from('chat_messages') as any)
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('is_read', false)
      .not('sender_id', 'eq', user.id);

    roomsList.push({
      id: room.id,
      client_id: room.client_id,
      professional_id: room.professional_id,
      booking_id: room.booking_id,
      created_at: room.created_at,
      other_party_name: otherProfile?.full_name || 'Usuário',
      other_party_avatar: otherProfile?.avatar_url || null,
      last_message: lastMsg?.content || null,
      last_message_time: lastMsg?.created_at || null,
      unread_count: count || 0,
    });
  }

  // Ordenar por data da última mensagem (mais recente primeiro)
  roomsList.sort((a, b) => {
    const timeA = new Date(a.last_message_time || a.created_at).getTime();
    const timeB = new Date(b.last_message_time || b.created_at).getTime();
    return timeB - timeA;
  });

  return { success: true, data: roomsList };
}

/**
 * Retorna as mensagens de uma sala de chat se o usuário fizer parte dela.
 */
export async function getChatMessagesAction(roomId: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Validar se o usuário pertence à sala
  const { data: room, error: roomError } = await (supabase.from('chat_rooms') as any)
    .select('client_id, professional_id')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    return { error: 'Sala não encontrada' };
  }

  if (room.client_id !== user.id && room.professional_id !== user.id) {
    return { error: 'Acesso negado' };
  }

  // Buscar mensagens
  const { data: messages, error } = await (supabase.from('chat_messages') as any)
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data: messages || [] };
}

/**
 * Envia uma mensagem no chat em tempo real.
 */
export async function sendMessageAction(roomId: string, content: string) {
  if (!content || content.trim() === '') {
    return { error: 'A mensagem não pode ser vazia' };
  }

  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Validar se o usuário pertence à sala
  const { data: room, error: roomError } = await (supabase.from('chat_rooms') as any)
    .select('client_id, professional_id')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    return { error: 'Sala não encontrada' };
  }

  if (room.client_id !== user.id && room.professional_id !== user.id) {
    return { error: 'Acesso negado' };
  }

  // Inserir mensagem
  const { data: message, error } = await (supabase.from('chat_messages') as any)
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select('*')
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data: message };
}

/**
 * Marca as mensagens recebidas de uma sala como lidas.
 */
export async function markMessagesAsReadAction(roomId: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  const { error } = await (supabase.from('chat_messages') as any)
    .update({ is_read: true })
    .eq('room_id', roomId)
    .not('sender_id', 'eq', user.id)
    .eq('is_read', false);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
