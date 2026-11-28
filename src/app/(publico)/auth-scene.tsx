import Image from 'next/image';
import type { ReactNode } from 'react';
import { SoundToggle } from '../../components/SoundToggle';
import { OfficeBackdrop } from './office-backdrop';
import { OfficeScene } from './office-scene';

/** Encabezado de Entrar: logo en caja, nombre y descripción (LoginV2 y LoginWeb). */
export function AuthHero() {
  return (
    <div className="auth-hero">
      <span className="auth-logo">
        <Image src="/logo.svg" alt="" width={64} height={64} unoptimized priority />
      </span>
      <h1 className="auth-brand">QATO&apos;K</h1>
      <p className="auth-description">
        Practica decisiones del trabajo, mira sus consecuencias y sube de nivel tus habilidades.
      </p>
    </div>
  );
}

/**
 * Página de Entrar y Crear cuenta: tarjeta centrada sobre una oficina pixel art animada
 * (compañeros trabajando y una plática que se vuelve discusión) y botón de sonido.
 */
export function AuthScreen({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <main className="auth-screen" data-compact={compact || undefined}>
      <div className="office" aria-hidden="true">
        <OfficeBackdrop />
        <OfficeScene />
      </div>
      <SoundToggle className="auth-sound" />
      <div className="auth-content">{children}</div>
    </main>
  );
}
