import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import PrecisoAgoraClient from './PrecisoAgoraClient';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Preciso Agora — Solução Já',
  description: 'Encontre profissionais disponíveis agora na sua região na Grande Vitória.',
};

export default async function PrecisoAgoraPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container-app px-6 flex items-center h-16 gap-3">
          <Link
            href="/"
            aria-label="Voltar para o início"
            className="btn btn-ghost btn-sm p-2 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-error-light text-error border border-error/10">
              Urgente
            </span>
          </div>
        </div>
      </header>

      {/* ─── Hero Urgência ───────────────────────────────────────── */}
      <section className="bg-error-light border-b border-error/15 py-10 sm:py-12">
        <div className="container-app px-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-error text-white mb-2.5">
            Suporte Imediato
          </span>
          
          <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight mb-2 leading-tight">
            Preciso de atendimento <span className="text-error">agora</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            Consulte prestadores de serviço autônomo nas proximidades que estão online e disponíveis para atendimento imediato ou hoje mesmo.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-white">
        <PrecisoAgoraClient categories={categories || []} />
      </main>
    </div>
  );
}
