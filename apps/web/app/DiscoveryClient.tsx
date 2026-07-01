'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { searchProfessionalsAction } from '@/actions/search';

interface DiscoveryClientProps {
  categories: any[];
}

const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

export default function DiscoveryClient({ categories }: DiscoveryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyProfessionals, setNearbyProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Location selector fallbacks
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
    // Try to get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingCoords(false);
        },
        (err) => {
          console.warn('Geolocation denied or failed, using manual fallback selector.', err);
          setLoadingCoords(false);
        }
      );
    } else {
      setLoadingCoords(false);
    }
  }, []);

  useEffect(() => {
    if (coords) {
      setError(null);
      startTransition(async () => {
        const res = await searchProfessionalsAction({
          lat: coords.lat,
          lng: coords.lng,
          radiusKm: 15,
        });

        if (res.error) {
          setError(res.error);
        } else {
          setNearbyProfessionals(res.data || []);
        }
      });
    }
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

  const handleRegionSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Encontre profissionais de{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            confiança perto de você
          </span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg">
          Manicures, eletricistas, diaristas e mais na Grande Vitória. Chamou, resolveu.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 pt-6">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-4 top-3.5 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="O que você precisa hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-12 pr-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition placeholder:text-slate-500"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3.5 text-sm text-slate-300 outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </section>

      {/* Emergency Banner */}
      <section className="bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-900/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
            <Icons.Zap className="h-5 w-5 fill-red-400" /> Precisa de atendimento imediato?
          </h2>
          <p className="text-sm text-slate-300">
            Veja profissionais disponíveis hoje mesmo perto de você na Grande Vitória.
          </p>
        </div>
        <Link
          href="/preciso-agora"
          className="rounded-xl bg-red-600 hover:bg-red-500 px-6 py-3 text-sm font-semibold text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/20"
        >
          Preciso Agora <Icons.ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Category Icons Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Navegar por Categoria</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/busca?category=${c.id}`}
              className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col items-center gap-3 text-center hover:border-blue-500/40 hover:bg-slate-900/80 transition group"
            >
              <div className="p-3.5 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-900/20 group-hover:bg-blue-600 group-hover:text-white transition">
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white leading-tight">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Geolocation Nearby Feed */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Profissionais Próximos</h2>
            <p className="text-xs text-slate-400">Exibindo resultados em um raio de até 15 km</p>
          </div>
          
          {/* Manual Region Fallback Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Selecionar Região:</span>
            <select
              onChange={(e) => {
                const region = fallbackRegions[parseInt(e.target.value)];
                if (region) handleRegionSelect(region.lat, region.lng);
              }}
              defaultValue=""
              className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="" disabled>Selecione um Bairro...</option>
              {fallbackRegions.map((region, idx) => (
                <option key={idx} value={idx}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingCoords && (
          <div className="text-center py-12 text-slate-500 text-sm">
            <Icons.Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500" />
            Obtendo sua geolocalização...
          </div>
        )}

        {!loadingCoords && !coords && (
          <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-8 text-center text-slate-400 text-sm max-w-lg mx-auto">
            <Icons.MapPin className="h-8 w-8 mx-auto mb-3 text-slate-600" />
            <p className="mb-4">Não conseguimos obter sua localização automaticamente.</p>
            <p className="text-xs text-slate-500">
              Selecione uma região no menu acima para descobrir prestadores próximos.
            </p>
          </div>
        )}

        {coords && (
          <>
            {isPending ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <Icons.Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500" />
                Buscando prestadores de serviço...
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 max-w-lg mx-auto">
                {error}
              </div>
            ) : nearbyProfessionals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
                Nenhum profissional encontrado nesta região. Experimente selecionar outra no seletor acima.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyProfessionals.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition group"
                  >
                    <div>
                      {/* Title & Avatar */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                          {p.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <Icons.User className="h-6 w-6 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition leading-tight">
                              {p.full_name}
                            </h3>
                            {p.is_verified && (
                              <span title="Verificado">
                                <Icons.CheckCircle2 className="h-4 w-4 text-blue-400 fill-blue-950" />
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1 inline-block">
                            {p.category_name}
                          </span>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                        {p.bio || 'Sem biografia disponível.'}
                      </p>
                    </div>

                    <div>
                      {/* Technical Info */}
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mb-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Icons.MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{(p.distance_meters / 1000).toFixed(1)} km de você</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icons.Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span>
                            {p.avg_rating > 0
                              ? `${parseFloat(p.avg_rating).toFixed(1)} (${p.total_reviews})`
                              : 'Sem avaliações'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/busca?category=${categories.find((c) => c.name === p.category_name)?.id || ''}`}
                          className="flex-1 text-center rounded-lg bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                        >
                          Ver Perfil
                        </Link>
                        
                        {/* Instant WhatsApp Contact */}
                        <a
                          href={`https://wa.me/55${p.phone?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)},%20vi%20seu%20perfil%20no%20Solução%20Já%20e%20gostaria%20de%20saber%20sua%20disponibilidade.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-2.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                          title="Chamar no WhatsApp"
                        >
                          <Icons.PhoneCall className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
