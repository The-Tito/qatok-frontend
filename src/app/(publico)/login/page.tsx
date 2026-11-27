import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthHero, AuthScreen } from '../auth-scene';
import '../auth.css';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <AuthScreen>
      <AuthHero />
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthScreen>
  );
}
