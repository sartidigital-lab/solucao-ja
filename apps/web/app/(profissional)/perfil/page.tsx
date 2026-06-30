import { createClient } from '@/lib/supabase/server';
import ProfessionalProfileForm from './ProfessionalProfileForm';

export default async function ProfessionalProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Carregando...</div>;
  }

  // Fetch from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch from professionals
  const { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
        Configurações do Perfil Profissional
      </h1>
      <ProfessionalProfileForm profile={profile} professional={professional} />
    </div>
  );
}
