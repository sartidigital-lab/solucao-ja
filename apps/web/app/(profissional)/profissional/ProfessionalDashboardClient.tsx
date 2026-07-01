'use client';

import React, { useTransition } from 'react';
import * as Icons from 'lucide-react';
import { updateBookingStatusAction } from '@/actions/bookings';

interface ProfessionalDashboardClientProps {
  bookings: any[];
}

export default function ProfessionalDashboardClient({ bookings }: ProfessionalDashboardClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (bookingId: string, status: string) => {
    const actionWord = status === 'completed' ? 'concluir' : 'cancelar';
    if (!confirm(`Tem certeza de que deseja ${actionWord} este atendimento?`)) {
      return;
    }

    startTransition(async () => {
      const res = await updateBookingStatusAction(bookingId, status);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })}`;
  };

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingRequests = bookings.filter((b) => b.status === 'pending_confirmation');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
      {/* Confirmed / Active Column */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2">
          <Icons.CalendarCheck className="h-5 w-5 text-emerald-400" /> Próximos Atendimentos
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-xs">
            Nenhum agendamento confirmado para os próximos dias.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.profiles?.full_name}</h3>
                    <span className="text-[10px] text-teal-400 font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 mt-1 inline-block">
                      {b.services?.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-300">R$ {b.price.toFixed(2)}</span>
                </div>

                <div className="space-y-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Icons.Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{formatDateTime(b.scheduled_at)} ({b.duration_minutes} min)</span>
                  </div>
                  {b.address && (
                    <div className="flex items-center gap-1.5">
                      <Icons.MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span className="line-clamp-1" title={b.address}>
                        {b.address}
                      </span>
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="bg-slate-950 p-2 rounded text-[10px] text-slate-400 border border-slate-900">
                    <strong>Obs:</strong> {b.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                    disabled={isPending}
                    className="py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.Check className="h-3.5 w-3.5" /> Finalizar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                    disabled={isPending}
                    className="py-2 bg-red-950/40 hover:bg-red-900/40 rounded-lg text-red-400 font-bold border border-red-900/30 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending requests column */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2">
          <Icons.Inbox className="h-5 w-5 text-yellow-400" /> Solicitações Pendentes
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-xs">
            Nenhuma nova solicitação de agendamento pendente.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.profiles?.full_name}</h3>
                    <span className="text-[10px] text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 mt-1 inline-block">
                      {b.services?.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-300">R$ {b.price.toFixed(2)}</span>
                </div>

                <div className="space-y-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Icons.Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{formatDateTime(b.scheduled_at)}</span>
                  </div>
                  {b.address && (
                    <div className="flex items-center gap-1.5">
                      <Icons.MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span className="line-clamp-1">{b.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                    disabled={isPending}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.Check className="h-3.5 w-3.5" /> Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                    disabled={isPending}
                    className="py-2 bg-red-950/40 hover:bg-red-900/40 rounded-lg text-red-400 font-bold border border-red-900/30 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.X className="h-3.5 w-3.5" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
