'use server';

import { createClient } from '@/lib/supabase/server';

export interface SearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  categoryId?: string | null;
  query?: string | null;
  onlyAvailableNow?: boolean;
}

export async function searchProfessionalsAction(params: SearchParams) {
  const supabase = await createClient();
  
  const maxRadiusMeters = params.radiusKm * 1000;

  const { data, error } = await (supabase as any).rpc('search_professionals', {
    client_lat: params.lat,
    client_lng: params.lng,
    max_radius_meters: maxRadiusMeters,
    search_category_id: params.categoryId || null,
    search_query: params.query || null,
    only_available_now: params.onlyAvailableNow || false
  });

  if (error) {
    console.error('Error calling search_professionals RPC:', error);
    return { error: error.message };
  }

  return { success: true, data: data || [] };
}
