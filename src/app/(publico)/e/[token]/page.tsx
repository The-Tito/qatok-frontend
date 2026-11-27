import type { Metadata } from 'next';
import { PublicEvidenceView } from './public-evidence-view';
import './public.css';

export const metadata: Metadata = {
  title: 'Evidencia compartida',
  // Enlaces privados por diseño: que no los indexen los buscadores.
  robots: { index: false, follow: false },
};

export default async function PublicEvidencePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicEvidenceView token={token} />;
}
