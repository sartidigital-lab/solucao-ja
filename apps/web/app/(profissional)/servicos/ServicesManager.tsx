'use client';

import React, { useState, useTransition } from 'react';
import { createService, updateService, deleteService } from '@/actions/services';

interface ServicesManagerProps {
  initialServices: any[];
  categories: any[];
}

export default function ServicesManager({ initialServices, categories }: ServicesManagerProps) {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [categoryId, setCategoryId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEditClick = (service: any) => {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price.toString());
    setDurationMinutes(service.duration_minutes.toString());
    setCategoryId(service.category_id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDurationMinutes('60');
    setCategoryId('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    const durationNum = parseInt(durationMinutes);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Preço inválido');
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duração inválida');
      return;
    }

    if (!categoryId) {
      setError('Selecione uma categoria');
      return;
    }

    startTransition(async () => {
      if (editingId) {
        // Update
        const res = await updateService(editingId, {
          name,
          description,
          price: priceNum,
          durationMinutes: durationNum,
          categoryId,
        });

        if (res?.error) {
          setError(res.error);
        } else {
          // Update local state
          const updated = services.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  name,
                  description,
                  price: priceNum,
                  duration_minutes: durationNum,
                  category_id: categoryId,
                  categories: { name: categories.find((c) => c.id === categoryId)?.name },
                }
              : s
          );
          setServices(updated);
          handleCancelEdit();
        }
      } else {
        // Create
        const res = await createService({
          name,
          description,
          price: priceNum,
          durationMinutes: durationNum,
          categoryId,
        });

        if (res?.error) {
          setError(res.error);
        } else {
          window.location.reload();
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return;
    setError(null);

    startTransition(async () => {
      const res = await deleteService(id);
      if (res?.error) {
        setError(res.error);
      } else {
        setServices(services.filter((s) => s.id !== id));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Seus Serviços</h2>
        
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
            Nenhum serviço cadastrado ainda. Use o formulário ao lado para adicionar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-teal-500/50 transition">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg text-white leading-tight">{s.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {s.categories?.name}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{s.description}</p>
                  )}
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-3 mt-2">
                  <div className="text-sm">
                    <span className="text-xs text-slate-500 block">Preço / Duração</span>
                    <span className="font-bold text-emerald-400">R$ {parseFloat(s.price).toFixed(2)}</span>
                    <span className="text-slate-500 ml-2">({s.duration_minutes} min)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs px-3 py-1.5 rounded bg-red-950/40 text-red-400 border border-red-950 hover:bg-red-900/40 transition cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Column */}
      <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-slate-200 mb-4">
          {editingId ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome do Serviço</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
              placeholder="Ex: Corte de Cabelo Feminino"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duração (Minutos)</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Descrição (Opcional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-teal-500 resize-none"
              placeholder="Descreva o que está incluso no serviço..."
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/3 rounded-lg border border-slate-700 bg-slate-800/30 py-2.5 text-sm font-semibold text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
