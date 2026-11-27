'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError, setUnauthorizedHandler } from '../lib/api';
import { LOGIN_PATH, loginUrl } from '../lib/routes';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Un solo reintento y nunca ante 4xx (03 · Cliente).
        retry: (failureCount, error) =>
          failureCount < 1 &&
          !(error instanceof ApiError && error.status >= 400 && error.status < 500),
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Un 401 con sesión: request() ya borró la sesión; aquí se limpia la caché y se va a entrar.
    setUnauthorizedHandler(() => {
      queryClient.clear();
      if (pathRef.current === LOGIN_PATH) return;
      const current = `${pathRef.current}${window.location.search}`;
      router.replace(loginUrl(current));
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
