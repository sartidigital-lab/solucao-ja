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

const fallbackRegions = [
  { name: 'Vitória — Jd. Camburi', lat: -20.2642, lng: -40.2711 },
  { name: 'Vitória — Jd. da Penha', lat: -20.2882, lng: -40.2989 },
  { name: 'Vitória — Praia do Canto', lat: -20.2995, lng: -40.2952 },
  { name: 'Vila Velha — Praia da Costa', lat: -20.3299, lng: -40.2862 },
  { name: 'Vila Velha — Itapuã', lat: -20.3421, lng: -40.2902 },
  { name: 'Serra — Laranjeiras', lat: -20.1989, lng: -40.2582 },
  { name: 'Cariacica — Campo Grande', lat: -20.3391, lng: -40.3831 },
  { name: 'Viana — Marcílio de Noronha', lat: -20.3582, lng: -40.4299 },
];

function ProfessionalSkeleton() {
  return (
    <div className="bg-white border border-border p-5 rounded-xl flex gap-4 items-start shadow-2xs">
      <div className="w-12 h-12 rounded-full bg-surface-2 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-surface-2 animate-pulse w-3/5 rounded" />
        <div className="h-3 bg-surface-2 animate-pulse w-1/3 rounded" />
        <div className="h-3 bg-surface-2 animate-pulse w-11/12 rounded mt-1" />
        <div className="h-3 bg-surface-2 animate-pulse w-3/4 rounded" />
      </div>
    </div>
  );
}

