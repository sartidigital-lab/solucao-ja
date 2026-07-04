'use client';

import React, { useState, useEffect, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { searchProfessionalsAction } from '@/actions/search';

interface BuscaClientProps {
  categories: any[];
  initialQuery: string;
  initialCategoryId: string;
  initialLat: number | null;
  initialLng: number | null;
}

export default function BuscaClient({
  categories,
  initialQuery,
  initialCategoryId,
  initialLat,
  initialLng,
}: BuscaClientProps) {
  // Search parameters state
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [radiusKm, setRadiusKm] = useState(15);
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Interface state
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [expandedProfessionalId, setExpandedProfessionalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(!coords);
  const [isPending, startTransition] = useTransition();

  const fallbackRegions = [
    { name: 'Vitória - Jd. Camburi', lat: -20.2642, lng: -40.2711 },
    { name: 'Vitória - Jd. da Penha', lat: -20.2882, lng: -40.2989 },
    { name: 'Vitória - Praia do Canto', lat: -20.2995, lng: -40.2952 },
    { name: 'Vila Velha - Praia da Costa', lat: -20.3299, lng: -40.2862 },
    { name: 'Vila Velha - Itapuã', lat: -20.3421, lng: -40.2902 },
    { name: 'Serra - Laranjeiras', lat: -20.1989, lng: -40.2582 },
    { name: 'Cariacica - Campo Grande', lat: -20.3391, lng: -40.3831 },
    { name: 'Viana - Marcílio de Noronha', lat: -20.3582, lng: -40.4299 },
  ];

  useEffect(() => {
    if (!coords) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLoadingCoords(false);
          },
          (err) => {
            console.warn('Geolocation denied, using manual location fallback', err);
            // Default to Jardim da Penha coords
            setCoords({ lat: -20.2882, lng: -40.2989 });
            setLoadingCoords(false);
          }
        );
      } else {
        setCoords({ lat: -20.2882, lng: -40.2989 });
        setLoadingCoords(false);
      }
    }
  }, [coords]);

  const fetchResults = () => {
    if (!coords) return;
    setError(null);
    startTransition(async () => {
      const res = await searchProfessionalsAction({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm,
        categoryId: categoryId || null,
        query: query || null,
        onlyAvailableNow,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setProfessionals(res.data || []);
      }
    });
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, categoryId, radiusKm, onlyAvailableNow]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const handleToggleExpand = (id: string) => {
    setExpandedProfessionalId(expandedProfessionalId === id ? null : id);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 h-fit space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Icons.SlidersHorizontal className="h-5 w-5 text-blue-400" /> Filtros de Busca
          </h2>
        </div>

        {/* Region selection override */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Região de Busca</label>
          <select
            onChange={(e) => {
              const val = fallbackRegions[parseInt(e.target.value)];
              if (val) setCoords({ lat: val.lat, lng: val.lng });
            }}
            defaultValue=""
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="" disabled>Alterar região...</option>
            {fallbackRegions.map((region, idx) => (
              <option key={idx} value={idx}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categories select */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Radius range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Distância Máxima</span>
            <span className="text-blue-400 font-bold">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Toggle availability */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-sm text-slate-300">Disponível agora</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailableNow}
              onChange={(e) => setOnlyAvailableNow(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
          </label>
        </div>
      </aside>

      {/* Results Feed */}
      <div className="flex-1 space-y-6">
        {/* Search header Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-4 top-3 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Pesquisar por serviço ou nome..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/40 pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500 transition cursor-pointer"
          >
            Buscar
          </button>
        </form>

        {loadingCoords ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <Icons.Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-500" />
            Buscando sua localização...
          </div>
        ) : isPending ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <Icons.Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-500" />
            Carregando resultados...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : professionals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center text-slate-500">
            Nenhum profissional encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{professionals.length} profissionais encontrados</p>

            <div className="space-y-4">
              {professionals.map((p) => {
                const isExpanded = expandedProfessionalId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-6 transition ${
                      p.subscription_plan === 'destaque'
                        ? 'bg-gradient-to-r from-slate-900/60 to-amber-950/5 border border-amber-550/20 hover:border-amber-500/35 shadow-lg shadow-amber-950/5'
                        : 'bg-slate-900/30 border border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      {/* Left: Basic professional info */}
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700 flex-shrink-0">
                          {p.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <Icons.User className="h-8 w-8 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-white leading-tight">{p.full_name}</h3>
                            {p.is_verified && (
                              <span title="Verificado">
                                <Icons.CheckCircle2 className="h-5 w-5 text-blue-400 fill-blue-950" />
                              </span>
                            )}
                            {p.subscription_plan === 'destaque' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/35 text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                ★ Destaque
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {p.category_name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {p.city} - {p.bairro}
                            </span>
                          </div>

                          <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
                            {p.bio || 'Sem biografia disponível.'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Distance, Rating, Action buttons */}
                      <div className="w-full md:w-auto flex flex-col gap-2 items-end flex-shrink-0">
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                          <span className="flex items-center gap-1">
                            <Icons.MapPin className="h-4 w-4 text-slate-500" />
                            {(p.distance_meters / 1000).toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {p.avg_rating > 0 ? parseFloat(p.avg_rating).toFixed(1) : 'S/A'}
                          </span>
                        </div>

                        {p.is_available_now && (
                          <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Disponível Agora
                          </span>
                        )}

                        <div className="flex gap-2 w-full md:w-auto mt-2">
                          <button
                            onClick={() => handleToggleExpand(p.id)}
                            className="flex-1 md:flex-initial text-center rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isExpanded ? 'Esconder Serviços' : 'Ver Serviços'}{' '}
                            <Icons.ChevronDown className={`h-4 w-4 transition duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <a
                            href={`https://wa.me/55${p.phone?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)},%20gostaria%20de%20conversar%20sobre%20seus%20serviços.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Icons.PhoneCall className="h-4 w-4" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Services List */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-800/60 space-y-3">
                        <h4 className="text-sm font-bold text-slate-300">Serviços Oferecidos</h4>
                        {(!p.services_list || p.services_list.length === 0) ? (
                          <p className="text-xs text-slate-500">Nenhum serviço cadastrado.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {p.services_list.map((s: any) => (
                              <div
                                key={s.id}
                                className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/40 flex justify-between items-center"
                              >
                                <div>
                                  <h5 className="text-sm font-semibold text-slate-200">{s.name}</h5>
                                  <span className="text-xs text-slate-500">{s.duration_minutes} min de duração</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-400">
                                  R$ {parseFloat(s.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
