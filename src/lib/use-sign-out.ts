'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { LOGIN_PATH } from './routes';
import { clearSession } from './session';

/** «Salir»: borra la sesión, limpia la caché de consultas y va a entrar. No hay endpoint. */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useCallback(() => {
    clearSession({ signOut: true });
    queryClient.clear();
    router.replace(LOGIN_PATH);
  }, [queryClient, router]);
}
