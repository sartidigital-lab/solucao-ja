import React from 'react';
import Link from 'next/link';
import { Home, User, LogOut } from 'lucide-react';
import { logout } from '@/actions/auth';
import Logo from '@/components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
              href="/dashboard"
              aria-label="Solução Já — Dashboard do cliente"
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
                letterSpacing: '0.01em',
              }}
            >
              Cliente
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link
              href="/dashboard"
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Home style={{ width: 15, height: 15 }} aria-hidden="true" />
              Início
            </Link>
            <Link
              href="/dashboard/perfil"
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <User style={{ width: 15, height: 15 }} aria-hidden="true" />
              Meu Perfil
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-error)' }}
              >
                <LogOut style={{ width: 15, height: 15 }} aria-hidden="true" />
                Sair
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
