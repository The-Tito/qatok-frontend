import Link from 'next/link';
import { HealthPanel } from './health-panel';

export default function Home() {
  return (
    <main className="health-page">
      <header className="app-header">QATO&apos;K</header>
      <HealthPanel />
      <Link href="/login" className="health-login-link">
        Iniciar sesión
      </Link>
    </main>
  );
}
