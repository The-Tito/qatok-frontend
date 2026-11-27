import type { Metadata } from 'next';
import '../profile.css';
import '../profile-pages.css';
import { RecommendationsView } from './recommendations-view';

export const metadata: Metadata = { title: 'Recomendaciones' };

export default function RecommendationsPage() {
  return <RecommendationsView />;
}
