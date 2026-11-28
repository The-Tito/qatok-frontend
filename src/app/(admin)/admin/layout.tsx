import { Suspense, type ReactNode } from 'react';
import { RequireSession } from '../../../components/RequireSession';
import { AdminShell } from '../../../components/Shells';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireSession role="ADMIN">
        <AdminShell>{children}</AdminShell>
      </RequireSession>
    </Suspense>
  );
}
