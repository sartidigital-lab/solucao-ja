import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Image, User, LogOut, MessageSquare } from 'lucide-react';
import { logout } from '@/actions/auth';
import Logo from '@/components/Logo';

const navItems = [
  { href: '/profissional', label: 'Painel', icon: LayoutDashboard },
  { href: '/profissional/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/profissional/servicos', label: 'Serviços', icon: Briefcase },
  { href: '/profissional/portfolio', label: 'Portfólio', icon: Image },
  { href: '/profissional/perfil', label: 'Meu Perfil', icon: User },
];

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
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
