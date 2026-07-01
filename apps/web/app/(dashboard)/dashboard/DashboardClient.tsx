'use client';

import React, { useTransition } from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { updateBookingStatusAction } from '@/actions/bookings';

interface DashboardClientProps {
  bookings: any[];
}

export default function DashboardClient({ bookings }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Tem certeza de que deseja cancelar este agendamento?')) {
      return;
    }

    startTransition(async () => {
      const res = await updateBookingStatusAction(bookingId, 'cancelled');
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return {
          label: 'Aguardando Confirmação',
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          icon: Icons.Clock,
        };
      case 'awaiting_deposit':
        return {
          label: 'Aguardando Sinal',
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          icon: Icons.DollarSign,
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          color: 'bg-green-500/10 text-green-400 border-green-500/20',
          icon: Icons.CheckCircle2,
        };
      case 'completed':
        return {
          label: 'Concluído',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: Icons.Check,
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: Icons.XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: Icons.HelpCircle,
        };
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })}`;
  };

  const activeBookings = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="space-y-10">
      {/* Active Bookings Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Icons.CalendarDays className="h-5 w-5 text-blue-400" /> Meus Agendamentos Ativos
        </h2>

        {activeBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500 text-sm">
            Você não possui agendamentos ativos no momento. Que tal solicitar um serviço?
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBookings.map((b) => {
              const status = getStatusDetails(b.status);
              const StatusIcon = status.icon;
              const profName = b.professionals?.profiles?.full_name || 'Profissional';
              const phoneNum = b.professionals?.profiles?.phone || '';

              return (
                <div
                  key={b.id}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1 w-fit mb-1.5`}>
                          <StatusIcon className="h-3 w-3" /> {status.label}
                        </span>
                        <h3 className="font-bold text-white text-base leading-snug">{b.services?.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Com: {profName}</p>
                      </div>
                      <span className="text-sm font-extrabold text-blue-400 flex-shrink-0">
                        R$ {b.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                      <div className="flex items-center gap-2">
                        <Icons.Clock className="h-4 w-4 text-slate-500" />
                        <span>{formatDateTime(b.scheduled_at)} ({b.duration_minutes} min)</span>
                      </div>
                      {b.address && (
                        <div className="flex items-center gap-2">
                          <Icons.MapPin className="h-4 w-4 text-slate-500" />
                          <span className="line-clamp-1">{b.address}</span>
                        </div>
                      )}
                      {b.deposit_amount > 0 && (
                        <div className="flex items-center gap-2">
                          <Icons.AlertCircle className="h-4 w-4 text-orange-400" />
                          <span className="text-orange-400">
                            Sinal: R$ {b.deposit_amount.toFixed(2)} ({b.deposit_status === 'paid' ? 'Pago' : 'Pendente'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-800/60 pt-4">
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={isPending}
                      className="py-2.5 rounded-xl border border-slate-800 hover:bg-red-950/20 hover:text-red-400 text-xs font-semibold text-slate-400 transition cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    {b.status === 'awaiting_deposit' ? (
                      <Link
                        href={`/dashboard/pagamento/${b.id}`}
                        className="py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Icons.DollarSign className="h-3.5 w-3.5" /> Pagar Sinal Pix
                      </Link>
                    ) : (
                      <a
                        href={`https://wa.me/55${phoneNum.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(
                          profName
                        )},%20sou%20o%20cliente%20do%20Solução%20Já.%20Gostaria%20de%20falar%20sobre%20o%20serviço%20de%20${encodeURIComponent(
                          b.services?.name
                        )}%2520agendado.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Icons.MessageSquare className="h-3.5 w-3.5" /> Falar com Prestador
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History Bookings Section */}
      <section className="space-y-4 pt-4 border-t border-slate-900">
        <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
          <Icons.History className="h-5 w-5 text-slate-500" /> Histórico de Atendimentos
        </h2>

        {pastBookings.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Nenhum atendimento anterior finalizado ou cancelado.</p>
        ) : (
          <div className="bg-slate-900/20 rounded-2xl border border-slate-900 overflow-hidden divide-y divide-slate-900">
            {pastBookings.map((b) => {
              const status = getStatusDetails(b.status);
              const profName = b.professionals?.profiles?.full_name || 'Profissional';

              return (
                <div key={b.id} className="p-4 sm:flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{b.services?.name}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Profissional: {profName} | {formatDateTime(b.scheduled_at)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-300 block mt-2 sm:mt-0">
                    R$ {b.price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
