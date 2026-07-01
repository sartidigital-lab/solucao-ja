'use client';

import React, { useState, useEffect, useTransition } from 'react';
import * as Icons from 'lucide-react';
import { searchProfessionalsAction } from '@/actions/search';

interface PrecisoAgoraClientProps {
  categories: any[];
}

const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

export default function PrecisoAgoraClient({ categories }: PrecisoAgoraClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(true);
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
          console.warn('Geolocation failed or denied, using Jardim da Penha as default', err);
          setCoords({ lat: -20.2882, lng: -40.2989 });
          setLoadingCoords(false);
        }
      );
    } else {
      setCoords({ lat: -20.2882, lng: -40.2989 });
      setLoadingCoords(false);
    }
  }, []);

  const handleFetchEmergencyList = () => {
    if (!coords) return;
    setError(null);
    startTransition(async () => {
      // Emergency search radius is locked to 10 km
      const res = await searchProfessionalsAction({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: 10,
        categoryId: selectedCategoryId || null,
        onlyAvailableNow: true,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setProfessionals(res.data || []);
      }
    });
  };

  useEffect(() => {
    handleFetchEmergencyList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, selectedCategoryId]);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Intro Banner */}
      <section className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0 animate-pulse">
          <Icons.ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-400">Atendimento Imediato ("Preciso Agora")</h2>
          <p className="text-sm text-slate-400">
            Abaixo estão listados apenas os profissionais ativos que estão com status **Disponível Agora** em um raio de até 10 km.
          </p>
        </div>
      </section>

      {/* Manual Region Overrides */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-900">
        <span className="text-sm text-slate-300 font-semibold">Minha Localização</span>
        <select
          onChange={(e) => {
            const val = fallbackRegions[parseInt(e.target.value)];
            if (val) setCoords({ lat: val.lat, lng: val.lng });
          }}
          defaultValue=""
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-red-500"
        >
          <option value="" disabled>Alterar localização...</option>
          {fallbackRegions.map((region, idx) => (
            <option key={idx} value={idx}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category selector pills */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Filtrar por Categoria</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              !selectedCategoryId
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-red-500/40 hover:text-white'
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategoryId === c.id
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-red-500/40 hover:text-white'
              }`}
            >
              <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Feed */}
      {loadingCoords ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          <Icons.Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-red-500" />
          Obtendo localização...
        </div>
      ) : isPending ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          <Icons.Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-red-500" />
          Verificando profissionais disponíveis na área...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : professionals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-red-900/20 bg-red-950/5 p-16 text-center text-slate-500">
          <Icons.AlertTriangle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          Nenhum prestador ativo está "Disponível Agora" na sua região neste momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {professionals.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/30 border border-red-950/20 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/20 transition relative"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/40 border border-red-900/30 px-2.5 py-1 rounded-full">
                <Icons.Activity className="h-3 w-3 animate-pulse" /> Ativo
              </div>

              <div>
                {/* Header info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700 flex-shrink-0">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <Icons.User className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white leading-tight">{p.full_name}</h3>
                      {p.is_verified && (
                        <Icons.CheckCircle2 className="h-4 w-4 text-blue-400 fill-blue-950" title="Verificado" />
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mt-1 inline-block">
                      {p.category_name}
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                  {p.bio || 'Sem biografia disponível.'}
                </p>
              </div>

              <div>
                {/* Distance & Rating info */}
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mb-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Icons.MapPin className="h-4 w-4 text-slate-500" />
                    {(p.distance_meters / 1000).toFixed(1)} km de distância
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {p.avg_rating > 0 ? parseFloat(p.avg_rating).toFixed(1) : 'S/A'}
                  </span>
                </div>

                {/* Instant Emergency Booking Action */}
                <a
                  href={`https://wa.me/55${p.phone?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(
                    p.full_name
                  )},%20vi%20no%20Solução%20Já%20que%20você%20está%20disponível%20agora.%20Preciso%20de%20atendimento%20urgente%20de%20${encodeURIComponent(
                    p.category_name
                  )}%20hoje.%20Você%20está%20disponível?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-3 text-xs font-bold text-white shadow-lg hover:from-red-500 hover:to-orange-500 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-red-950/20"
                >
                  <Icons.PhoneCall className="h-4 w-4" /> Chamou, Resolveu no WhatsApp!
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
