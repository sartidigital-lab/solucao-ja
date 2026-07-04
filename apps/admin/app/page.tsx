import React from 'react';
import { createClient } from '../lib/supabase/server';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Fetch user session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return <AdminLogin />;
  }

  // 2. Fetch user profile role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile as any).role !== 'admin') {
    // Access denied visual card
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl w-full max-w-sm text-center space-y-4">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full w-fit mx-auto">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Acesso Negado</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sua conta ({user.email}) não possui privilégios de administrador da plataforma Solução Já.
          </p>
          <form action="/api/auth/logout" method="POST" className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold rounded-xl transition"
            >
              Voltar para Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 3. Fetch categories and professionals lists
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  const { data: professionals } = await (supabase.from('professionals') as any)
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });

  return (
    <AdminDashboard
      categories={categories || []}
      professionals={professionals || []}
    />
  );
}
