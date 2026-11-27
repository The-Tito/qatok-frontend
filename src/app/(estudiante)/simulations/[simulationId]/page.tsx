import type { Metadata } from 'next';
import { SimulationView } from './simulation-view';
import './simulation.css';

export const metadata: Metadata = { title: 'Antes de jugar' };

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = await params;
  return <SimulationView simulationId={simulationId} />;
}
