import type { Metadata } from 'next';
import { SkillsView } from './skills-view';

export const metadata: Metadata = { title: 'Habilidades · Admin' };

export default function AdminSkillsPage() {
  return <SkillsView />;
}
