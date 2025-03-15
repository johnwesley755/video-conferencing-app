import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Header } from '../components/layout/Header';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};