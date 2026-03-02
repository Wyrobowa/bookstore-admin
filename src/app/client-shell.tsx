'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout, Box, Loader, Text } from 'tharaday';

import {
  authChangedEventName,
  authStorageKey,
  clearAuthSession,
  readAuthSession,
} from '@/lib/auth';

const PUBLIC_ROUTES = new Set(['/login']);

export default function ClientShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const syncUserFromStorage = useCallback(() => {
    const session = readAuthSession();
    setUserName(session?.user?.name ?? null);
  }, []);

  useEffect(() => {
    setHydrated(true);
    syncUserFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === authStorageKey) {
        syncUserFromStorage();
      }
    };

    const handleAuthChanged = () => {
      syncUserFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(authChangedEventName, handleAuthChanged);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(authChangedEventName, handleAuthChanged);
    };
  }, [syncUserFromStorage]);

  const normalizedPathname = useMemo(() => {
    return pathname.replace(/\/+$/, '') || '/';
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.has(normalizedPathname);
    const isAuthenticated = Boolean(readAuthSession()?.token);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }

    if (isAuthenticated && normalizedPathname === '/login') {
      router.replace('/');
    }
  }, [hydrated, normalizedPathname, router]);

  if (!hydrated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: '100vh' }}
        gap={4}
      >
        <Loader size="lg" />
        <Text color="subtle">Loading admin workspace...</Text>
      </Box>
    );
  }

  if (normalizedPathname === '/login') {
    return <>{children}</>;
  }

  const activeNavId =
    normalizedPathname === '/users'
      ? 'users'
      : normalizedPathname === '/books'
        ? 'books'
        : 'dashboard';

  return (
    <AppLayout
      headerTitle="Bookstore Admin"
      maxWidth="92%"
      user={userName ? { name: userName } : undefined}
      navItems={[
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users' },
        { id: 'books', label: 'Books' },
      ]}
      activeNavId={activeNavId}
      onNavItemClick={(id) => {
        if (id === 'dashboard') {
          router.push('/');
          return;
        }

        router.push(`/${id}`);
      }}
      onLogin={() => router.push('/login')}
      onLogout={() => {
        clearAuthSession();
        setUserName(null);
        router.push('/login');
      }}
    >
      {children}
    </AppLayout>
  );
}
