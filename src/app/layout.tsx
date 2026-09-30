import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Amm Café | Punto de Venta & Gestión',
  description: 'Sistema integral de Punto de Venta, Inventario, Costeador Inteligente, Dashboard y Control de Turnos para Amm Café (Pan, Café & Bocados).',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FAF8F5] text-amm-espresso antialiased flex flex-col selection:bg-amm-mauve selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
