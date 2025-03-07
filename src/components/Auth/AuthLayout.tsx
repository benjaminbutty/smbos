import React from 'react';
import { Command } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-800 mb-4">
            <Command className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Sign in to access your workspace</p>
        </div>
        {children}
      </div>
    </div>
  );
}