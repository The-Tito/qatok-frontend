import { Suspense, type ReactNode } from 'react';
import { RequireSession } from '../../components/RequireSession';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireSession role="STUDENT">{children}</RequireSession>
    </Suspense>
  );
}
