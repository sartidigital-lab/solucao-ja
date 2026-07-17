'use client';

import React, { useState, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { updateBookingStatusAction, updateProfessionalScheduleAction, unlockBookingContactAction } from '@/actions/bookings';

interface AgendaClientProps {
  initialSchedule: any[];
  pendingBookings: any[];
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function AgendaClient({ initialSchedule, pendingBookings }: AgendaClientProps) {
  const [schedule, setSchedule] = useState<any[]>(initialSchedule);
  const [newDay, setNewDay] = useState(1); // Monday default
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('18:00');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUnlockContact = (bookingId: string) => {
    if (!confirm('Deseja desbloquear o contato deste cliente por 50 moedas?')) {
      return;
    }

    startTransition(async () => {
      const res = await unlockBookingContactAction(bookingId);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStart >= newEnd) {
      setError('O horário de início deve ser anterior ao horário de término.');
      return;
    }

    // Check duplicates
    const duplicate = schedule.some(
      (s) =>
        s.day_of_week === newDay &&
        s.start_time.substring(0, 5) === newStart &&
        s.end_time.substring(0, 5) === newEnd
    );

    if (duplicate) {
      setError('Este horário já está configurado na sua agenda.');
      return;
    }

    const newSlot = {
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
      isActive: true,
      // For local render compatibility
      day_of_week: newDay,
      start_time: newStart,
      end_time: newEnd,
    };

    setSchedule([...schedule, newSlot]);
    setError(null);
  };

  const handleRemoveSlot = (idx: number) => {
    setSchedule(schedule.filter((_, i) => i !== idx));
  };

  const handleSaveSchedule = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      // Map back to Zod validation schema structure
      const uploadData = schedule.map((s) => ({
        dayOfWeek: s.day_of_week,
        startTime: s.start_time.substring(0, 5),
        endTime: s.end_time.substring(0, 5),
        isActive: s.is_active ?? true,
      }));

      const res = await updateProfessionalScheduleAction(uploadData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Agenda de atendimento salva com sucesso!');
      }
    });
  };

  const handleUpdateStatus = (bookingId: string, status: string) => {
    startTransition(async () => {
      const res = await updateBookingStatusAction(bookingId, status);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  // Helper to format iso datetime into readable local string
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configure Schedule Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
            <Icons.Calendar className="h-5 w-5 text-[var(--color-primary-dark)]" /> Configurar Horários Semanais
          </h2>

          {error && (
            <div className="rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]/20 p-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-[var(--color-success-light)] border border-[var(--color-success)]/20 p-3 text-sm text-[var(--color-success)]">
              {success}
            </div>
          )}

          {/* Form to add a new slot */}
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border-strong)]">
            <div className="space-y-1">
              <label className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Dia da Semana</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(parseInt(e.target.value))}
                className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Início</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Término</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Icons.Plus className="h-4 w-4" /> Adicionar
            </button>
          </form>

          {/* List of current slots */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Faixas de Horários Ativas</h3>
            {schedule.length === 0 ? (
              <p className="text-xs text-[var(--color-subtle)] italic">Sua agenda está vazia. Adicione horários acima.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {schedule
                  .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                  .map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[var(--color-primary-dark)] w-24">
                          {DAYS_OF_WEEK[slot.day_of_week]}
                        </span>
                        <span className="text-[var(--color-ink)] font-medium">
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="text-[var(--color-subtle)] hover:text-[var(--color-error)] transition cursor-pointer"
                      >
                        <Icons.Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveSchedule}
            disabled={isPending}
            className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-xs font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
          >
            {isPending ? 'Salvando...' : 'Salvar Configurações da Agenda'}
          </button>
        </div>
      </div>

      {/* Pending Reservations Column */}
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
            <Icons.Inbox className="h-5 w-5 text-[var(--color-primary-dark)]" /> Solicitações Recebidas
          </h2>

          {pendingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-8 text-center text-[var(--color-muted)] text-xs">
              Nenhuma solicitação pendente de resposta.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((b) => (
                <div key={b.id} className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-[var(--color-ink)]">{b.profiles?.full_name}</h4>
                    <p className="text-[10px] text-[var(--color-muted)]">{b.services?.name}</p>
                  </div>

                  <div className="space-y-1 text-[var(--color-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Icons.Clock className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                      <span>{formatDateTime(b.scheduled_at)}</span>
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
                    <p className="bg-[var(--color-surface)] p-2 rounded text-[10px] text-[var(--color-muted)] border border-[var(--color-border)]">
                      <strong>Obs:</strong> {b.notes}
                    </p>
                  )}

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      className="py-2 bg-[var(--color-success)] hover:bg-emerald-600 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Icons.Check className="h-3.5 w-3.5" /> Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                      className="py-2 bg-[var(--color-error-light)] hover:bg-[var(--color-error)]/10 rounded-lg text-[var(--color-error)] font-bold border border-[var(--color-error)]/30 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Icons.X className="h-3.5 w-3.5" /> Recusar
                    </button>
                  </div>

                  {b.is_contact_unlocked ? (
                    <a
                      href={`https://wa.me/55${b.profiles?.phone?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(
                        b.profiles?.full_name
                      )},%20sou%20o%20prestador%20do%20Solução%20Já.%20Recebi%20seu%20pedido%20de%20${encodeURIComponent(
                        b.services?.name
                      )}%20para%20${encodeURIComponent(formatDateTime(b.scheduled_at))}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-lg text-[var(--color-ink)] font-semibold border border-[var(--color-border-strong)] transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Icons.PhoneCall className="h-3.5 w-3.5 text-[var(--color-success)]" /> Falar com Cliente
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnlockContact(b.id)}
                      disabled={isPending}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Icons.Unlock className="h-3.5 w-3.5" /> Desbloquear Contato (50 moedas)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
