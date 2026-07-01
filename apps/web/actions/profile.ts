'use server';

import { createClient } from '@/lib/supabase/server';
import { clientProfileSchema, professionalProfileSchema } from 'shared';
import { revalidatePath } from 'next/cache';

export async function updateClientProfile(formData: unknown) {
  const result = clientProfileSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { fullName, phone, city, bairro } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  const { error } = await (supabase.from('profiles') as any)
    .update({
      full_name: fullName,
      phone,
      city,
      bairro,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/perfil');
  return { success: true };
}

async function geocodeAddress(city: string, bairro: string): Promise<{ lat: number; lng: number }> {
  const query = `${bairro}, ${city}, ES, Brazil`;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
    } catch (e) {
      console.error('Error calling Google Geocoding API, using fallback:', e);
    }
  }

  // Fallback lookup dictionary for Grande Vitória
  const normalizedCity = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedBairro = bairro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const fallbacks: Record<string, Record<string, { lat: number; lng: number }>> = {
    vitoria: {
      'jardim da penha': { lat: -20.2882, lng: -40.2989 },
      'praia do canto': { lat: -20.2995, lng: -40.2952 },
      'jardim camburi': { lat: -20.2642, lng: -40.2711 },
      'centro': { lat: -20.3201, lng: -40.3392 },
      'default': { lat: -20.3155, lng: -40.3128 }
    },
    'vila velha': {
      'itapua': { lat: -20.3421, lng: -40.2902 },
      'praia da costa': { lat: -20.3299, lng: -40.2862 },
      'coqueiral de itaparica': { lat: -20.3541, lng: -40.3092 },
      'gloria': { lat: -20.3198, lng: -40.3061 },
      'default': { lat: -20.3292, lng: -40.2917 }
    },
    serra: {
      'laranjeiras': { lat: -20.1989, lng: -40.2582 },
      'jacaraipe': { lat: -20.1558, lng: -40.1921 },
      'manguinhos': { lat: -20.1772, lng: -40.2198 },
      'carapina': { lat: -20.2312, lng: -40.2699 },
      'default': { lat: -20.1242, lng: -40.3078 }
    },
    cariacica: {
      'campo grande': { lat: -20.3391, lng: -40.3831 },
      'itaciba': { lat: -20.3278, lng: -40.3732 },
      'jardim america': { lat: -20.3242, lng: -40.3542 },
      'default': { lat: -20.3411, lng: -40.4200 }
    },
    viana: {
      'marcilio de noronha': { lat: -20.3582, lng: -40.4299 },
      'default': { lat: -20.3908, lng: -40.4958 }
    }
  };

  const cityData = fallbacks[normalizedCity] || fallbacks[Object.keys(fallbacks).find(k => normalizedCity.includes(k)) || 'vitoria'];
  const coords = cityData[normalizedBairro] || cityData[Object.keys(cityData).find(k => normalizedBairro.includes(k)) || 'default'];

  return coords;
}

export async function updateProfessionalProfile(formData: unknown) {
  const result = professionalProfileSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { fullName, phone, city, bairro, bio, cpfCnpj, attendanceType, serviceAreaRadiusKm, isAvailableNow } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Geocode location
  const { lat, lng } = await geocodeAddress(city, bairro);
  const locationString = `POINT(${lng} ${lat})`;

  // 1. Update public.profiles
  const { error: profileError } = await (supabase.from('profiles') as any)
    .update({
      full_name: fullName,
      phone,
      city,
      bairro,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // 2. Update public.professionals
  const { error: professionalError } = await (supabase.from('professionals') as any)
    .update({
      bio,
      cpf_cnpj: cpfCnpj,
      location: locationString,
      attendance_type: attendanceType,
      service_area_radius_km: serviceAreaRadiusKm,
      is_available_now: isAvailableNow,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (professionalError) {
    return { error: professionalError.message };
  }

  revalidatePath('/perfil');
  return { success: true };
}

