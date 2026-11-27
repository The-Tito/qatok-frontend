import type { Metadata } from 'next';
import { PlayView } from './play-view';
import './play.css';

export const metadata: Metadata = { title: 'Jugar' };

export default async function PlayPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <PlayView attemptId={attemptId} />;
}
