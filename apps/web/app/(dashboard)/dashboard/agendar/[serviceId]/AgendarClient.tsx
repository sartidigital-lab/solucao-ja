'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createBookingAction } from '@/actions/bookings';

interface AgendarClientProps {
  service: any;
  professional: any;
  weeklySchedule: any[];
  existingBookings: any[];
}

export default function AgendarClient({
  service,
  professional,
  weeklySchedule,
  existingBookings,
}: AgendarClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Get date limits: min is today, max is 30 days from now
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Get weekly schedule templates for this day of week
    const activeSlots = weeklySchedule.filter((s) => s.day_of_week === dayOfWeek);

    if (activeSlots.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const generated: string[] = [];
    const duration = service.duration_minutes;

    // Helper to parse time string "HH:MM:SS" or "HH:MM" into minutes from midnight
    const timeToMinutes = (timeStr: string) => {
      const parts = timeStr.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    // Helper to format minutes from midnight into "HH:MM"
    const minutesToTime = (mins: number) => {
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    // Filter bookings on this specific selected date
    const bookingsOnDate = existingBookings.filter((b) => {
      const bDate = new Date(b.scheduled_at).toISOString().split('T')[0];
      return bDate === selectedDate;
    });

    const now = new Date();
    const isToday = selectedDate === todayStr;
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // 2. Generate timeslots in 30-minute intervals within the professional's schedule bounds
    activeSlots.forEach((slot) => {
      const startMins = timeToMinutes(slot.start_time);
      const endMins = timeToMinutes(slot.end_time);

      for (let time = startMins; time + duration <= endMins; time += 30) {
        // If booking for today, slot must be in the future (e.g. +60 mins buffer)
        if (isToday && time < currentMins + 60) {
          continue;
        }

        const slotStart = time;
        const slotEnd = time + duration;

        // Check conflicts with existing bookings on this date
        const hasConflict = bookingsOnDate.some((b) => {
          const bStart = new Date(b.scheduled_at).getUTCHours() * 60 + new Date(b.scheduled_at).getUTCMinutes();
          const bEnd = bStart + b.duration_minutes;
          // Overlap check: (start1 < end2) && (end1 > start2)
          return slotStart < bEnd && slotEnd > bStart;
        });

        if (!hasConflict) {
          generated.push(minutesToTime(slotStart));
        }
      }
    });

    setAvailableSlots(generated.sort());
    setSelectedSlot(null);
  }, [selectedDate, weeklySchedule, existingBookings, service.duration_minutes, todayStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setError('Por favor, selecione uma data e horário de atendimento.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const scheduledAt = new Date(`${selectedDate}T${selectedSlot}:00Z`).toISOString();
      const res = await createBookingAction({
        serviceId: service.id,
        scheduledAt,
        notes,
        address: professional.attendance_type === 'salon' ? null : address,
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  // Deposit/reservation signaling pricing details
  let depositText = 'Nenhum sinal exigido. Pagamento integral direto com o profissional.';
  let depositAmount = 0;

  if (professional.deposit_policy === 'fixed_amount') {
    depositAmount = professional.deposit_fixed_amount || 0;
    depositText = `Sinal fixo de reserva: R$ ${depositAmount.toFixed(2)}`;
  } else if (professional.deposit_policy === 'percentage') {
    depositAmount = Math.round((service.price * 0.3) * 100) / 100;
    depositText = `Sinal de 30% para reserva: R$ ${depositAmount.toFixed(2)}`;
  }

  const showAddressField = professional.attendance_type !== 'salon';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Selection Left */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        {error && (
          <div className="rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6">
          {/* Step 1: Select Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--color-ink)]">1. Selecione a Data</label>
            <input
              type="date"
              required
              min={todayStr}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition"
            />
          </div>

          {/* Step 2: Available Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--color-ink)]">2. Escolha o Horário</label>
              {availableSlots.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">
                  Nenhum horário disponível para este dia. Experimente selecionar outra data.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm'
                          : 'bg-[var(--color-bg)] border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-primary)]/40'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {selectedSlot && (
            <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
              {showAddressField && (
                <div className="space-y-1">
                  <label className="block text-xs text-[var(--color-muted)]">Endereço de Atendimento</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, complemento..."
                    className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition"
                  />
                  <p className="text-[10px] text-[var(--color-subtle)]">
                    O profissional irá até este endereço no horário agendado.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs text-[var(--color-muted)]">Observações adicionais (opcional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma instrução especial ou detalhe sobre o serviço..."
                  className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {selectedSlot && (
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isPending ? (
              <>
                <Icons.Loader2 className="h-4 w-4 animate-spin" /> Processando Solicitação...
              </>
            ) : (
              <>
                <Icons.CalendarCheck className="h-4 w-4" /> Solicitar Reserva de Horário
              </>
            )}
          </button>
        )}
      </form>

      {/* Service Info Card Right */}
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2">
            Resumo do Serviço
          </h3>

          <div className="space-y-1">
            <h4 className="font-bold text-[var(--color-ink)] leading-tight">{service.name}</h4>
            <p className="text-xs text-[var(--color-muted)]">{service.description || 'Sem descrição.'}</p>
          </div>

          <div className="space-y-2 text-sm pt-2">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Duração:</span>
              <span className="font-semibold text-[var(--color-ink)]">{service.duration_minutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Preço do Serviço:</span>
              <span className="font-bold text-[var(--color-primary-dark)]">R$ {service.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-primary-dark)]">
            <Icons.Info className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Políticas de Pagamento</span>
          </div>
          <p className="text-xs text-[var(--color-primary-dark)] leading-relaxed">{depositText}</p>
        </div>
      </div>
    </div>
  );
}
