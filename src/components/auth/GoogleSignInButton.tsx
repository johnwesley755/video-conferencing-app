import React from 'react';
import { Button } from '../ui/button';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export const GoogleSignInButton: React.FC = () => {
  const { loginWithGoogle, authState } = useContext(AuthContext);
  
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Google sign-in error:', error);
    }
  };
  
  return (
    <Button
      variant="outline"
      type="button"
      disabled={authState.loading}
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="h-5 w-5" />
      <span>Sign in with Google</span>
    </Button>
  );
};