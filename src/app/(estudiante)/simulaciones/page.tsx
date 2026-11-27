import type { Metadata } from 'next';
import { StateCard } from '../../../components/StateCard';

export const metadata: Metadata = { title: 'Simulaciones' };

// Marcador hasta el issue 2.1 (Catálogo).
export default function CatalogPage() {
  return <StateCard kind="empty" title="Catálogo" message="Esta pantalla llega en el issue 2.1." />;
}
