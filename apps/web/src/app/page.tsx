'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';

export default function RootPage() {
  const router = useRouter();
  const { session } = useApp();

  useEffect(() => {
    if (session && session.userId && session.userId !== 'usr-owner-01') {
      router.replace('/dashboard');
    } else {
      router.replace('/register');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-secondary">Redirecting to login...</p>
      </div>
    </div>
  );
}
