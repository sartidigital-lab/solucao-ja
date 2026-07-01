import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BuscaClient from './BuscaClient';

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

  // Fetch categories for filtering
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Solução Já
        </Link>
        <Link href="/" className="text-sm text-slate-300 hover:text-white transition">
          Voltar para o Início
        </Link>
      </header>

      {/* Search client */}
      <BuscaClient
        categories={categories || []}
        initialQuery={params.q || ''}
        initialCategoryId={params.category || ''}
        initialLat={params.lat ? parseFloat(params.lat) : null}
        initialLng={params.lng ? parseFloat(params.lng) : null}
      />
    </div>
  );
}
