"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticatedViaCookie } from '@/lib/cookies';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      // First check if we have a valid cookie
      const hasValidCookie = isAuthenticatedViaCookie();
      
      if (hasValidCookie) {
        setIsCheckingAuth(false);
        return;
      }
      
      // If no valid cookie and Firebase auth is not loaded yet, wait
      if (loading) {
        return;
      }
      
      // If no valid cookie and no Firebase user, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [loading, isAuthenticated, router]);

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthenticatedViaCookie()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
