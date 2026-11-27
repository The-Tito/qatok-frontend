import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HealthPanel } from './health-panel';
import './health.css';

export const metadata: Metadata = { title: 'Estado de la API' };

/** Estado de las tres bases (GET /api/health). Página de apoyo, sin sesión. */
export default function HealthPage() {
  return (
    <main className="health-page">
      <header className="app-header">
        <Image src="/logo-texto.svg" alt="QATO'K" width={192} height={45} priority unoptimized />
      </header>
      <HealthPanel />
      <p className="health-back">
        <Link href="/entrar">Ir a entrar</Link>
      </p>
    </main>
  );
}
