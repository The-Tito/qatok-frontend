import type { Metadata } from 'next';
import { ProfileView } from './profile-view';
import './profile.css';

export const metadata: Metadata = { title: 'Perfil' };

export default function ProfilePage() {
  return <ProfileView />;
}
