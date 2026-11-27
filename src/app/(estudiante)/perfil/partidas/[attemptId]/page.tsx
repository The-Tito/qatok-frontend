import type { Metadata } from 'next';
import '../../profile.css';
import '../../profile-pages.css';
import '../attempts.css';
import { PathView } from './path-view';

export const metadata: Metadata = { title: 'Recorrido' };

export default async function PathPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <PathView attemptId={attemptId} />;
}
