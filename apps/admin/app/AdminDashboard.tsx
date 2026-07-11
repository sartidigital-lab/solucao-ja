'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import Logo from '../components/Logo';
import { 
  verifyProfessionalAction, 
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  deleteProfessionalAction
} from '../actions/admin';

interface AdminDashboardProps {
  categories: any[];
  professionals: any[];
}

type Tab = 'pending' | 'categories' | 'all';

const tabConfig: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'pending',    label: 'Pendentes de aprovação', icon: Icons.UserCheck },
  { id: 'categories', label: 'Categorias',              icon: Icons.Tags },
  { id: 'all',        label: 'Todos os prestadores',    icon: Icons.Users },
];

function verificationBadge(status: string) {
  if (status === 'approved') return { label: 'Aprovado',  cls: 'badge-success' };
  if (status === 'rejected') return { label: 'Recusado',  cls: 'badge-error' };
  return                             { label: 'Pendente',  cls: 'badge-warning' };
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-border rounded-xl shadow-xs">
      <div className="p-3 bg-surface-2 rounded-full mb-4">
        <Icon className="w-6 h-6 text-muted" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      <p className="text-xs text-muted max-w-(--size-xs) leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-ink tracking-tight mb-1">{title}</h2>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}

export default function AdminDashboard({ categories, professionals }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [isPending, startTransition] = useTransition();

  // Category form states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Briefcase');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState(false);

  const pendingProfs = professionals.filter((p) => p.verification_status === 'pending');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleVerify = (profId: string, status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'aprovar' : 'recusar';
    if (!confirm(`Deseja ${label} este profissional?`)) return;

    startTransition(async () => {
      const res = await verifyProfessionalAction(profId, status);
      if (res.error) {
        alert(`Erro: ${res.error}`);
      } else {
        router.refresh();
      }
    });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    setCategorySuccess(false);

    if (!catName || !catSlug || !catIcon) {
      setCategoryError('Preencha todos os campos obrigatórios.');
      return;
    }

    startTransition(async () => {
      let res;
      if (editingCategoryId) {
        res = await updateCategoryAction(editingCategoryId, catName, catSlug, catDesc || null, catIcon);
      } else {
        res = await createCategoryAction(catName, catSlug, catDesc || null, catIcon);
      }

      if (res.error) {
        setCategoryError(res.error);
      } else {
        setCategorySuccess(true);
        setCatName('');
        setCatSlug('');
        setCatDesc('');
        setCatIcon('Briefcase');
        setEditingCategoryId(null);
        router.refresh();
      }
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir a categoria "${name}"?`)) return;

    setCategoryError(null);
    setCategorySuccess(false);

    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.error) {
        setCategoryError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDeleteProfessional = (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o prestador "${name}" do sistema? Essa ação removerá o seu perfil permanentemente.`)) return;

    startTransition(async () => {
      const res = await deleteProfessionalAction(id);
      if (res.error) {
        alert(`Erro: ${res.error}`);
      } else {
        router.refresh();
      }
    });
  };


  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col font-sans">
      
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="container-admin flex items-center justify-between h-16 px-6">
          
          {/* Logo e Nome da Marca */}
          <div className="flex items-center gap-3">
            <Logo size={32} showText={false} />
            <div>
              <span className="block font-semibold text-sm text-ink leading-tight tracking-tight">
                Solução <span style={{ color: 'var(--color-primary)', fontWeight: 950 }}>Já</span>
              </span>
              <span className="block text-[10px] font-black text-muted tracking-wider uppercase">
                Painel Administrativo
              </span>
            </div>
          </div>

          {/* Estado / Ações rápidas */}
          <div className="flex items-center gap-4">
            {pendingProfs.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary-light text-primary-dark border border-primary/20">
                <Icons.Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                {pendingProfs.length} pendente{pendingProfs.length !== 1 ? 's' : ''}
              </span>
            )}
            
            <div className="h-6 w-px bg-border"></div>
            
            <button
              id="admin-logout"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink hover:bg-surface rounded-md transition-colors cursor-pointer"
            >
              <Icons.LogOut className="w-4 h-4" aria-hidden="true" />
              Sair da conta
            </button>
          </div>

        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 py-8">
        <div className="container-admin px-6">

          {/* Abas Estilo TailwindUI */}
          <div className="border-b border-border mb-8 overflow-x-auto flex">
            <nav className="flex gap-8" aria-label="Abas de Navegação">
              {tabConfig.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                const count = id === 'pending' ? pendingProfs.length : id === 'all' ? professionals.length : null;

                return (
                  <button
                    key={id}
                    id={`tab-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={`
                      inline-flex items-center gap-2 py-4 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap
                      ${isActive 
                        ? 'border-primary text-ink' 
                        : 'border-transparent text-muted hover:text-ink hover:border-border-strong'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-subtle'}`} aria-hidden="true" />
                    <span>{label}</span>
                    {count !== null && count > 0 && (
                      <span className={`
                        inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors
                        ${isActive ? 'bg-primary text-white' : 'bg-surface-2 text-muted'}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ─── TAB: CONFIG: PENDENTES ───────────────────────────── */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <SectionHeader 
                title="Cadastros de profissionais aguardando revisão"
                description="Analise as informações do currículo e decida se aprova ou recusa a entrada do profissional na plataforma."
              />

              {pendingProfs.length === 0 ? (
                <EmptyState
                  icon={Icons.CheckCircle2}
                  title="Tudo em dia por aqui!"
                  description="Não há novos profissionais aguardando validação no momento. Bom trabalho!"
                />
              ) : (
                /* Lista Empilhada (Stacked List) Corporativa do TailwindUI */
                <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
                  <ul className="divide-y divide-border">
                    {pendingProfs.map((p) => {
                      const pName = p.profiles?.full_name || 'Profissional';
                      const pEmail = p.profiles?.email || '—';
                      const pPhone = p.profiles?.phone || '—';

                      return (
                        <li key={p.id} className="p-6 hover:bg-surface-2/20 transition-colors">
                          <article className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            
                            {/* Bloco de Nome e Info Pessoais */}
                            <div className="flex items-start gap-4 min-w-0 max-w-xl">
                              <div className="w-12 h-12 rounded-full bg-primary-light text-primary-dark font-bold text-base flex items-center justify-center shrink-0 border border-primary/10">
                                {pName[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="text-base font-bold text-ink leading-tight tracking-tight">
                                    {pName}
                                  </h3>
                                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-warning-light text-[oklch(0.50_0.14_85)] border border-warning/20">
                                    Aguardando
                                  </span>
                                </div>
                                
                                {p.title && (
                                  <p className="text-sm font-semibold text-primary mb-2">
                                    {p.title}
                                  </p>
                                )}
                                
                                {p.bio && (
                                  <p className="text-xs text-muted leading-relaxed mb-3 bg-surface p-3 rounded-md border border-border/40 italic">
                                    "{p.bio}"
                                  </p>
                                )}

                                {/* Informações do Prestador */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
                                  <span className="flex items-center gap-1">
                                    <Icons.Hash className="w-3.5 h-3.5 text-subtle" />
                                    <span className="font-semibold">CPF/CNPJ:</span> {p.document_number || 'Não informado'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icons.MapPin className="w-3.5 h-3.5 text-subtle" />
                                    <span className="font-semibold">Bairro:</span> {p.bairro || '—'} · {p.city || '—'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contatos */}
                            <div className="flex flex-col gap-1.5 text-xs text-ink lg:self-center shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="p-1 bg-surface-2 rounded text-muted">
                                  <Icons.Phone className="w-3.5 h-3.5" />
                                </span>
                                <span className="font-medium">{pPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="p-1 bg-surface-2 rounded text-muted">
                                  <Icons.Mail className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-muted truncate max-w-[200px]">{pEmail}</span>
                              </div>
                            </div>

                            {/* Ações de Aprovação */}
                            <div className="flex sm:flex-row lg:flex-col gap-2 shrink-0 lg:self-center w-full sm:w-auto lg:w-48">
                              <button
                                id={`approve-${p.id}`}
                                type="button"
                                onClick={() => handleVerify(p.id, 'approved')}
                                disabled={isPending}
                                className="btn btn-primary btn-sm flex-1 lg:w-full inline-flex items-center justify-center"
                              >
                                <Icons.Check className="w-4 h-4" />
                                Aprovar cadastro
                              </button>
                              <button
                                id={`reject-${p.id}`}
                                type="button"
                                onClick={() => handleVerify(p.id, 'rejected')}
                                disabled={isPending}
                                className="btn btn-secondary btn-sm flex-1 lg:w-full inline-flex items-center justify-center text-error hover:bg-error-light hover:border-error/35"
                              >
                                <Icons.X className="w-4 h-4" />
                                Recusar
                              </button>
                            </div>

                          </article>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: CONFIG: CATEGORIAS ──────────────────────────── */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <SectionHeader 
                title="Categorias de Serviços"
                description="Cadastre novas especialidades ou edite/exclua as que já estão disponíveis para contratação."
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Formulário Elegante (1/3 da largura) */}
                <form
                  onSubmit={handleSaveCategory}
                  className="bg-white border border-border rounded-xl p-6 shadow-xs flex flex-col gap-5 lg:col-span-1"
                >
                  <h3 className="text-sm font-bold text-ink mb-1 tracking-tight">
                    {editingCategoryId ? 'Editar Categoria' : 'Adicionar Categoria'}
                  </h3>

                  {categoryError && (
                    <div className="bg-error-light border border-error/20 text-error text-xs font-semibold px-4 py-2.5 rounded-md" role="alert">
                      {categoryError}
                    </div>
                  )}

                  {categorySuccess && (
                    <div className="bg-success-light border border-success/20 text-success text-xs font-semibold px-4 py-2.5 rounded-md flex items-center gap-2" role="status">
                      <Icons.CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      {editingCategoryId ? 'Categoria atualizada com sucesso!' : 'Categoria inserida com sucesso!'}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cat-name" className="text-xs font-semibold text-muted">Nome da Categoria *</label>
                    <input
                      id="cat-name"
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!editingCategoryId) {
                          setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                        }
                      }}
                      placeholder="Ex: Encanador, Diarista"
                      className="input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cat-slug" className="text-xs font-semibold text-muted">Slug da URL *</label>
                    <input
                      id="cat-slug"
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="Ex: encanador"
                      className="input font-mono text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cat-icon" className="text-xs font-semibold text-muted">Ícone do Lucide *</label>
                    <div className="relative">
                      <input
                        id="cat-icon"
                        type="text"
                        required
                        value={catIcon}
                        onChange={(e) => setCatIcon(e.target.value)}
                        placeholder="Ex: Wrench, Scissors, Paintbrush"
                        className="input pr-10"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary" aria-hidden="true">
                        {(() => {
                          const Icon = (Icons as any)[catIcon];
                          return Icon ? <Icon className="w-4 h-4" /> : null;
                        })()}
                      </span>
                    </div>
                    <p className="text-[10px] text-subtle">
                      Explore os nomes oficiais dos ícones em{' '}
                      <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        lucide.dev/icons
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cat-desc" className="text-xs font-semibold text-muted">Breve descrição (opcional)</label>
                    <textarea
                      id="cat-desc"
                      rows={3}
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="Resumo do tipo de serviço..."
                      className="input text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      id="cat-submit"
                      type="submit"
                      disabled={isPending}
                      className="btn btn-primary w-full"
                    >
                      {isPending ? 'Salvando...' : (
                        <>
                          {editingCategoryId ? <Icons.Check className="w-4 h-4" /> : <Icons.Plus className="w-4 h-4" />}
                          {editingCategoryId ? 'Atualizar categoria' : 'Salvar categoria'}
                        </>
                      )}
                    </button>

                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(null);
                          setCatName('');
                          setCatSlug('');
                          setCatDesc('');
                          setCatIcon('Briefcase');
                          setCategoryError(null);
                          setCategorySuccess(false);
                        }}
                        className="btn btn-secondary w-full"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </form>

                {/* Lista Dividida Elegante (2/3 da largura) */}
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-ink">
                      Categorias Cadastradas
                    </h3>
                    <span className="text-xs font-semibold text-muted bg-white border border-border px-2.5 py-1 rounded-md shadow-2xs">
                      {categories.length} no total
                    </span>
                  </div>

                  {categories.length === 0 ? (
                    <EmptyState
                      icon={Icons.Tags}
                      title="Nenhuma categoria encontrada"
                      description="Comece adicionando a primeira categoria no painel ao lado."
                    />
                  ) : (
                    <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-surface border-b border-border text-[10px] font-black text-muted tracking-wider uppercase">
                              <th className="px-6 py-3.5">Nome e URL</th>
                              <th className="px-6 py-3.5">Ícone Lucide</th>
                              <th className="px-6 py-3.5">Descrição</th>
                              <th className="px-6 py-3.5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {categories.map((c) => {
                              const CatIcon = (Icons as any)[c.icon] || Icons.Tag;
                              return (
                                <tr key={c.id} className="hover:bg-surface-2/10 transition-colors">
                                  <td className="px-6 py-4 font-sans">
                                    <div className="font-semibold text-sm text-ink">{c.name}</div>
                                    <div className="text-xs font-mono text-subtle">{c.slug}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary-light text-primary">
                                        <CatIcon className="w-4 h-4" />
                                      </span>
                                      <span className="text-xs text-ink font-medium">{c.icon}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-xs text-muted max-w-sm line-clamp-2">
                                      {c.description || '—'}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCategoryId(c.id);
                                          setCatName(c.name);
                                          setCatSlug(c.slug);
                                          setCatDesc(c.description || '');
                                          setCatIcon(c.icon);
                                          setCategoryError(null);
                                          setCategorySuccess(false);
                                        }}
                                        className="btn btn-secondary btn-xs inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Icons.Pencil className="w-3.5 h-3.5 text-subtle" />
                                        <span>Editar</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(c.id, c.name)}
                                        className="btn btn-secondary btn-xs inline-flex items-center gap-1 text-error hover:bg-error-light hover:border-error/20 cursor-pointer"
                                      >
                                        <Icons.Trash2 className="w-3.5 h-3.5" />
                                        <span>Excluir</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ─── TAB: CONFIG: TODOS OS PRESTADORES ────────────────── */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              <SectionHeader 
                title={`Histórico da Base de Prestadores`}
                description="Gerencie e visualize toda a relação de profissionais cadastrados localmente com suas respectivas avaliações e status."
              />

              {professionals.length === 0 ? (
                <EmptyState
                  icon={Icons.Users}
                  title="Nenhum profissional na base"
                  description="Até o momento, não temos nenhum profissional registrado no banco local."
                />
              ) : (
                /* Tabela em Card Único Corporativo Estilo TailwindUI (Sem tabelas espremidas) */
                <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface border-b border-border text-[10px] font-black text-muted tracking-wider uppercase">
                          <th className="px-6 py-4">Prestador</th>
                          <th className="px-6 py-4">Especialidade / Título</th>
                          <th className="px-6 py-4">Região</th>
                          <th className="px-6 py-4 text-center">Avaliação</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {professionals.map((p) => {
                          const pName = p.profiles?.full_name || 'Profissional';
                          const { label: statusLabel, cls: statusCls } = verificationBadge(p.verification_status);

                          return (
                            <tr key={p.id} className="hover:bg-surface-2/10 transition-colors">
                              
                              {/* Prestador */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-primary-light text-primary-dark font-bold text-sm flex items-center justify-center shrink-0">
                                    {pName[0]?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm text-ink">{pName}</div>
                                    <div className="text-xs text-muted">{p.profiles?.email || '—'}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Título */}
                              <td className="px-6 py-4">
                                <span className="text-xs font-semibold text-primary">{p.title || 'Prestador de Serviço'}</span>
                              </td>

                              {/* Região */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs text-ink">{p.city || '—'}</span>
                                <span className="block text-[10px] text-muted">{p.bairro || '—'}</span>
                              </td>

                              {/* Avaliação */}
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {p.avg_rating > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200/50">
                                    <Icons.Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    {parseFloat(p.avg_rating).toFixed(1)}
                                    <span className="text-[10px] text-amber-600/70 font-medium">({p.total_reviews || 0})</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-subtle font-medium">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`badge ${statusCls}`}>{statusLabel}</span>
                              </td>

                              {/* Ação Rápida */}
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  {p.verification_status !== 'approved' ? (
                                    <button
                                      id={`quick-approve-${p.id}`}
                                      type="button"
                                      onClick={() => handleVerify(p.id, 'approved')}
                                      disabled={isPending}
                                      className="btn btn-primary btn-xs inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Icons.Check className="w-3.5 h-3.5" />
                                      Aprovar
                                    </button>
                                  ) : (
                                    <button
                                      id={`quick-reject-${p.id}`}
                                      type="button"
                                      onClick={() => handleVerify(p.id, 'rejected')}
                                      disabled={isPending}
                                      className="btn btn-secondary btn-xs inline-flex items-center gap-1 cursor-pointer text-error hover:bg-error-light hover:border-error/20"
                                    >
                                      <Icons.X className="w-3.5 h-3.5" />
                                      Recusar
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProfessional(p.id, pName)}
                                    disabled={isPending}
                                    className="btn btn-secondary btn-xs inline-flex items-center gap-1 text-error hover:bg-error-light hover:border-error/20 cursor-pointer"
                                    title="Remover prestador permanentemente"
                                  >
                                    <Icons.Trash2 className="w-3.5 h-3.5" />
                                    Excluir
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
