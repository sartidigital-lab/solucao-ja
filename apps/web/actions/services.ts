'use server';

import { createClient } from '@/lib/supabase/server';
import { serviceSchema } from 'shared';
import { revalidatePath } from 'next/cache';

export async function createService(formData: unknown) {
  const result = serviceSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { name, description, price, durationMinutes, categoryId } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Fetch professional plan
  const { data: professional } = await supabase
    .from('professionals')
    .select('subscription_plan')
    .eq('id', user.id)
    .single();

  const plan = professional ? (professional as any).subscription_plan : 'gratuito';

  // Count existing services
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', user.id);

  const existingCount = count || 0;

  if (plan === 'gratuito' && existingCount >= 3) {
    return { error: 'O plano Gratuito limita o cadastro a no máximo 3 serviços. Faça um upgrade para cadastrar serviços ilimitados.' };
  }

  const { error } = await (supabase.from('services') as any).insert({
    professional_id: user.id,
    category_id: categoryId,
    name,
    description,
    price,
    duration_minutes: durationMinutes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/servicos');
  return { success: true };
}

export async function updateService(id: string, formData: unknown) {
  const result = serviceSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { name, description, price, durationMinutes, categoryId } = result.data;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  const { error } = await (supabase.from('services') as any)
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      duration_minutes: durationMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('professional_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/servicos');
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  const { error } = await (supabase.from('services') as any)
    .delete()
    .eq('id', id)
    .eq('professional_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/servicos');
  return { success: true };
}
