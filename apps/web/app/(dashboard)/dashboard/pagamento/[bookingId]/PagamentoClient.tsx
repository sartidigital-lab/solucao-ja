'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { simulateMercadoPagoWebhookAction } from '@/actions/payments';

interface PagamentoClientProps {
  booking: any;
  paymentInfo: any;
}

export default function PagamentoClient({ booking, paymentInfo }: PagamentoClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentInfo.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    startTransition(async () => {
      const res = await simulateMercadoPagoWebhookAction(booking.id);
      if (res.error) {
        alert(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6">
      {/* Checkout overview */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block">
          Valor do Sinal
        </span>
        <span className="text-3xl font-extrabold text-[var(--color-primary)]">
          R$ {paymentInfo.amount.toFixed(2)}
        </span>
        <p className="text-[11px] text-[var(--color-muted)]">
          Serviço: {booking.services?.name} com {booking.professionals?.profiles?.full_name}
        </p>
      </div>

      {/* Pix QR Code */}
      <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto flex items-center justify-center border border-[var(--color-border-strong)] relative group">
        {paymentInfo.qrCodeBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${paymentInfo.qrCodeBase64}`}
            alt="QR Code Pix"
            className="w-full h-full object-contain"
          />
        ) : (
          <Icons.QrCode className="h-32 w-32 text-slate-900" />
        )}
      </div>

      {/* Pix instructions */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1 text-center">
          <h3 className="text-xs font-bold text-[var(--color-ink)]">Escaneie o código QR ou copie o código Pix abaixo:</h3>
          <p className="text-[10px] text-[var(--color-muted)] leading-relaxed">
            Abra o app do seu banco, escolha a opção "Pagar com Pix" e escaneie o código acima ou cole a chave copia e cola.
          </p>
        </div>

        {/* Copy/Paste Pix Key */}
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={paymentInfo.qrCode}
            className="flex-1 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-[10px] text-[var(--color-ink)] outline-none select-all truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 bg-[var(--color-bg)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] rounded-lg text-xs font-bold text-[var(--color-ink)] flex items-center gap-1 cursor-pointer min-w-[90px] justify-center"
          >
            {copied ? (
              <>
                <Icons.Check className="h-3.5 w-3.5 text-green-600" /> Copiado
              </>
            ) : (
              <>
                <Icons.Copy className="h-3.5 w-3.5" /> Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Local Simulation Assist */}
      <div className="border-t border-[var(--color-border)] pt-6 space-y-3">
        <div className="rounded-lg bg-[var(--color-info-light)] border border-[var(--color-info-light)] p-4 space-y-2">
          <span className="text-[10px] font-bold text-[var(--color-info)] uppercase tracking-wider block flex items-center gap-1">
            <Icons.Settings className="h-3 w-3 animate-spin" /> Modo de Testes Locais
          </span>
          <p className="text-[10px] text-[var(--color-info)] leading-relaxed">
            Como webhooks reais precisam de URLs públicas para funcionar, use o botão abaixo para simular a resposta de pagamento aprovado do Mercado Pago.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-xs font-bold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isPending ? (
            <>
              <Icons.Loader2 className="h-4 w-4 animate-spin" /> Confirmando...
            </>
          ) : (
            <>
              <Icons.ShieldCheck className="h-4 w-4" /> Simular Pagamento Aprovado
            </>
          )}
        </button>

        <a
          href="/dashboard"
          className="block w-full py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] rounded-xl text-center text-xs font-bold text-[var(--color-ink)] transition"
        >
          Voltar para o Dashboard
        </a>
      </div>
    </div>
  );
}
