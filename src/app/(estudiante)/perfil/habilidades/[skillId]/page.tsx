import type { Metadata } from 'next';
import '../../profile.css';
import '../../profile-pages.css';
import { EvolutionView } from './evolution-view';

export const metadata: Metadata = { title: 'Evolución' };

export default async function EvolutionPage({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params;
  return <EvolutionView skillId={skillId} />;
}
