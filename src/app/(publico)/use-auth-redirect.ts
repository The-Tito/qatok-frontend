'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { afterLogin } from '../../lib/routes';
import type { SavedSession } from '../../lib/session';
import { useSession } from '../../lib/use-session';

/**
 * Entrar y Crear cuenta: con sesión, lleva a la ruta de regreso (?next) o al inicio del rol.
 * Devuelve la sesión y la función para ir a donde toca tras entrar.
 */
export function useAuthRedirect() {
  const session = useSession();
  const router = useRouter();
  const next = useSearchParams().get('next');

  useEffect(() => {
    if (session) router.replace(afterLogin(session.user.role, next));
  }, [session, router, next]);

  return {
    session,
    next,
    goHome: (saved: SavedSession) => router.replace(afterLogin(saved.user.role, next)),
  };
}
