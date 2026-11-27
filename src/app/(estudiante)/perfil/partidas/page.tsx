import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../profile.css';
import '../profile-pages.css';
import './attempts.css';
import { AttemptsView } from './attempts-view';

export const metadata: Metadata = { title: 'Mis partidas' };

export default function AttemptsPage() {
  return (
    <Suspense>
      <AttemptsView />
    </Suspense>
  );
}
