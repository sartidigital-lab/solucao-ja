import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Solução Já — Chamou, resolveu.',
    template: '%s | Solução Já',
  },
  description:
    'Marketplace regional de serviços na Grande Vitória/ES. Encontre manicures, eletricistas, diaristas e mais perto de você. Rápido, confiável, local.',
  keywords: ['serviços', 'Grande Vitória', 'profissionais', 'manicure', 'eletricista', 'diarista', 'Vila Velha', 'Vitória', 'Serra', 'Cariacica'],
  openGraph: {
    title: 'Solução Já — Chamou, resolveu.',
    description: 'Encontre profissionais de confiança perto de você na Grande Vitória/ES.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
