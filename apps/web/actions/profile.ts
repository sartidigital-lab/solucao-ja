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
