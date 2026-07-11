'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { searchProfessionalsAction } from '@/actions/search';

interface DiscoveryClientProps {
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

function ProfessionalCardSkeleton() {
  return (
    <div className="bg-white border border-border p-5 rounded-xl flex flex-col gap-4 shadow-2xs">
      <div className="flex gap-3.5 items-start">
        <div className="w-11 h-11 rounded-full bg-surface-2 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-surface-2 animate-pulse w-3/5 rounded" />
          <div className="h-3 bg-surface-2 animate-pulse w-1/4 rounded" />
        </div>
      </div>
      <div className="h-3 bg-surface-2 animate-pulse w-11/12 rounded" />
      <div className="h-3 bg-surface-2 animate-pulse w-4/5 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="flex-1 h-9 bg-surface-2 animate-pulse rounded-lg" />
        <div className="w-9 h-9 bg-surface-2 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

export default function DiscoveryClient({ categories }: DiscoveryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRegionIdx, setSelectedRegionIdx] = useState<number | null>(null);
  const [nearbyProfessionals, setNearbyProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (navigator.geolocation) {
      const timeout = setTimeout(() => {
        setLoadingCoords(false);
      }, 6000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoadingCoords(false);
        },
        () => {
          clearTimeout(timeout);
          setLoadingCoords(false);
        }
      );
    } else {
      setLoadingCoords(false);
    }
  }, []);

