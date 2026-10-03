import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZipBill Admin | Restaurant, Cafe & Hotel SaaS Control Center',
  description: 'Platform-level governance, tenant provisioning, approvals, subscriptions, and system monitoring.',
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
      <body className="bg-background text-main antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
