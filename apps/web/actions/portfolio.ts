'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addPortfolioImage(url: string, title?: string | null) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // Enforce a maximum of 10 portfolio images per professional
  const { count, error: countError } = await supabase
    .from('portfolio_images')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', user.id);

  const maxPhotos = 20;

  if (count && count >= maxPhotos) {
    return {
      error: `Limite de fotos atingido. Você pode cadastrar no máximo ${maxPhotos} fotos no seu portfólio.`
    };
  }

  const { error } = await supabase.from('portfolio_images').insert({
    professional_id: user.id,
    image_url: url,
    title: title || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/portfolio');
  return { success: true };
}

export async function deletePortfolioImage(id: string) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Não autorizado' };
  }

  // 1. Get image to know its storage filename if needed (optionally delete from Storage bucket too,
  // but standard RLS delete policy allows client-side storage delete or we do DB delete first).
  // For simplicity, we delete the DB reference, and the professional can delete the storage file directly,
  // or we just delete the database record which is the main record.
  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .eq('id', id)
    .eq('professional_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/portfolio');
  return { success: true };
}
