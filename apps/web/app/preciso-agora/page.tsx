import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PrecisoAgoraClient from './PrecisoAgoraClient';

export default async function PrecisoAgoraPage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Solução Já - Preciso Agora!
        </Link>
        <Link href="/" className="text-sm text-slate-300 hover:text-white transition">
          Voltar para o Início
        </Link>
      </header>

      {/* Preciso Agora Client */}
      <PrecisoAgoraClient categories={categories || []} />
    </div>
  );
}
