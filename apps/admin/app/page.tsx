import React from 'react';
import { createClient } from '../lib/supabase/server';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { ShieldX, LogOut } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return <AdminLogin />;
  }

  async function handleLogout() {
    'use server';
    const supabaseClient = await createClient();
    await supabaseClient.auth.signOut();
  }

  if (user.app_metadata?.role !== 'admin') {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            background: 'var(--color-bg)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-error-light)',
              color: 'var(--color-error)',
              margin: '0 auto 1.25rem',
            }}
            aria-hidden="true"
          >
            <ShieldX style={{ width: 22, height: 22 }} />
          </span>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-ink)',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Acesso negado
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-muted)',
              margin: '0 auto 1.75rem',
              maxWidth: '32ch',
              lineHeight: 1.55,
            }}
          >
            A conta <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{user.email}</strong> não possui
            privilégios de administrador.
          </p>

          <form action={handleLogout}>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <LogOut style={{ width: 15, height: 15 }} aria-hidden="true" />
              Sair e voltar ao login
            </button>
          </form>
        </div>
      </main>
    );
  }

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
