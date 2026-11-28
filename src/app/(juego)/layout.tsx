import { Suspense, type ReactNode } from 'react';
import { RequireSession } from '../../components/RequireSession';

/** Juego: con sesión de estudiante y sin menú principal (v2 · Web, «Jugar»). */
export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireSession role="STUDENT">{children}</RequireSession>
    </Suspense>
  );
}
