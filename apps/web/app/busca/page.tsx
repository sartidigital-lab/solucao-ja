import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import BuscaClient from './BuscaClient';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Buscar Profissionais — Solução Já',
  description: 'Encontre manicures, eletricistas, diaristas e mais perto de você na Grande Vitória.',
};

interface BuscaPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', height: 64, gap: '0.75rem' }}>
          <Link
            href="/"
            aria-label="Voltar para o início"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.5rem', flexShrink: 0 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} aria-hidden="true" />
          </Link>
          <Link
            href="/"
            style={{ textDecoration: 'none' }}
          >
            <Logo size={28} />
          </Link>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-muted)',
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: '0.75rem',
              marginLeft: '0.25rem',
            }}
          >
            Busca
          </span>
        </div>
      </header>

      {/* ─── Content ──────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '1.5rem 0 4rem' }}>
        <div className="container-app">
          <BuscaClient
            categories={categories || []}
            initialQuery={params.q || ''}
            initialCategoryId={params.category || ''}
            initialLat={params.lat ? parseFloat(params.lat) : null}
            initialLng={params.lng ? parseFloat(params.lng) : null}
          />
        </div>
      </main>
    </div>
  );
}
