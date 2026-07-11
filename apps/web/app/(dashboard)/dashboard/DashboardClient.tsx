'use client';

import React, { useTransition } from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { updateBookingStatusAction } from '@/actions/bookings';

interface DashboardClientProps {
  bookings: any[];
}

type StatusKey = 'pending_confirmation' | 'awaiting_deposit' | 'confirmed' | 'completed' | 'cancelled';

const statusConfig: Record<StatusKey, { label: string; badge: string; icon: React.ElementType }> = {
  pending_confirmation: { label: 'Aguardando confirmação', badge: 'warning', icon: Icons.Clock },
  awaiting_deposit:     { label: 'Aguardando sinal',        badge: 'warning', icon: Icons.DollarSign },
  confirmed:            { label: 'Confirmado',              badge: 'success', icon: Icons.CheckCircle2 },
  completed:            { label: 'Concluído',               badge: 'info',    icon: Icons.Check },
  cancelled:            { label: 'Cancelado',               badge: 'error',   icon: Icons.XCircle },
};

function getStatusConfig(status: string) {
  return statusConfig[status as StatusKey] ?? { label: status, badge: 'neutral', icon: Icons.HelpCircle };
}

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
}

export default function DashboardClient({ bookings }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Tem certeza de que deseja cancelar este agendamento?')) return;
    startTransition(async () => {
      const res = await updateBookingStatusAction(bookingId, 'cancelled');
      if (res.error) {
        alert('Não foi possível cancelar. Tente novamente ou entre em contato com o suporte.');
      } else {
        window.location.reload();
      }
    });
  };

  const activeBookings = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings   = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ─── Active Bookings ─────────────────────────────────────── */}
      <section>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <Icons.CalendarDays style={{ width: 16, height: 16, color: 'var(--color-primary)' }} aria-hidden="true" />
          Agendamentos ativos
        </h2>

        {activeBookings.length === 0 ? (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <Icons.CalendarX2
              style={{ width: 28, height: 28, color: 'var(--color-subtle)', margin: '0 auto 0.875rem' }}
              aria-hidden="true"
            />
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.375rem' }}>
              Nenhum agendamento ativo
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0 auto 1.25rem', maxWidth: '36ch' }}>
              Que tal buscar um profissional para o seu próximo serviço?
            </p>
            <Link href="/busca" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
              Buscar profissional
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {activeBookings.map((b) => {
              const cfg = getStatusConfig(b.status);
              const StatusIcon = cfg.icon;
              const profName = b.professionals?.profiles?.full_name || 'Profissional';
              const phoneNum = b.professionals?.profiles?.phone || '';
              const whatsappHref = phoneNum
                ? `https://wa.me/55${phoneNum.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(profName)}%2C%20sou%20cliente%20da%20Solução%20Já.%20Gostaria%20de%20falar%20sobre%20o%20serviço%20de%20${encodeURIComponent(b.services?.name || 'serviço')}.`
                : null;

              return (
                <article
                  key={b.id}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div>
                      <span className={`badge badge-${cfg.badge}`} style={{ marginBottom: '0.5rem' }}>
                        <StatusIcon style={{ width: 10, height: 10 }} aria-hidden="true" />
                        {cfg.label}
                      </span>
                      <h3
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'var(--color-ink)',
                          margin: 0,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.3,
                        }}
                      >
                        {b.services?.name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
                        com {profName}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: 'var(--color-ink)',
                        flexShrink: 0,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      R$ {b.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.375rem',
                      padding: '0.875rem',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-muted)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icons.Clock style={{ width: 13, height: 13, color: 'var(--color-subtle)', flexShrink: 0 }} aria-hidden="true" />
                      {formatDateTime(b.scheduled_at)} · {b.duration_minutes} min
                    </span>
                    {b.address && (
                      <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <Icons.MapPin style={{ width: 13, height: 13, color: 'var(--color-subtle)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                        <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{b.address}</span>
                      </span>
                    )}
                    {b.deposit_amount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: b.deposit_status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        <Icons.AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} aria-hidden="true" />
                        Sinal R$ {b.deposit_amount.toFixed(2)} · {b.deposit_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      id={`cancel-${b.id}`}
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={isPending}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, color: 'var(--color-error)', borderColor: 'var(--color-border)' }}
                    >
                      Cancelar
                    </button>

                    {b.status === 'awaiting_deposit' ? (
                      <Link
                        href={`/dashboard/pagamento/${b.id}`}
                        id={`pay-${b.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 2, textAlign: 'center', display: 'inline-flex', justifyContent: 'center' }}
                      >
                        <Icons.DollarSign style={{ width: 13, height: 13 }} aria-hidden="true" />
                        Pagar sinal (Pix)
                      </Link>
                    ) : whatsappHref ? (
                      <a
                        href={whatsappHref}
                        id={`whatsapp-${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Falar com ${profName} no WhatsApp`}
                        className="btn btn-sm"
                        style={{ flex: 2, background: '#25D366', color: '#fff', border: 'none', display: 'inline-flex', justifyContent: 'center', gap: '0.375rem' }}
                      >
                        <Icons.MessageSquare style={{ width: 13, height: 13 }} aria-hidden="true" />
                        Falar com prestador
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── History ─────────────────────────────────────────────── */}
      {pastBookings.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-ink)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <Icons.History style={{ width: 16, height: 16, color: 'var(--color-subtle)' }} aria-hidden="true" />
            Histórico de atendimentos
          </h2>

          <div
            style={{
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {pastBookings.map((b, i) => {
              const cfg = getStatusConfig(b.status);
              const profName = b.professionals?.profiles?.full_name || 'Profissional';
              const review = Array.isArray(b.reviews) ? b.reviews[0] : b.reviews;

              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    padding: '0.875rem 1.25rem',
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--color-ink)',
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {b.services?.name}
                      </h4>
                      <span className={`badge badge-${cfg.badge}`} style={{ fontSize: '0.6875rem' }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                      {profName} · {formatDateTime(b.scheduled_at)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                      R$ {b.price.toFixed(2)}
                    </span>
                    {b.status === 'completed' && (
                      review ? (
                        <span className="badge badge-warning" style={{ gap: '0.25rem' }}>
                          <Icons.Star style={{ width: 10, height: 10, fill: 'currentColor' }} aria-hidden="true" />
                          {review.rating}/5
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/avaliar/${b.id}`}
                          id={`review-${b.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        >
                          Avaliar
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
