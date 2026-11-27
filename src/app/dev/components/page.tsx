import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentGallery } from './component-gallery';

export const metadata: Metadata = { title: 'Componentes' };

/** Página de muestra de componentes (01 · Componentes). Solo existe en desarrollo. */
export default function ComponentsPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ComponentGallery />;
}
