'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ChatMessage, sendMessageAction, markMessagesAsReadAction } from '@/actions/chat';

interface ChatRoomWindowProps {
  roomId: string;
  userId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
  initialMessages: ChatMessage[];
  role: 'client' | 'professional';
}

export default function ChatRoomWindow({
  roomId,
  userId,
  otherPartyName,
  otherPartyAvatar,
  initialMessages,
  role,
}: ChatRoomWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const backPath = role === 'client' ? '/dashboard/mensagens' : '/profissional/mensagens';

  // 1. Rolar para o final do feed de mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Marcar mensagens como lidas ao entrar e periodicamente
  useEffect(() => {
    const markAsRead = async () => {
      await markMessagesAsReadAction(roomId);
    };
    markAsRead();
  }, [roomId, messages]);

  // 3. Assinar Supabase Realtime para escutar novas mensagens em tempo real
  useEffect(() => {
    // Inscrever no canal do Supabase Realtime
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Evitar adicionar a mensagem duplicada se ela foi enviada por nós (já adicionada localmente de forma otimista)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  // 4. Enviar nova mensagem
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);
    setError(null);

    // Criação otimista de mensagem para visualização instantânea
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      room_id: roomId,
      sender_id: userId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await sendMessageAction(roomId, content);

    if (res.error) {
      setError(res.error);
      // Remover a mensagem otimista que falhou
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else if (res.data) {
      // Substituir a mensagem otimista com os dados reais salvos no Supabase
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (res.data as ChatMessage) : m))
      );
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[600px] bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      
      {/* ─── Header da Conversa ──────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backPath}
            className="p-1.5 hover:bg-surface-2 rounded-lg text-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Voltar para a lista de conversas"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Outra parte info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-light text-primary-dark font-bold text-xs flex items-center justify-center border border-primary/10 overflow-hidden shrink-0">
              {otherPartyAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={otherPartyAvatar} alt={otherPartyName} className="w-full h-full object-cover" />
              ) : (
                <span>{(otherPartyName || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink truncate leading-tight">
                {otherPartyName}
              </h2>
              <span className="inline-flex items-center gap-0.5 text-xs text-muted font-medium">
                <ShieldCheck className="w-3 h-3 text-info" />
                Chat Verificado
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Feed de Mensagens ────────────────────────────────────────── */}
      <div className="flex-1 p-4 overflow-y-auto bg-surface/20 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 text-muted max-w-xs mx-auto">
            <MessageSquare className="w-8 h-8 mb-2 text-subtle" />
            <p className="text-xs font-semibold text-ink">Inicie a conversa!</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Combine detalhes de preço, horário e tire suas dúvidas com segurança diretamente pelo chat.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs
                    ${isMe 
                      ? 'bg-primary text-white rounded-br-2xs font-medium' 
                      : 'bg-white text-ink border border-border/80 rounded-bl-2xs'}
                  `}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div
                    className={`
                      text-xs text-right mt-1.5 font-medium select-none
                      \${isMe ? 'text-white/70' : 'text-muted'}
                    `}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isMe && (
                      <span className="ml-1 select-none font-bold">
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Alertas de Erro */}
      {error && (
        <div className="bg-error-light border-y border-error/15 px-4 py-2 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-error shrink-0" />
          <span className="text-xs font-medium text-error leading-tight">{error}</span>
        </div>
      )}

      {/* ─── Footer / Campo de Entrada ─────────────────────────────── */}
      <footer className="p-3 bg-white border-t border-border/80 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            id="chat-input"
            type="text"
            placeholder="Digite sua mensagem aqui..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-ink placeholder:text-muted focus:border-primary focus:ring-0 outline-none"
            autoComplete="off"
            disabled={isSending}
            aria-label="Digitar mensagem"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!inputText.trim() || isSending}
            className={`
              p-2.5 rounded-xl text-white transition-all shrink-0 cursor-pointer
              ${!inputText.trim() || isSending
                ? 'bg-subtle/30 text-subtle cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover shadow-2xs hover:shadow-xs'}
            `}
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

    </div>
  );
}
