import './globals.css';

export const metadata = {
  title: 'Solução Já',
  description: 'Chamou, resolveu.',
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
