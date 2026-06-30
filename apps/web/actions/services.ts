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

  const { error } = await supabase.from('services').insert({
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

  const { error } = await supabase
    .from('services')
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

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('professional_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/servicos');
  return { success: true };
}
