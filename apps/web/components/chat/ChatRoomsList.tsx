'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Calendar } from 'lucide-react';
import { ChatRoom } from '@/actions/chat';

interface ChatRoomsListProps {
  rooms: ChatRoom[];
  role: 'client' | 'professional';
}

function formatMsgTime(isoString?: string | null) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) {
    const weekday = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return weekday[date.getDay()];
  }
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function ChatRoomsList({ rooms, role }: ChatRoomsListProps) {
  const basePath = role === 'client' ? '/dashboard/mensagens' : '/profissional/mensagens';

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-surface border border-dashed border-border rounded-xl shadow-2xs">
        <span className="p-3 bg-surface-2 rounded-full mb-4 text-muted">
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-bold text-ink mb-1">Nenhuma conversa iniciada</h3>
        <p className="text-xs text-muted max-w-[280px]">
          Suas mensagens com {role === 'client' ? 'profissionais' : 'clientes'} aparecerão aqui assim que você iniciar um contato.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-2xs overflow-hidden divide-y divide-border/60">
      {rooms.map((room) => {
        const hasUnread = room.unread_count > 0;
        
        return (
          <Link
            key={room.id}
            href={`${basePath}/${room.id}`}
            id={`chatroom-link-${room.id}`}
            className="flex items-center justify-between p-4 hover:bg-surface/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Avatar da outra parte */}
              <div className="w-11 h-11 rounded-full bg-primary-light text-primary-dark font-bold text-sm flex items-center justify-center shrink-0 border border-primary/10 overflow-hidden">
                {room.other_party_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.other_party_avatar} alt={room.other_party_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(room.other_party_name || '?')[0].toUpperCase()}</span>
                )}
              </div>

              {/* Informações textuais */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className={`text-sm leading-tight truncate group-hover:text-primary transition-colors ${hasUnread ? 'font-black text-ink' : 'font-bold text-ink'}`}>
                    {room.other_party_name}
                  </h3>
                  <span className="text-xs font-medium text-muted shrink-0">
                    {formatMsgTime(room.last_message_time || room.created_at)}
                  </span>
                </div>
                
                <p className={`text-xs truncate ${hasUnread ? 'font-bold text-ink' : 'text-muted'}`}>
                  {room.last_message || 'Inicie a conversa...'}
                </p>
              </div>
            </div>

            {/* Badges do lado direito (Unread count ou link de agendamento) */}
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {room.booking_id && (
                <span title="Agendamento vinculado" className="p-1 rounded bg-surface text-subtle border border-border/80" aria-label="Agendamento vinculado">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
              )}
              {hasUnread && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs font-bold">
                  {room.unread_count}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
