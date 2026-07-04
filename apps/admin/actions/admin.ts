'use server';

import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyProfessionalAction(
  professionalId: string,
  status: 'approved' | 'rejected'
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Não autorizado' };
  }

  // 1. Verify user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Acesso restrito a administradores' };
  }

  // 2. Update professional verification status
  const isVerified = status === 'approved';

  const { error: updateError } = await (supabase.from('professionals') as any)
    .update({
      verification_status: status,
      is_verified: isVerified,
      updated_at: new Date().toISOString(),
    })
    .eq('id', professionalId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function createCategoryAction(
  name: string,
  slug: string,
  description: string | null,
  icon: string
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Não autorizado' };
  }

  // 1. Verify user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Acesso restrito a administradores' };
  }

  // 2. Insert new category
  const { error: insertError } = await (supabase.from('categories') as any)
    .insert({
      name,
      slug,
      description,
      icon,
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/');
  return { success: true };
}
