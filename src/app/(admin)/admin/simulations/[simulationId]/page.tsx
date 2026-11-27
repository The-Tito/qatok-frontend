import type { Metadata } from 'next';
import { SimulationAdminView } from './simulation-admin-view';

export const metadata: Metadata = { title: 'Simulación · Admin' };

export default async function SimulationAdminPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = await params;
  return <SimulationAdminView simulationId={simulationId} />;
}
