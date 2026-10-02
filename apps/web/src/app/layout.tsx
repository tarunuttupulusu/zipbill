import './globals.css';
import { AppProvider } from '@/lib/state';
import { DynamicNavigation } from '@/components/layout/DynamicNavigation';

export const metadata = {
  title: 'ZipBill - Restaurant, Cafe & Hotel Billing & POS Platform',
  description: 'ZipBill is the high-performance multi-tenant billing, POS, KOT, and table management platform for restaurants, cafes, and hotels.',
  icons: {
    icon: '/brand/zipbill-receipt.jpg',
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
