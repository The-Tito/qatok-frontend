'use client';

import type { Account } from '@qatok/shared';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { getMe } from '../lib/api';
import { LOGIN_PATH, homeFor, loginUrl } from '../lib/routes';
import { endedBySignOut, updateSessionUser } from '../lib/session';
import { useSession } from '../lib/use-session';
import { LoadingCard, StateCard } from './StateCard';

interface RequireSessionProps {
  /** Rol exigido. Sin rol, basta con tener sesión. */
  role?: Account['role'];
  children: ReactNode;
}

/**
 * Guarda de experiencia de usuario (03 · Sesión): sin sesión lleva a entrar; con otro rol
 * muestra el estado 403. La seguridad real la aplica la API.
 */
export function RequireSession({ role, children }: RequireSessionProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Refresca los datos del usuario una vez por carga; un 401 cierra la sesión en request().
  const me = useQuery({
    queryKey: ['me', session?.user.id],
    queryFn: ({ signal }) => getMe(signal),
    enabled: Boolean(session),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (me.data && session && JSON.stringify(me.data) !== JSON.stringify(session.user)) {
      updateSessionUser(me.data);
    }
  }, [me.data, session]);

  useEffect(() => {
    if (session === null) {
      if (endedBySignOut()) {
        router.replace(LOGIN_PATH);
        return;
      }
      const query = searchParams.toString();
      router.replace(loginUrl(query ? `${pathname}?${query}` : pathname));
    }
  }, [session, router, pathname, searchParams]);

  if (!session) {
    return <LoadingCard />;
  }

  if (role && session.user.role !== role) {
    return (
      <StateCard
        kind="forbidden"
        title={
          role === 'ADMIN' ? 'Esta zona es para administración' : 'Esta zona es para estudiantes'
        }
        message="Tu cuenta no tiene permiso para ver esta página."
        action={{ label: 'Ir a mi inicio', href: homeFor(session.user.role) }}
      />
    );
  }

  return children;
}
