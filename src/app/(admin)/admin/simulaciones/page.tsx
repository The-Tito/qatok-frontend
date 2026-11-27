import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SimulationsView } from './simulations-view';

export const metadata: Metadata = { title: 'Simulaciones · Admin' };

export default function AdminSimulationsPage() {
  return (
    <Suspense>
      <SimulationsView />
    </Suspense>
  );
}
