'use client';

import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminTransitionPage() {
  // Pega a URL do admin do ambiente, caindo no localhost do dev como fallback padrão
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[460px] bg-white border border-border rounded-2xl p-8 sm:p-10 text-center shadow-2xs">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mb-5 border border-primary/10">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </span>
        
        <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight mb-2">
          Conta Administradora
        </h1>
        
        <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
          Você se autenticou com uma conta de <strong className="text-ink font-semibold">Administrador</strong>. 
          As ferramentas de moderação de profissionais e gestão de categorias residem no Painel Administrativo.
        </p>

        <div className="space-y-3">
          <a
            href={adminUrl}
            className="w-full btn btn-primary py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-primary hover:bg-primary-dark shadow-2xs transition-colors"
          >
            <span>Acessar Painel Administrador</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/"
            className="w-full btn btn-secondary py-3 text-xs font-bold block text-center cursor-pointer rounded-xl border border-border hover:bg-surface text-ink transition-colors"
          >
            Acessar Home do Cliente
          </Link>
        </div>
      </div>
    </div>
  );
}
