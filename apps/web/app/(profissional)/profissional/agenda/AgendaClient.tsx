'use client';

import React, { useState, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { updateBookingStatusAction, updateProfessionalScheduleAction } from '@/actions/bookings';

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
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Icons.Calendar className="h-5 w-5 text-teal-400" /> Configurar Horários Semanais
          </h2>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Form to add a new slot */}
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-950 p-4 rounded-xl border border-slate-900">
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider">Dia da Semana</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider">Início</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider">Término</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Icons.Plus className="h-4 w-4" /> Adicionar
            </button>
          </form>

          {/* List of current slots */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faixas de Horários Ativas</h3>
            {schedule.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Sua agenda está vazia. Adicione horários acima.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {schedule
                  .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                  .map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-teal-400 w-24">
                          {DAYS_OF_WEEK[slot.day_of_week]}
                        </span>
                        <span className="text-slate-300">
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="text-slate-500 hover:text-red-400 transition cursor-pointer"
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
            className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-xs font-bold text-white shadow-lg hover:from-teal-500 hover:to-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shadow-teal-950/10"
          >
            {isPending ? 'Salvando...' : 'Salvar Configurações da Agenda'}
          </button>
        </div>
      </div>

      {/* Pending Reservations Column */}
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Icons.Inbox className="h-5 w-5 text-teal-400" /> Solicitações Recebidas
          </h2>

          {pendingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
              Nenhuma solicitação pendente de resposta.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((b) => (
                <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-white">{b.profiles?.full_name}</h4>
                    <p className="text-[10px] text-slate-500">{b.services?.name}</p>
                  </div>

                  <div className="space-y-1 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Icons.Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formatDateTime(b.scheduled_at)}</span>
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
                    <p className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 border border-slate-800">
                      <strong>Obs:</strong> {b.notes}
                    </p>
                  )}

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Icons.Check className="h-3.5 w-3.5" /> Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                      className="py-2 bg-red-950/40 hover:bg-red-900/40 rounded-lg text-red-400 font-bold border border-red-900/30 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Icons.X className="h-3.5 w-3.5" /> Recusar
                    </button>
                  </div>

                  <a
                    href={`https://wa.me/55${b.profiles?.phone?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(
                      b.profiles?.full_name
                    )},%20sou%20o%20prestador%20do%20Solução%20Já.%20Recebi%20seu%20pedido%20de%20${encodeURIComponent(
                      b.services?.name
                    )}%20para%20${encodeURIComponent(formatDateTime(b.scheduled_at))}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-300 font-semibold border border-slate-850 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Icons.PhoneCall className="h-3.5 w-3.5 text-emerald-500" /> Falar com Cliente
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
