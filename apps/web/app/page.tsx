import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DiscoveryClient from './DiscoveryClient';
import Logo from '@/components/Logo';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 px-0"
        style={{
          zIndex: 'var(--z-sticky)',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-app flex items-center justify-between h-16">
          <Link
            href="/"
            aria-label="Solução Já — Página inicial"
          >
            <Logo size={28} />
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-muted)' }}
            >
              Entrar
            </Link>
            <Link href="/cadastro/cliente" className="btn btn-primary btn-sm">
              Cadastrar-se
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1">
        <DiscoveryClient categories={categories || []} />
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '2rem 0',
        }}
      >
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', margin: 0 }}>
            © {new Date().getFullYear()} Solução Já · Chamou, resolveu.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', margin: 0 }}>
            Grande Vitória/ES — Vitória, Vila Velha, Serra, Cariacica e Viana
          </p>
        </div>
      </footer>
    </div>
  );
}
