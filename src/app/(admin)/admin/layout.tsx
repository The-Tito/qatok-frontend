import { Suspense, type ReactNode } from 'react';
import { RequireSession } from '../../../components/RequireSession';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireSession role="ADMIN">{children}</RequireSession>
    </Suspense>
  );
}
