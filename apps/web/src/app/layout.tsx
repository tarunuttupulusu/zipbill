import './globals.css';
import { AppProvider } from '@/lib/state';
import { DynamicNavigation } from '@/components/layout/DynamicNavigation';

export const metadata = {
  title: 'ZipBill - Restaurant, Cafe & Hotel Billing & POS Platform',
  description: 'ZipBill is the high-performance multi-tenant billing, POS, KOT, and table management platform for restaurants, cafes, and hotels.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-main antialiased">
        <AppProvider>
          <DynamicNavigation>{children}</DynamicNavigation>
        </AppProvider>
      </body>
    </html>
  );
}
