'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/state';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, setSession, setProfile, setBusinessType, setCurrentTenant } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const syncInProgress = useRef(false);

  useEffect(() => {
    async function processUser(authUser: any) {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      try {
        const userEmail = authUser.email || '';
        const userName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          userEmail.split('@')[0] ||
          'Restaurant Owner';

        // Synchronize with PostgreSQL database to create or retrieve clean workspace
        const res = await fetch('/api/auth/oauth-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authUser.id,
            email: userEmail,
            fullName: userName,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize restaurant workspace.');
        }

        const activeTenant = data.tenant;
        const activeProfile = data.profile;
        const dbUser = data.user;

        if (activeProfile) {
          setProfile(activeProfile);
        } else if (activeTenant) {
          setProfile({
            id: `prof-${activeTenant.id}`,
            tenantId: activeTenant.id,
            businessName: activeTenant.name,
            phone: '',
            email: userEmail,
            city: '',
            state: '',
            address: '',
            country: 'IN',
            currencyCode: 'INR',
            currencySymbol: '₹',
            timezone: 'Asia/Kolkata',
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (activeTenant) {
          setCurrentTenant(activeTenant);
          try {
            localStorage.setItem('saas_active_tenant', JSON.stringify(activeTenant));
          } catch {}
        }

        if (activeTenant?.businessType) {
          setBusinessType(activeTenant.businessType);
        }

        setSession({
          ...session,
          userId: authUser.id,
          tenantId: activeTenant?.id || dbUser?.tenantId || '',
          email: userEmail,
          fullName: dbUser?.fullName || userName,
          roleName: 'OWNER',
          permissions: ['*'],
        });

        if (activeTenant?.slug) {
          router.replace(`/${activeTenant.slug}/dashboard`);
        } else {
          router.replace('/dashboard');
        }
      } catch (err: any) {
        console.error('OAuth sync error:', err);
        setErrorMsg(err.message || 'Authentication callback failed');
        syncInProgress.current = false;
      }
    }

    async function handleAuth() {
      try {
        const {
          data: { session: supaSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (supaSession?.user) {
          await processUser(supaSession.user);
        } else {
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, authSession) => {
              if (authSession?.user) {
                await processUser(authSession.user);
              }
            }
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication callback failed');
      }
    }

    handleAuth();
  }, [router, session, setSession, setProfile, setBusinessType]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-heading">Authentication Failed</h2>
          <p className="text-sm text-secondary">{errorMsg}</p>
          <a href="/login" className="btn-primary inline-block px-4 py-2 mt-2">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <h2 className="text-lg font-semibold text-heading">Setting Up Workspace...</h2>
      <p className="text-sm text-muted">Configuring your clean restaurant database</p>
    </div>
  );
}
