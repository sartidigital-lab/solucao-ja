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
        <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
          <Icons.CalendarCheck className="h-5 w-5 text-[var(--color-success)]" /> Próximos Atendimentos
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] p-12 text-center text-[var(--color-muted)] text-xs">
            Nenhum agendamento confirmado para os próximos dias.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--color-ink)] text-sm">{b.profiles?.full_name}</h3>
                    <span className="text-[10px] text-[var(--color-primary-dark)] font-semibold px-2 py-0.5 rounded bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] mt-1 inline-block">
                      {b.services?.name}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--color-ink)]">R$ {b.price.toFixed(2)}</span>
                </div>

                <div className="space-y-1 text-[var(--color-muted)]">
                  <div className="flex items-center gap-1.5">
                    <Icons.Clock className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                    <span>{formatDateTime(b.scheduled_at)} ({b.duration_minutes} min)</span>
                  </div>
                  {b.address && (
                    <div className="flex items-center gap-1.5">
                      <Icons.MapPin className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                      <span className="line-clamp-1" title={b.address}>
                        {b.address}
                      </span>
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="bg-[var(--color-bg)] p-2 rounded text-[10px] text-[var(--color-muted)] border border-[var(--color-border)]">
                    <strong>Obs:</strong> {b.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                    disabled={isPending}
                    className="py-2 bg-[var(--color-success)] hover:bg-emerald-700 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.Check className="h-3.5 w-3.5" /> Finalizar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                    disabled={isPending}
                    className="py-2 bg-[var(--color-error-light)] hover:bg-[var(--color-error)]/10 rounded-lg text-[var(--color-error)] font-bold border border-[var(--color-error)]/30 transition flex items-center justify-center gap-1 cursor-pointer"
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
        <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
          <Icons.Inbox className="h-5 w-5 text-[var(--color-warning)]" /> Solicitações Pendentes
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] p-12 text-center text-[var(--color-muted)] text-xs">
            Nenhuma nova solicitação de agendamento pendente.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--color-ink)] text-sm">{b.profiles?.full_name}</h3>
                    <span className="text-[10px] text-[var(--color-warning)] font-semibold px-2 py-0.5 rounded bg-[var(--color-warning-light)] border border-[var(--color-warning)]/20 mt-1 inline-block">
                      {b.services?.name}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--color-ink)]">R$ {b.price.toFixed(2)}</span>
                </div>

                <div className="space-y-1 text-[var(--color-muted)]">
                  <div className="flex items-center gap-1.5">
                    <Icons.Clock className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                    <span>{formatDateTime(b.scheduled_at)}</span>
                  </div>
                  {b.address && (
                    <div className="flex items-center gap-1.5">
                      <Icons.MapPin className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                      <span className="line-clamp-1">{b.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                    disabled={isPending}
                    className="py-2 bg-[var(--color-success)] hover:bg-emerald-700 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Icons.Check className="h-3.5 w-3.5" /> Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                    disabled={isPending}
                    className="py-2 bg-[var(--color-error-light)] hover:bg-[var(--color-error)]/10 rounded-lg text-[var(--color-error)] font-bold border border-[var(--color-error)]/30 transition flex items-center justify-center gap-1 cursor-pointer"
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
