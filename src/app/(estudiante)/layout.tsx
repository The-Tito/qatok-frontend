import { Suspense, type ReactNode } from 'react';
import { RequireSession } from '../../components/RequireSession';
import { StudentShell } from '../../components/Shells';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireSession role="STUDENT">
        <StudentShell>{children}</StudentShell>
      </RequireSession>
    </Suspense>
  );
}
