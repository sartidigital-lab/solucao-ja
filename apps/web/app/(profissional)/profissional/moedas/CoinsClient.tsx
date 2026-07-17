'use client';

import React, { useState, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { generateCoinsPaymentAction } from '@/actions/payments';

interface CoinsClientProps {
  initialBalance: number;
  initialTransactions: any[];
  initialPendingPayments: any[];
}

const COINS_PACKAGES = [
  {
    id: 'conexao',
    name: 'Pacote Conexão',
    price: 49.90,
    coins: 500,
    description: 'Para conectar com os primeiros clientes e iniciar atendimentos.',
    features: ['500 moedas de saldo', 'Equivale a 10 contatos liberados', 'Sem mensalidades recorrentes'],
    popular: false,
    color: 'border-blue-500/30 bg-blue-500/5 text-blue-600',
    icon: Icons.Compass,
  },
  {
    id: 'avanco',
    name: 'Pacote Avanço',
    price: 79.90,
    coins: 1000,
    description: 'Para quem quer aumentar o fluxo e crescer na região.',
    features: ['1000 moedas de saldo', 'Equivale a 20 contatos liberados', 'Melhor custo-benefício (Lead por R$ 3,99)'],
    popular: true,
    color: 'border-amber-500 bg-amber-500/5 text-amber-500',
    icon: Icons.Zap,
  },
  {
    id: 'prospera',
    name: 'Pacote Prospera',
    price: 129.90,
    coins: 2000,
    description: 'Para fluxo máximo de orçamentos e faturamento no topo.',
    features: ['2000 moedas de saldo', 'Equivale a 40 contatos liberados', 'Desconto máximo por lead (Lead por R$ 3,24)'],
    popular: false,
    color: 'border-purple-500/30 bg-purple-500/5 text-purple-600',
    icon: Icons.TrendingUp,
  },
];

export default function CoinsClient({
  initialBalance,
  initialTransactions,
  initialPendingPayments,
}: CoinsClientProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activePix, setActivePix] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleBuyPackage = (packageId: string) => {
    setActivePix(null);
    startTransition(async () => {
      const res = await generateCoinsPaymentAction(packageId);
      if (res.error) {
        alert(res.error);
      } else if (res.data) {
        setActivePix(res.data);
      }
    });
  };

  const handleCopy = () => {
    if (!activePix) return;
    navigator.clipboard.writeText(activePix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="space-y-8">
      {/* ─── Saldo Card ────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-2xs">
            <Icons.Coins className="h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block">
              Seu Saldo Atual
            </span>
            <span className="text-3xl font-black text-[var(--color-ink)] flex items-baseline gap-1 justify-center sm:justify-start">
              {balance} <span className="text-xs font-semibold text-[var(--color-muted)]">moedas</span>
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-bg)] px-4 py-3 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-muted)] text-center sm:text-left max-w-sm">
          💡 Cada desbloqueio de contato consome <strong>50 moedas</strong>. Isso inclui a liberação do número de telefone e o canal do chat em tempo real.
        </div>
      </div>

      {/* ─── Pix Ativo (Se Houver) ─────────────────────────────────── */}
      {activePix && (
        <div className="bg-[var(--color-surface)] border border-amber-500/30 p-6 rounded-2xl space-y-6 max-w-lg mx-auto relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block flex items-center justify-center gap-1">
              <Icons.QrCode className="h-3.5 w-3.5" /> Pagamento Pix Gerado
            </span>
            <span className="text-3xl font-black text-[var(--color-ink)] block">
              R$ {activePix.amount.toFixed(2)}
            </span>
            <p className="text-[11px] text-[var(--color-muted)]">
              Você está comprando <strong>{activePix.coinsAmount} moedas</strong>.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl w-44 h-44 mx-auto flex items-center justify-center border border-[var(--color-border-strong)]">
            {activePix.qrCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${activePix.qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            ) : (
              <Icons.QrCode className="h-28 w-28 text-slate-900" />
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1 text-center text-xs">
              <h3 className="font-bold text-[var(--color-ink)]">Escaneie o código QR ou copie o código Pix abaixo:</h3>
              <p className="text-[10px] text-[var(--color-muted)]">
                Abra o app do seu banco, escolha "Pagar com Pix" e cole a chave copia e cola.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={activePix.qrCode}
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

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/10 p-4 space-y-1 text-center">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block flex items-center justify-center gap-1">
              <Icons.Clock3 className="h-3.5 w-3.5 animate-pulse" /> Aguardando Confirmação
            </span>
            <p className="text-[10px] text-blue-600/80 leading-relaxed">
              O saldo será liberado automaticamente em sua conta assim que o pagamento Pix for confirmado.
            </p>
          </div>
        </div>
      )}

      {/* ─── Pacotes Disponíveis ───────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
          <Icons.ShoppingBag className="h-5 w-5 text-[var(--color-primary-dark)]" /> Comprar Pacotes de Moedas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COINS_PACKAGES.map((pkg) => {
            const PkgIcon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`border rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                  pkg.popular
                    ? 'border-amber-500 shadow-md scale-102 bg-[var(--color-surface)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[8px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Mais Vendido
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${pkg.color}`}>
                      <PkgIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block leading-none">
                        {pkg.name}
                      </h3>
                      <span className="text-2xl font-black text-[var(--color-ink)]">
                        R$ {pkg.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--color-muted)] leading-relaxed h-8">
                    {pkg.description}
                  </p>

                  <ul className="space-y-2 border-t border-[var(--color-border)]/60 pt-4 text-[10px] text-[var(--color-muted)]">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icons.Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyPackage(pkg.id)}
                  disabled={isPending}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    pkg.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                      : 'bg-[var(--color-bg)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-border-strong)]'
                  }`}
                >
                  {isPending ? 'Carregando...' : 'Comprar agora'} <Icons.ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Histórico de Transações (Extrato) ────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
          <Icons.History className="h-5 w-5 text-[var(--color-primary-dark)]" /> Extrato de Moedas
        </h2>

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] p-12 text-center text-[var(--color-muted)] text-xs">
            Nenhuma movimentação de moedas registrada ainda.
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[var(--color-ink)]">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">Moedas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/65">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--color-surface-2)]/40 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-muted)]">
                        {formatDateTime(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            tx.transaction_type === 'purchase'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          }`}
                        >
                          {tx.transaction_type === 'purchase' ? (
                            <>
                              <Icons.ArrowUpCircle className="h-3 w-3" /> Compra
                            </>
                          ) : (
                            <>
                              <Icons.ArrowDownCircle className="h-3 w-3" /> Desbloqueio
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium max-w-xs truncate" title={tx.description}>
                        {tx.description}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-black whitespace-nowrap ${
                          tx.amount > 0 ? 'text-emerald-500' : 'text-[var(--color-ink)]'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
