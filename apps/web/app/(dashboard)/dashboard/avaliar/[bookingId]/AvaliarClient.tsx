'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createReviewAction } from '@/actions/reviews';

interface AvaliarClientProps {
  booking: any;
}

export default function AvaliarClient({ booking }: AvaliarClientProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createReviewAction(booking.id, rating, comment.trim() || null);
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  const profName = booking.professionals?.profiles?.full_name || 'Profissional';
  const serviceName = booking.services?.name || 'Serviço';

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]/20 p-3 text-xs text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Booking Summary */}
      <div className="rounded-xl bg-[var(--color-bg)] p-4 border border-[var(--color-border)] text-xs text-[var(--color-muted)] space-y-1">
        <p className="font-bold text-[var(--color-ink)] text-sm">{serviceName}</p>
        <p>Prestador: {profName}</p>
        <p>Preço pago: R$ {booking.price.toFixed(2)}</p>
      </div>

      {/* Star Selector */}
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold text-[var(--color-ink)] block">Sua nota para o serviço:</label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating ?? rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 cursor-pointer transition transform hover:scale-110"
              >
                <Icons.Star
                  className={`h-8 w-8 transition ${
                    active ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-subtle)]'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[var(--color-muted)] italic">
          {rating === 5 && 'Excelente! Atendeu todas as expectativas.'}
          {rating === 4 && 'Muito bom! Recomendo.'}
          {rating === 3 && 'Regular. Pode melhorar.'}
          {rating === 2 && 'Ruim. Não atendeu ao esperado.'}
          {rating === 1 && 'Péssimo. Tive problemas sérios.'}
        </p>
      </div>

      {/* Comment Input */}
      <div className="space-y-1.5">
        <label htmlFor="comment" className="text-xs font-bold text-[var(--color-ink)] block">
          Comentários (opcional):
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte um pouco sobre a pontualidade, simpatia, capricho e qualidade do serviço realizado..."
          className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3.5 py-3 text-xs text-[var(--color-ink)] placeholder-[var(--color-subtle)] outline-none focus:border-[var(--color-primary)] transition resize-none"
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href="/dashboard"
          className="rounded-xl border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] py-3 text-xs font-bold text-[var(--color-ink)] transition text-center"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] py-3 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isPending ? (
            <>
              <Icons.Loader2 className="h-4 w-4 animate-spin text-white" /> Enviando...
            </>
          ) : (
            'Enviar Avaliação'
          )}
        </button>
      </div>
    </form>
  );
}
