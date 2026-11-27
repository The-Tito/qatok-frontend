'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingCard } from '../components/StateCard';
import { LOGIN_PATH, homeFor } from '../lib/routes';
import { useSession } from '../lib/use-session';

/** «/» redirige: sin sesión → entrar; estudiante → catálogo; admin → simulaciones de admin. */
export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === undefined) return;
    router.replace(session ? homeFor(session.user.role) : LOGIN_PATH);
  }, [session, router]);

  return <LoadingCard label="Entrando" />;
}