export default function BuscaClient({
  categories,
  initialQuery,
  initialCategoryId,
  initialLat,
  initialLng,
}: BuscaClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [radiusKm, setRadiusKm] = useState(15);
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(!coords);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!coords) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLoadingCoords(false);
          },
          () => {
            setCoords({ lat: -20.2882, lng: -40.2989 }); // Jd. da Penha default
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
        setError('Não foi possível buscar os profissionais. Tente novamente.');
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

  const isLoading = loadingCoords || isPending;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* ─── Sidebar de Filtros ──────────────────────────────────── */}
      <aside className="w-full lg:w-64 shrink-0 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 lg:sticky lg:top-20" aria-label="Filtros de busca">
        
        <h2 className="text-xs font-black text-ink tracking-wider uppercase flex items-center gap-2 border-b border-border pb-3">
          <Icons.SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden="true" />
          Filtros de Busca
        </h2>

        {/* Regiao Select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-region" className="text-xs font-semibold text-muted">Região (Bairro)</label>
          <select
            id="filter-region"
            onChange={(e) => {
              const val = fallbackRegions[parseInt(e.target.value)];
              if (val) setCoords({ lat: val.lat, lng: val.lng });
            }}
            defaultValue=""
            className="input select text-xs"
          >
            <option value="" disabled>Alterar bairro...</option>
            {fallbackRegions.map((region, idx) => (
              <option key={idx} value={idx}>{region.name}</option>
            ))}
          </select>
        </div>

        {/* Categoria Select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-category" className="text-xs font-semibold text-muted">Especialidade</label>
          <select
            id="filter-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input select text-xs"
          >
            <option value="">Todas áreas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Raio Range */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted">Distância limite</span>
            <span className="font-bold text-primary bg-primary-light px-2 py-0.5 rounded border border-primary/10">{radiusKm} km</span>
          </div>
          
          <input
            id="filter-radius"
            type="range"
            min="1"
            max="100"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label={`Raio de busca: ${radiusKm} quilômetros`}
          />
          <div className="flex justify-between text-xs text-muted font-bold">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>

        {/* Disponivel agora Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-border/80">
          <label
            htmlFor="toggle-available"
            className="text-xs font-semibold text-ink cursor-pointer"
          >
            Disponível agora
          </label>
          <label className="toggle" aria-label="Filtrar apenas disponíveis agora">
            <input
              id="toggle-available"
              type="checkbox"
              checked={onlyAvailableNow}
              onChange={(e) => setOnlyAvailableNow(e.target.checked)}
            />
            <div className="toggle-track" />
            <div className="toggle-thumb" />
          </label>
        </div>

      </aside>

      {/* ─── Feed de Resultados ──────────────────────────────────── */}
      <div className="flex-1 w-full flex flex-col gap-6">
        
        {/* Barra de Busca principal */}
        <form onSubmit={handleSearchSubmit} className="bg-white border border-border p-1.5 rounded-xl shadow-2xs flex gap-2 w-full">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" aria-hidden="true" />
            <input
              id="search-text"
              type="text"
              placeholder="Buscar por serviço ou profissional..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:ring-0 outline-none"
              aria-label="Buscar por serviço ou nome"
            />
          </div>
          <button id="search-btn" type="submit" className="btn btn-primary px-5 py-2.5 text-xs shrink-0 cursor-pointer">
            Buscar
          </button>
        </form>

        {/* Listagem */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ProfessionalSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-error-light border border-error/20 p-5 rounded-lg flex items-start gap-3" role="alert">
            <Icons.AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-error mb-1">{error}</p>
              <button
                onClick={fetchResults}
                className="text-xs text-primary-dark font-bold underline hover:text-primary transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-surface border border-dashed border-border rounded-xl shadow-2xs">
            <span className="p-3 bg-surface-2 rounded-full mb-4">
              <Icons.SearchX className="w-6 h-6 text-muted" aria-hidden="true" />
            </span>
            <h3 className="text-sm font-bold text-ink mb-1">Nenhum profissional localizado</h3>
            <p className="text-xs text-muted max-w-[320px]">
              Tente ampliar a distância limite nos filtros ao lado ou escolher outro bairro/categoria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Header de Quantidade */}
            <p className="text-xs font-bold text-muted bg-surface px-4 py-2 rounded-lg border border-border/65 self-start" aria-live="polite">
              {professionals.length} profissional{professionals.length !== 1 ? 'is' : ''} encontrado{professionals.length !== 1 ? 's' : ''}
            </p>

            {/* Lista dos cards */}
            <div className="flex flex-col gap-4">
              {professionals.map((p) => {
                const isExpanded = expandedId === p.id;
                const whatsappHref = p.phone
                  ? `https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)}%2C%20gostaria%20de%20conversar%20sobre%20seus%20serviços.`
                  : null;

                const isDestaque = p.subscription_plan === 'destaque';

                return (
                  <article
                    key={p.id}
                    className={`
                      p-5 rounded-xl border transition-all flex flex-col gap-4
                      ${isDestaque 
                        ? 'bg-amber-50/20 border-amber-500/20 shadow-2xs' 
                        : 'bg-white border-border shadow-2xs hover:shadow-xs'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:justify-between">
                      
                      {/* Lado Esquerdo: Info detalhada */}
                      <div className="flex gap-3.5 items-start min-w-0 max-w-xl">
                        
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary-light text-primary-dark font-bold text-sm flex items-center justify-center shrink-0 border border-primary/10 overflow-hidden">
                          {p.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(p.full_name || '?')[0].toUpperCase()}</span>
                          )}
                        </div>

                        {/* Nome e Especialidades */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <h3 className="text-sm font-bold text-ink leading-tight">
                              {p.full_name}
                            </h3>
                            {p.is_verified && (
                              <span
                                title="Verificado"
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-info text-white shrink-0"
                                aria-label="Verificado"
                              >
                                <Icons.Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
                              </span>
                            )}
                            {isDestaque && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-black tracking-wider uppercase bg-amber-500 text-white shadow-2xs">
                                ★ Destaque
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-surface-2 text-muted border border-border/40">
                              {p.category_name}
                            </span>
                            {p.city && (
                              <span className="text-xs text-muted font-medium">
                                {p.city}{p.bairro ? ` · ${p.bairro}` : ''}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted leading-relaxed line-clamp-2 italic">
                            "{p.bio || 'Sem currículo profissional cadastrado.'}"
                          </p>
                        </div>

                      </div>

                      {/* Lado Direito: Info de Status, Distancia e Ações */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 sm:self-center">
                        
                        {/* Indicadores */}
                        <div className="flex items-center gap-3 text-xs text-muted font-medium">
                          <span className="flex items-center gap-1">
                            <Icons.MapPin className="w-3.5 h-3.5 text-subtle shrink-0" />
                            {(p.distance_meters / 1000).toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            {p.avg_rating > 0 ? (
                              <strong>{parseFloat(p.avg_rating).toFixed(1)}</strong>
                            ) : (
                              <span className="text-xs text-subtle font-normal">Novo</span>
                            )}
                          </span>
                        </div>

                        {p.is_available_now && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-success-light text-success border border-success/15 shrink-0">
                            Disponível agora
                          </span>
                        )}

                        {/* Botoes de Acao */}
                        <div className="flex gap-2">
                          <button
                            id={`expand-${p.id}`}
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="btn btn-secondary btn-xs inline-flex items-center gap-1 cursor-pointer font-semibold text-xs py-1.5"
                            aria-expanded={isExpanded}
                            aria-controls={`services-${p.id}`}
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver serviços'}</span>
                            <Icons.ChevronDown
                              className="w-3.5 h-3.5 transition-transform duration-200"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              aria-hidden="true"
                            />
                          </button>

                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Chamar ${p.full_name} no WhatsApp`}
                              className="btn btn-xs inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white border-0 py-1.5 cursor-pointer font-semibold text-xs"
                            >
                              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Lista dos Serviços Oferecidos Expansivel */}
                    {isExpanded && (
                      <div
                        id={`services-${p.id}`}
                        className="mt-2 pt-4 border-t border-border/80"
                      >
                        <h4 className="text-xs font-bold text-ink mb-3 tracking-tight">
                          Tabela de Serviços & Valores
                        </h4>
                        {!p.services_list || p.services_list.length === 0 ? (
                          <p className="text-xs text-muted">
                            Nenhum serviço individualizado cadastrado no momento.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {p.services_list.map((s: any) => (
                              <div
                                key={s.id}
                                className="bg-surface border border-border rounded-xl p-3 flex justify-between items-center gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-ink truncate">{s.name}</p>
                                  <p className="text-xs text-muted font-semibold">{s.duration_minutes} min</p>
                                </div>
                                <span className="text-xs font-bold text-primary-dark shrink-0">
                                  R$ {parseFloat(s.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