  useEffect(() => {
    if (!coords) return;
    setError(null);
    startTransition(async () => {
      const res = await searchProfessionalsAction({ lat: coords.lat, lng: coords.lng, radiusKm: 15 });
      if (res.error) {
        setError('Não foi possível carregar os profissionais. Tente novamente.');
      } else {
        setNearbyProfessionals(res.data || []);
      }
    });
  }, [coords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (coords) {
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
    }
    router.push(`/busca?${params.toString()}`);
  };

  const handleRegionSelect = (idx: number) => {
    const region = fallbackRegions[idx];
    setSelectedRegionIdx(idx);
    setCoords({ lat: region.lat, lng: region.lng });
  };

  const isLoading = loadingCoords || isPending;

  return (
    <div className="bg-white">
      
      {/* ─── Hero Section ────────────────── */}
      <section className="bg-surface border-b border-border py-16 sm:py-20">
        <div className="container-app max-w-3xl text-center px-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary mb-3">
            <Icons.Sparkles className="w-3.5 h-3.5" />
            Grande Vitória / ES
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight mb-4 leading-tight">
            Encontre quem resolve <br />
            <span className="text-primary">perto de você</span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-8 leading-relaxed">
            De manicures a eletricistas. Conectamos você aos melhores prestadores de serviço autônomo locais para atendimento ágil e de confiança.
          </p>

          {/* Formulario de Busca Refinado */}
          <form onSubmit={handleSearchSubmit} className="bg-white border border-border p-2 rounded-xl shadow-sm flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
            
            {/* Input buscar */}
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" aria-hidden="true" />
              <input
                id="search-query"
                type="text"
                placeholder="Qual serviço você precisa para hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 border-r-0 md:border-r md:border-border pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:ring-0 outline-none"
                aria-label="Buscar serviço"
              />
            </div>

            {/* Select Categoria */}
            <div className="shrink-0 flex items-center md:px-2">
              <select
                id="search-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-44 bg-transparent border-0 outline-none text-sm text-ink cursor-pointer py-2 md:py-0"
                aria-label="Filtrar por categoria"
              >
                <option value="">Todas áreas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Botao Submit */}
            <button
              type="submit"
              id="search-submit"
              className="btn btn-primary px-6 py-2.5 shrink-0 whitespace-nowrap cursor-pointer text-sm"
            >
              Encontrar
            </button>
          </form>
        </div>
      </section>

      {/* ─── Banner de Urgencia ("Preciso Agora") ────────────────────── */}
      <section className="bg-white border-b border-border py-4">
        <div className="container-app px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0 border border-amber-200/50 animate-pulse">
              <Icons.Zap className="w-4 h-4 fill-amber-500" aria-hidden="true" />
            </span>
            <div>
              <span className="block text-sm font-bold text-ink leading-tight">
                Precisa de atendimento de urgência para hoje?
              </span>
              <span className="block text-xs text-muted">
                Solicite e receba retornos imediatos dos profissionais disponíveis agora no seu bairro.
              </span>
            </div>
          </div>
          
          <Link
            href="/preciso-agora"
            id="urgency-cta"
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-error border-error/25 hover:bg-error-light hover:border-error/45 shrink-0"
          >
            Acessar Urgências
            <Icons.ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ─── Seção de Categorias ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 border-b border-border bg-surface/30">
          <div className="container-app px-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-primary rounded-full shrink-0"></div>
              <h2 className="text-base font-bold text-ink tracking-tight">
                Navegar pelas especialidades locais
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/busca?category=${c.id}`}
                  id={`category-${c.id}`}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white border border-border rounded-xl text-center shadow-2xs hover:border-primary hover:bg-primary-light/30 transition-all cursor-pointer group"
                >
                  <span className="display-flex items-center justify-center p-2.5 rounded-lg bg-surface text-subtle group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0">
                    <CategoryIcon name={c.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-ink leading-tight group-hover:text-primary transition-colors">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Grid de Profissionais Próximos ──────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="container-app px-6">
          
          {/* Header e Seletor de Bairro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full shrink-0"></div>
                <h2 className="text-base font-bold text-ink tracking-tight">
                  Profissionais por perto
                </h2>
              </div>
              <p className="text-xs text-muted pl-3.5">
                Exibindo resultados em um raio de até 15 km de distância
              </p>
            </div>

            {/* Region Selector */}
            <div className={`flex items-center gap-2 shrink-0 bg-surface border p-1.5 rounded-lg transition-all ${!coords ? 'border-primary ring-1 ring-primary/20 animate-pulse' : 'border-border'}`}>
              <Icons.MapPin className={`w-4 h-4 shrink-0 ml-1 ${!coords ? 'text-primary' : 'text-muted'}`} aria-hidden="true" />
              <select
                id="region-selector"
                value={selectedRegionIdx ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleRegionSelect(val);
                }}
                className="bg-transparent border-0 outline-none text-xs font-semibold text-ink cursor-pointer pr-4"
                aria-label="Selecionar região para busca"
              >
                <option value="" disabled>Escolher outro bairro...</option>
                {fallbackRegions.map((region, idx) => (
                  <option key={idx} value={idx}>{region.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* feed de Cards */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {loadingCoords && (
                <div className="flex items-center gap-2 p-3 bg-primary-light text-primary-dark rounded-lg text-xs font-semibold animate-pulse max-w-md mx-auto mb-4 border border-primary/10">
                  <Icons.Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <span>Obtendo sua localização para exibir profissionais próximos...</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProfessionalCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : !coords ? (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-surface rounded-xl border border-dashed border-border max-w-md mx-auto shadow-2xs">
              <span className="p-3 bg-surface-2 rounded-full mb-4">
                <Icons.MapPin className="w-6 h-6 text-muted" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold text-ink mb-1">Localização não detectada</h3>
              <p className="text-xs text-muted mb-5 max-w-[280px]">
                Compartilhe sua localização para buscar por proximidade ou escolha um bairro no seletor destacado acima para continuar.
              </p>
              <button
                type="button"
                onClick={() => {
                  const selectEl = document.getElementById('region-selector');
                  if (selectEl) {
                    selectEl.focus();
                  }
                }}
                className="btn btn-secondary btn-sm text-xs font-bold hover:bg-surface-2 cursor-pointer"
              >
                Escolher Bairro Manualmente
              </button>
            </div>
          ) : error ? (
            <div className="bg-error-light border border-error/20 p-5 rounded-lg max-w-lg mx-auto flex items-start gap-3" role="alert">
              <Icons.AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-error mb-1">{error}</p>
                <button
                  onClick={() => setCoords({ ...coords })}
                  className="text-xs text-primary-dark font-bold underline hover:text-primary transition-colors cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : nearbyProfessionals.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-surface border border-dashed border-border rounded-xl max-w-md mx-auto shadow-2xs">
              <span className="p-3 bg-surface-2 rounded-full mb-4">
                <Icons.Users className="w-6 h-6 text-muted animate-pulse" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold text-ink mb-1">Nenhum profissional encontrado</h3>
              <p className="text-xs text-muted max-w-[320px]">
                Nenhum prestador foi localizado neste bairro em um raio de 15km. Experimente buscar outra região no menu ou pesquise na <Link href="/busca" className="text-primary font-bold hover:underline">busca completa</Link>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {nearbyProfessionals.map((p) => (
                <ProfessionalCard key={p.id} professional={p} categories={categories} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

/* ─── Professional Card Refinado ────────────────────────────────────────── */
function ProfessionalCard({ professional: p, categories }: { professional: any; categories: any[] }) {
  const whatsappHref = p.phone
    ? `https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)}%2C%20vi%20seu%20perfil%20no%20Solução%20Já%20e%20gostaria%20de%20saber%20sua%20disponibilidade.`
    : null;

  const profileHref = `/busca?category=${categories.find((c) => c.name === p.category_name)?.id || ''}`;

  return (
    <article className="bg-white border border-border rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
      <div>
        
        {/* Bloco Superior com Avatar e Nome */}
        <div className="flex gap-3.5 items-start mb-4">
          <div className="w-11 h-11 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center shrink-0 border border-primary/10 overflow-hidden text-sm">
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
            ) : (
              <span>{(p.full_name || '?')[0].toUpperCase()}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-ink leading-tight truncate">
                {p.full_name}
              </h3>
              {p.is_verified && (
                <span
                  title="Profissional avaliado e verificado localmente"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-info text-white shrink-0"
                  aria-label="Verificado"
                >
                  <Icons.Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
                </span>
              )}
            </div>
            
            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-bold bg-primary-light text-primary-dark border border-primary/10">
              {p.category_name}
            </span>
          </div>
        </div>

        {/* Biografia Resumida */}
        <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4 italic">
          "{p.bio || 'Sem currículo profissional cadastrado no perfil.'}"
        </p>

      </div>

      {/* Meta e Info de Reputacao/Distancia */}
      <div>
        <div className="flex items-center gap-4 py-3 border-t border-border/80 text-xs text-muted font-medium mb-4">
          <span className="flex items-center gap-1">
            <Icons.MapPin className="w-3.5 h-3.5 text-subtle shrink-0" aria-hidden="true" />
            {(p.distance_meters / 1000).toFixed(1)} km de você
          </span>
          
          <span className="flex items-center gap-1">
            <Icons.Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" aria-hidden="true" />
            {p.avg_rating > 0 ? (
              <span>
                <strong className="text-ink">{parseFloat(p.avg_rating).toFixed(1)}</strong> ({p.total_reviews})
              </span>
            ) : (
              <span>Novo</span>
            )}
          </span>
        </div>

        {/* Botoes de Acao Rápida */}
        <div className="flex gap-2">
          
          <Link
            href={profileHref}
            className="btn btn-secondary btn-sm flex-1 text-center text-xs font-semibold"
          >
            Ver Serviços
          </Link>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chamar ${p.full_name} no WhatsApp`}
              className="inline-flex items-center justify-center p-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors cursor-pointer shrink-0"
              title="Chamar no WhatsApp"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          ) : (
            <span
              className="inline-flex items-center justify-center p-2 rounded-lg bg-surface text-subtle shrink-0 cursor-not-allowed border border-border"
              aria-label="WhatsApp não disponível"
              title="Sem Whatsapp no perfil"
            >
              <Icons.PhoneOff className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

    </article>
  );
}
