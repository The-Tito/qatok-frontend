import type { Metadata } from 'next';
import { StateCard } from '../../../../components/StateCard';

export const metadata: Metadata = { title: 'Simulaciones · Admin' };

// Marcador hasta el issue 6.1 (Simulaciones de admin).
export default function AdminSimulationsPage() {
  return (
    <StateCard kind="empty" title="Simulaciones" message="Esta pantalla llega en el issue 6.1." />
  );
}
