'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MessageSquare, Users, AlertTriangle } from 'lucide-react';

interface ProfessionalsMapProps {
  professionals: any[];
  userCoords: { lat: number; lng: number } | null;
  onSelectProfessional?: (id: string) => void;
}

export default function ProfessionalsMap({
  professionals,
  userCoords,
  onSelectProfessional,
}: ProfessionalsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [apiKeyError, setApiKeyError] = useState(false);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Inicializar o mapa do Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        const center = userCoords || { lat: -20.2882, lng: -40.2989 }; // Jd. da Penha como default
        
        const map = new google.maps.Map(mapRef.current!, {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }], // Esconder pontos de interesse para o mapa ficar limpo
            },
          ],
        });

        // Janela única de popup (para abrir uma por vez)
        infoWindowRef.current = new google.maps.InfoWindow();

        setMapInstance(map);
      })
      .catch((err) => {
        console.error('Error loading Google Maps API:', err);
        setApiKeyError(true);
      });
  }, [userCoords]);

  // Atualizar centro do mapa quando as coordenadas do usuário mudarem
  useEffect(() => {
    if (mapInstance && userCoords) {
      mapInstance.setCenter(userCoords);
    }
  }, [mapInstance, userCoords]);

  // Expor função global para que o clique no InfoWindow (HTML String) interaja com o React
  useEffect(() => {
    if (onSelectProfessional) {
      (window as any).viewProfessionalProfileFromMap = (id: string) => {
        onSelectProfessional(id);
      };
    }
    return () => {
      delete (window as any).viewProfessionalProfileFromMap;
    };
  }, [onSelectProfessional]);

  // Atualizar pins dos profissionais no mapa
  useEffect(() => {
    if (!mapInstance) return;

    // 1. Limpar pins antigos
    markers.forEach((m) => m.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];

    // 2. Renderizar marcador de localização do próprio usuário
    if (userCoords) {
      const userMarker = new google.maps.Marker({
        position: userCoords,
        map: mapInstance,
        title: 'Sua Localização',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#0066cc',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      newMarkers.push(userMarker);
    }

    // 3. Renderizar pins dos profissionais
    professionals.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const isDestaque = p.subscription_plan === 'destaque';
      const position = { lat: p.latitude, lng: p.longitude };

      // Cores semânticas do design system: coral para destaque, azul marinho/ink para normal
      const pinColor = isDestaque ? '#FF5A5F' : '#1A2E40'; 

      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: p.full_name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: pinColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        },
      });

      // Configurar Popup InfoWindow ao clicar no Pin
      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;

        const avatarHtml = p.avatar_url
          ? `<img src="${p.avatar_url}" alt="${p.full_name}" class="w-full h-full object-cover" />`
          : `<span>${(p.full_name || '?')[0].toUpperCase()}</span>`;

        const starRatingHtml = p.avg_rating > 0
          ? `<strong class="text-ink">${parseFloat(p.avg_rating).toFixed(1)}</strong> (${p.total_reviews})`
          : `Novo`;

        const badgeHtml = isDestaque
          ? `<span class="bg-amber-500 text-white text-xs font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">★ Destaque</span>`
          : ``;

        const whatsappHref = p.phone
          ? `https://wa.me/55${p.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.full_name)}%2C%20vi%20seu%20perfil%20no%20mapa%20do%20Solução%20Já.`
          : '';

        const verifyBadgeHtml = p.is_verified
          ? `<span class="bg-info text-white w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-xs font-bold">✓</span>`
          : '';

        // Template HTML do Popup usando classes Tailwind compiladas globalmente
        const contentString = `
          <div class="font-sans p-1 max-w-[240px] text-ink">
            <div class="flex gap-2.5 items-start mb-2">
              <div class="w-10 h-10 rounded-full bg-primary-light text-primary-dark font-bold text-sm flex items-center justify-center overflow-hidden border border-primary/10 shrink-0">
                ${avatarHtml}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="m-0 text-xs font-bold truncate">${p.full_name}</h4>
                  ${verifyBadgeHtml}
                </div>
                <span class="text-xs font-bold text-primary mt-0.5 block">${p.category_name}</span>
              </div>
            </div>
            
            <p class="m-0 mb-2 text-xs text-muted line-clamp-2 italic">
              "${p.bio || 'Profissional atuante na Grande Vitória.'}"
            </p>

            <div class="flex justify-between items-center text-xs text-muted mb-2.5 border-t border-border pt-1.5">
              <span>📍 ${(p.distance_meters / 1000).toFixed(1)} km</span>
              <span class="ml-auto flex items-center gap-0.5">⭐ ${starRatingHtml}</span>
            </div>

            <div class="flex gap-1.5">
              <button 
                onclick="window.viewProfessionalProfileFromMap('${p.id}')"
                class="flex-1 bg-surface border border-border text-ink py-1 px-2 text-xs font-bold rounded-lg cursor-pointer text-center hover:bg-surface-2 transition-colors"
              >
                Ver Serviços
              </button>
              ${whatsappHref ? `
                <a 
                  href="${whatsappHref}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="bg-[#25D366] hover:bg-[#20ba59] text-white py-1 px-2.5 text-xs font-bold rounded-lg cursor-pointer no-underline inline-flex items-center justify-center transition-colors"
                >
                  WhatsApp
                </a>
              ` : ''}
            </div>
            <div class="mt-1.5 text-center">
              ${badgeHtml}
            </div>
          </div>
        `;

        infoWindowRef.current!.setContent(contentString);
        infoWindowRef.current!.open(mapInstance, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [mapInstance, professionals, userCoords]);

  if (apiKeyError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-error-light border border-dashed border-error/20 rounded-xl shadow-2xs w-full h-[500px]">
        <span className="p-3 bg-white rounded-full mb-4 text-error border border-error/15">
          <AlertTriangle className="w-6 h-6" />
        </span>
        <h3 className="text-sm font-bold text-error mb-1">Erro ao carregar o Mapa</h3>
        <p className="text-xs text-muted max-w-[280px]">
          Não foi possível carregar a API do Google Maps. Verifique suas chaves de API e conexão de internet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted bg-surface px-4 py-2 rounded-lg border border-border/80">
        <span className="flex items-center gap-1 font-semibold text-muted">
          <Users className="w-4 h-4 text-primary" />
          Pins vermelhos: profissionais normais · Pins corais: destaques
        </span>
        <span>Pins azuis: você</span>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-2xs"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
