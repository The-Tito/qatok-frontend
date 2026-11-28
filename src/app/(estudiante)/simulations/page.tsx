import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogView } from './catalog-view';
import './catalog.css';

export const metadata: Metadata = { title: 'Simulaciones' };

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
