import React, { useState } from 'react';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <AuthLayout>
      <AuthForm
        mode={mode}
        onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      />
    </AuthLayout>
  );
}