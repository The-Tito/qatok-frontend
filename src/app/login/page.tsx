import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginPanel } from './login-panel';
import './login.css';

export const metadata: Metadata = {
  title: "Iniciar sesión · QATO'K",
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <header className="login-intro">
        <p className="login-brand">QATO&apos;K</p>
        <p className="login-description">
          Practica decisiones del trabajo, mira sus consecuencias y sube de nivel tus habilidades.
        </p>
      </header>
      <LoginPanel />
      <div className="login-scene" aria-hidden="true">
        <Image src="/sprites/student.svg" alt="" width={64} height={64} />
      </div>
    </main>
  );
}
