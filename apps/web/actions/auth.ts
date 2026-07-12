'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, clientRegisterSchema, professionalRegisterSchema } from 'shared';
import { redirect } from 'next/navigation';

export async function loginWithPassword(formData: unknown) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role
  const role = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
  if (role === 'admin') {
    redirect('/admin');
  } else if (role === 'professional') {
    redirect('/profissional');
  } else {
    redirect('/dashboard');
  }
}

export async function signUpClient(formData: unknown) {
  const result = clientRegisterSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { email, password, fullName, phone, city, bairro } = result.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        role: 'client',
        full_name: fullName,
        phone,
        city,
        bairro
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUpProfessional(formData: unknown) {
  const result = professionalRegisterSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Dados inválidos' };
  }

  const { email, password, fullName, phone, city, bairro, bio, cpfCnpj, category } = result.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        role: 'professional',
        full_name: fullName,
        phone,
        city,
        bairro,
        bio,
        cpf_cnpj: cpfCnpj,
        category
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    }
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url);
  }
}
