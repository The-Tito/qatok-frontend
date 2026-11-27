import type { Metadata } from 'next';
import '../../perfil/profile.css';
import '../../perfil/partidas/attempts.css';
import '../evidence.css';
import { EvidenceDetailView } from './evidence-detail-view';

export const metadata: Metadata = { title: 'Evidencia' };

export default async function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ evidenceId: string }>;
}) {
  const { evidenceId } = await params;
  return <EvidenceDetailView evidenceId={evidenceId} />;
}
