'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import { verifyProfessionalAction, createCategoryAction } from '../actions/admin';

interface AdminDashboardProps {
  categories: any[];
  professionals: any[];
}

export default function AdminDashboard({ categories, professionals }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'categories' | 'all'>('pending');
  const [isPending, startTransition] = useTransition();

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Briefcase');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState(false);

  // Filter professionals
  const pendingProfs = professionals.filter((p) => p.verification_status === 'pending');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleVerify = (profId: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Deseja alterar o status do profissional para "${status === 'approved' ? 'Aprovado' : 'Recusado'}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await verifyProfessionalAction(profId, status);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    setCategorySuccess(false);

    if (!catName || !catSlug || !catIcon) {
      setCategoryError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    startTransition(async () => {
      const res = await createCategoryAction(catName, catSlug, catDesc || null, catIcon);
      if (res.error) {
        setCategoryError(res.error);
      } else {
        setCategorySuccess(true);
        setCatName('');
        setCatSlug('');
        setCatDesc('');
        setCatIcon('Briefcase');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-650 rounded-xl text-white">
            <Icons.Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide uppercase">Solução Já Admin</h1>
            <span className="text-[10px] text-slate-500 font-semibold block">Painel Geral de Controle</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <Icons.LogOut className="h-4 w-4" /> Sair
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-900 gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icons.UserCheck className="h-4 w-4" />
            Pendentes de Aprovação
            {pendingProfs.length > 0 && (
              <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full text-[9px]">
                {pendingProfs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icons.Tags className="h-4 w-4" />
            Gestão de Categorias
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icons.Users className="h-4 w-4" />
            Todos os Prestadores
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'pending' && (
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Prestadores Pendentes</h2>
              <p className="text-xs text-slate-400">Verifique os documentos e aprove ou recuse prestadores na plataforma.</p>
            </div>

            {pendingProfs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-sm bg-slate-900/10">
                Nenhum profissional com verificação pendente no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingProfs.map((p) => {
                  const pName = p.profiles?.full_name || 'Profissional';
                  const pEmail = p.profiles?.email || 'Sem e-mail';
                  const pPhone = p.profiles?.phone || 'Sem telefone';
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white text-base leading-snug">{pName}</h3>
                            <span className="text-[10px] text-slate-400 font-semibold">{p.title || 'Prestador de Serviço'}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-450 border-t border-slate-850 pt-3">
                          <p><strong className="text-slate-300">Documento:</strong> {p.document_number || 'Não informado'}</p>
                          <p><strong className="text-slate-300">Cidade/Bairro:</strong> {p.city || 'Sem cidade'} / {p.bairro || 'Sem bairro'}</p>
                          <p><strong className="text-slate-300">Contato:</strong> {pPhone} | {pEmail}</p>
                          {p.bio && (
                            <p className="text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-900 line-clamp-3">
                              "{p.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-slate-850 pt-4">
                        <button
                          type="button"
                          onClick={() => handleVerify(p.id, 'rejected')}
                          disabled={isPending}
                          className="py-2.5 rounded-xl border border-slate-800 hover:bg-red-950/20 hover:text-red-400 text-xs font-semibold text-slate-400 transition cursor-pointer disabled:opacity-50"
                        >
                          Recusar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerify(p.id, 'approved')}
                          disabled={isPending}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-555 rounded-xl text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                        >
                          Aprovar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Create Category Form */}
            <form onSubmit={handleAddCategory} className="md:col-span-1 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Nova Categoria</h3>

              {categoryError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-[10px] text-red-400">
                  {categoryError}
                </div>
              )}

              {categorySuccess && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[10px] text-emerald-400">
                  Categoria adicionada com sucesso!
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Encanador"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="Ex: encanador"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ícone Lucide</label>
                <input
                  type="text"
                  required
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Ex: Wrench, Scissors, Paintbrush"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Ex: Pequenos reparos hidráulicos..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-red-500/45 focus:ring-1 focus:ring-red-500/45 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg hover:from-red-550 hover:to-rose-550 transition disabled:opacity-50 cursor-pointer shadow-red-950/20"
              >
                Salvar Categoria
              </button>
            </form>

            {/* List Categories */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-white text-base">Categorias Cadastradas</h3>
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-900">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200">{c.name}</h4>
                      <p className="text-slate-500 text-[10px]">Slug: {c.slug} | Ícone: {c.icon}</p>
                      {c.description && <p className="text-slate-400 mt-1 line-clamp-1">{c.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <section className="space-y-4">
            <h3 className="font-bold text-white text-base">Relação Geral de Profissionais</h3>
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-900">
              {professionals.length === 0 ? (
                <p className="p-8 text-center text-slate-500 text-xs italic">Nenhum profissional cadastrado.</p>
              ) : (
                professionals.map((p) => {
                  const pName = p.profiles?.full_name || 'Profissional';
                  const statusLabel =
                    p.verification_status === 'approved'
                      ? 'Aprovado'
                      : p.verification_status === 'rejected'
                      ? 'Recusado'
                      : 'Pendente';
                  const statusColor =
                    p.verification_status === 'approved'
                      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                      : p.verification_status === 'rejected'
                      ? 'text-red-400 border-red-500/20 bg-red-500/5'
                      : 'text-orange-400 border-orange-500/20 bg-orange-500/5';

                  return (
                    <div key={p.id} className="p-4 sm:flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200">{pName}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-slate-550">
                          {p.title || 'Prestador'} | Local: {p.city} | Média Avaliações: ⭐ {p.avg_rating?.toFixed(1) || '0.0'} ({p.total_reviews || 0} reviews)
                        </p>
                      </div>

                      {p.verification_status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleVerify(p.id, 'approved')}
                          disabled={isPending}
                          className="px-3 py-1.5 bg-emerald-950 border border-emerald-900 hover:bg-emerald-900 rounded-lg text-[10px] font-bold text-emerald-400 transition cursor-pointer"
                        >
                          Aprovar Cadastro
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
