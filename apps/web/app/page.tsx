import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DiscoveryClient from './DiscoveryClient';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch categories to pass to Client Component
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Solução Já
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">
            Entrar
          </Link>
          <Link href="/cadastro/cliente" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition">
            Cadastrar-se
          </Link>
        </div>
      </header>

      {/* Hero & Discovery */}
      <DiscoveryClient categories={categories || []} />
      
      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-900/40 py-8 text-center text-sm text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} Solução Já - Chamou, resolveu. Todos os direitos reservados.
      </footer>
    </div>
  );
}
