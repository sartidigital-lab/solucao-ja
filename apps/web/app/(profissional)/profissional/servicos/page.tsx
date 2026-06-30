import { createClient } from '@/lib/supabase/server';
import ServicesManager from './ServicesManager';

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // 2. Fetch professional services
  const { data: services } = await supabase
    .from('services')
    .select('*, categories (name)')
    .eq('professional_id', user.id)
    .order('name');

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
        Catálogo de Serviços
      </h1>
      <ServicesManager initialServices={services || []} categories={categories || []} />
    </div>
  );
}
