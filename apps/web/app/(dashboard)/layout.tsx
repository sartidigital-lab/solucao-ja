import React from 'react';
import Link from 'next/link';
import { logout } from '@/actions/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Solução Já - Cliente
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition">
            Início
          </Link>
          <Link href="/dashboard/perfil" className="text-sm text-slate-300 hover:text-white transition">
            Meu Perfil
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition cursor-pointer">
              Sair
            </button>
          </form>
        </nav>
      </header>
      
      {/* Page Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
