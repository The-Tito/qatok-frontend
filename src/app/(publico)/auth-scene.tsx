import Image from 'next/image';
import type { ReactNode } from 'react';
import { SoundToggle } from '../../components/SoundToggle';
import { Sparkle } from '../../components/Sprites';
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
 * Página de Entrar y Crear cuenta: contenido centrado (440 px) sobre una oficina animada,
 * estrellas que destellan con estrellas fugaces de vez en cuando, y botón de sonido.
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
      <OfficeScene />
      <div className="auth-sparkles" aria-hidden="true">
        <Sparkle color="#D9483B" size={21} className="auth-sparkle-1" />
        <Sparkle color="#8A5CC7" size={21} className="auth-sparkle-2" />
        <Sparkle color="#4FA35A" size={14} className="auth-sparkle-3" />
        <span className="auth-shooting auth-shooting-1">
          <Sparkle color="#E8A33D" size={18} />
        </span>
        <span className="auth-shooting auth-shooting-2">
          <Sparkle color="#8A5CC7" size={14} />
        </span>
      </div>
      <SoundToggle className="auth-sound" />
      <div className="auth-content">{children}</div>
      <div className="auth-ground" aria-hidden="true" />
    </main>
  );
}
