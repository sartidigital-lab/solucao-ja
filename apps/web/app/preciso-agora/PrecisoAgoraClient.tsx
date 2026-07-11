'use client';

import React, { useState, useEffect, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { searchProfessionalsAction } from '@/actions/search';

interface PrecisoAgoraClientProps {
  categories: any[];
}

const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Wrench;
  return <IconComponent className={className} />;
};

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
    <div className="bg-white border border-border p-5 rounded-xl flex flex-col gap-4 shadow-2xs">
      <div className="flex gap-3.5 items-center">
        <div className="w-12 h-12 rounded-full bg-surface-2 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-surface-2 animate-pulse w-3/5 rounded" />
          <div className="h-3 bg-surface-2 animate-pulse w-1/4 rounded" />
        </div>
      </div>
      <div className="h-3 bg-surface-2 animate-pulse w-11/12 rounded" />
      <div className="h-3 bg-surface-2 animate-pulse w-4/5 rounded" />
      <div className="h-9 bg-surface-2 animate-pulse rounded-lg mt-2" />
    </div>
  );
}

export default function PrecisoAgoraClient({ categories }: PrecisoAgoraClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoadingCoords(false);
        },
        () => {
          setCoords({ lat: -20.2882, lng: -40.2989 });
          setLoadingCoords(false);
        }
      );
    } else {
      setCoords({ lat: -20.2882, lng: -40.2989 });
      setLoadingCoords(false);
    }
  }, []);

  const fetchEmergency = () => {
    if (!coords) return;
    setError(null);
    startTransition(async () => {
      const res = await searchProfessionalsAction({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: 10,
        categoryId: selectedCategoryId || null,
        onlyAvailableNow: true,
      });
      if (res.error) {
        setError('Não foi possível carregar os profissionais. Tente novamente.');
      } else {
        setProfessionals(res.data || []);
      }
    });
  };

  useEffect(() => {
    fetchEmergency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, selectedCategoryId]);

  const isLoading = loadingCoords || isPending;

  return (
    <div className="container-app px-6 py-8 max-w-4xl font-sans">
      
      {/* Container de Controle e Bairro */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Icons.MapPin className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
          <span className="text-xs font-bold text-ink">Raio de 10 km</span>
          <span className="text-xs text-muted font-medium">· Somente profissionais online no momento</span>
        </div>
        
        <select
          id="preciso-region"
          onChange={(e) => {
            const val = fallbackRegions[parseInt(e.target.value)];
            if (val) setCoords({ lat: val.lat, lng: val.lng });
          }}
          defaultValue=""
          className="input select text-xs cursor-pointer w-full sm:w-52"
          aria-label="Alterar localização"
        >
          <option value="" disabled>Alterar localização...</option>
          {fallbackRegions.map((r, i) => <option key={i} value={i}>{r.name}</option>)}
        </select>
      </div>

      {/* Pills de Filtragem de Categorias */}
      <div className="mb-8">
        <label className="block text-xs font-black text-ink uppercase tracking-wider mb-3">Especialidade Urgente</label>
        
        <div className="flex flex-wrap gap-2">
          <button
            id="cat-all"
            onClick={() => setSelectedCategoryId('')}
            className={`
              btn btn-sm text-xs font-bold px-4 py-1.5 cursor-pointer rounded-lg border transition-all
              ${!selectedCategoryId 
                ? 'bg-error text-white border-error shadow-2xs' 
                : 'bg-white text-muted border-border hover:bg-surface'}
            `}
          >
            Todas
          </button>
          
          {categories.map((c) => {
            const isActive = selectedCategoryId === c.id;
            return (
              <button
                key={c.id}
                id={`cat-${c.id}`}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`
                  btn btn-sm text-xs font-bold px-3 py-1.5 cursor-pointer rounded-lg border inline-flex items-center gap-1.5 transition-all
                  ${isActive 
                    ? 'bg-error text-white border-error shadow-2xs' 
                    : 'bg-white text-muted border-border hover:bg-surface'}
                `}
              >
                <CategoryIcon name={c.icon} className="h-3.5 w-3.5 shrink-0" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Resultados */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ProfessionalSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-error-light border border-error/25 p-5 rounded-lg flex items-start gap-3 max-w-lg mx-auto" role="alert">
          <Icons.AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-error mb-1">{error}</p>
            <button
              onClick={fetchEmergency}
              className="text-xs text-primary-dark font-bold underline hover:text-primary transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      ) : professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-surface border border-dashed border-border rounded-xl shadow-2xs max-w-md mx-auto">
          <span className="p-3 bg-surface-2 rounded-full mb-4">
            <Icons.Clock2 className="w-6 h-6 text-muted" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold text-ink mb-1">Sem profissionais disponíveis agora</h3>
          <p className="text-xs text-muted max-w-[280px]">
            Nenhum prestador está disponível neste momento no bairro filtrado. Tente expandir sua busca sem filtros ou mude o bairro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {professionals.map((p) => {
            const whatsappHref = p.phone
              ? `https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)}%2C%20vi%20no%20Solução%20Já%20que%20você%20está%20disponível%20agora.%20Preciso%20de%20atendimento%20urgente%20de%20${encodeURIComponent(p.category_name || 'serviço')}%20hoje.%20Pode%20me%20atender?`
              : null;

            return (
              <article
                key={p.id}
                className="bg-white border border-border p-5 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden h-full"
              >
                {/* Linha topo */}
                <div>
                  
                  {/* Badge de disponibilidade com sinal pulsante */}
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-black uppercase bg-success-light text-success border border-success/15 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" aria-hidden="true" />
                    Online
                  </span>

                  <div className="flex gap-3.5 items-start mb-4">
                    <div className="w-11 h-11 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center shrink-0 border border-primary/10 overflow-hidden text-sm">
                      {p.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(p.full_name || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="min-w-0 pr-16">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-ink leading-tight truncate">
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
                      </div>
                      
                      <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-xs font-bold bg-primary-light text-primary-dark tracking-wide">
                        {p.category_name}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2 italic mb-4">
                    "{p.bio || 'Sem currículo profissional cadastrado no perfil.'}"
                  </p>
                </div>

                {/* Meta de Reputacao e Distancia */}
                <div>
                  <div className="flex items-center gap-4 py-3 border-t border-border/80 text-xs text-muted font-medium mb-4">
                    <span className="flex items-center gap-1">
                      <Icons.MapPin className="w-3.5 h-3.5 text-subtle" aria-hidden="true" />
                      {(p.distance_meters / 1000).toFixed(1)} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                      {p.avg_rating > 0 ? parseFloat(p.avg_rating).toFixed(1) : 'Novo'}
                    </span>
                  </div>

                  {/* CTA Urgente */}
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white border-0 py-2.5 font-bold text-xs ring-1 ring-emerald-600/10 cursor-pointer rounded-lg transition-colors"
                      aria-label={`Chamar ${p.full_name} no WhatsApp agora`}
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Chamou, resolveu!</span>
                    </a>
                  ) : (
                    <div className="btn w-full inline-flex items-center justify-center gap-1.5 bg-surface text-subtle border border-border cursor-not-allowed py-2.5 font-bold text-xs">
                      <Icons.PhoneOff className="w-4 h-4" />
                      <span>Contato indisponível</span>
                    </div>
                  )}
                </div>

              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
