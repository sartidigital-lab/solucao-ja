import { z } from 'zod';

export const scheduleSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (formato HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (formato HH:MM)'),
  isActive: z.boolean().default(true)
});

export const professionalScheduleSchema = z.array(scheduleSlotSchema);

export const bookingSchema = z.object({
  serviceId: z.string().uuid('Serviço inválido'),
  scheduledAt: z.string().datetime('Data e hora inválidas'),
  notes: z.string().max(500, 'As observações devem ter no máximo 500 caracteres').optional().nullable(),
  address: z.string().max(200, 'O endereço deve ter no máximo 200 caracteres').optional().nullable()
});

export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
