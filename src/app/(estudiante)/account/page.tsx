import type { Metadata } from 'next';
import { AccountView } from './account-view';
import './account.css';

export const metadata: Metadata = { title: 'Mi cuenta' };

export default function AccountPage() {
  return <AccountView />;
}
