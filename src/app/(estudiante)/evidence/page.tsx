import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../profile/profile.css';
import './evidence.css';
import { EvidenceListView } from './evidence-list-view';

export const metadata: Metadata = { title: 'Evidencias' };

export default function EvidenceListPage() {
  return (
    <Suspense>
      <EvidenceListView />
    </Suspense>
  );
}
