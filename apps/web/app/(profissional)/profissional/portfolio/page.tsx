import { createClient } from '@/lib/supabase/server';
import PortfolioManager from './PortfolioManager';

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // Fetch professional's portfolio images
  const { data: images } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
        Meu Portfólio
      </h1>
      <p className="text-slate-400 mb-8 text-sm">
        Faça o upload de até 10 fotos dos seus melhores trabalhos para atrair clientes.
      </p>
      <PortfolioManager initialImages={images || []} userId={user.id} />
    </div>
  );
}
