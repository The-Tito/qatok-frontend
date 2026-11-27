import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HealthPanel } from './health-panel';

export const metadata: Metadata = {
  title: { absolute: "Estado de la API · QATO'K" },
};

export default function Home() {
  return (
    <main className="health-page">
      <header className="app-header">
        <Image src="/logo-texto.svg" alt="QATO'K" width={192} height={45} priority unoptimized />
      </header>
      <HealthPanel />
      <Link href="/login" className="health-login-link">
        Iniciar sesión
      </Link>
    </main>
  );
}
