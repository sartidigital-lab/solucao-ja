import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Image, User, LogOut, MessageSquare, Coins } from 'lucide-react';
import { logout } from '@/actions/auth';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/server';

const navItems = [
  { href: '/profissional', label: 'Painel', icon: LayoutDashboard },
  { href: '/profissional/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/profissional/servicos', label: 'Serviços', icon: Briefcase },
  { href: '/profissional/portfolio', label: 'Portfólio', icon: Image },
  { href: '/profissional/perfil', label: 'Meu Perfil', icon: User },
];

export default async function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let coins = 0;
  if (user) {
    const { data } = await supabase.from('professionals')
      .select('coins_balance')
      .eq('id', user.id)
      .single();
    coins = data?.coins_balance || 0;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0"
        style={{
          zIndex: 'var(--z-sticky)',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/profissional"
              aria-label="Solução Já — Painel do Profissional"
              style={{ textDecoration: 'none' }}
            >
              <Logo size={28} />
            </Link>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              Profissional
            </span>

            {/* Indicator de Moedas */}
            <Link
              href="/profissional/moedas"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-700 text-[10px] font-extrabold transition-all"
              style={{ textDecoration: 'none' }}
            >
              <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{coins} moedas</span>
            </Link>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <Icon style={{ width: 15, height: 15 }} aria-hidden="true" />
                <span className="hidden-mobile">{label}</span>
              </Link>
            ))}
            <form action={logout}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-error)' }}
              >
                <LogOut style={{ width: 15, height: 15 }} aria-hidden="true" />
                <span className="hidden-mobile">Sair</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* ─── Content ──────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 0 4rem' }}>
        <div className="container-app" style={{ maxWidth: 960 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
