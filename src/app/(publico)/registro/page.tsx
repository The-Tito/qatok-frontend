import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Sparkle } from '../../../components/Sprites';
import { LOGIN_PATH } from '../../../lib/routes';
import { AuthScreen } from '../auth-scene';
import '../auth.css';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegisterPage() {
  return (
    <AuthScreen compact>
      <div className="auth-back-row">
        <Link href={LOGIN_PATH} className="auth-back" aria-label="Volver a entrar">
          ◀
        </Link>
        <span className="auth-form-tag">Nueva partida</span>
      </div>
      <div className="auth-intro">
        <div className="auth-back-row">
          <h1 className="auth-title">Crea tu cuenta</h1>
          <Sparkle color="#E8A33D" size={22} />
        </div>
        <p>Tu progreso y tus evidencias quedan guardados en tu perfil.</p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link href={LOGIN_PATH}>Entrar</Link>
      </p>
    </AuthScreen>
  );
}
