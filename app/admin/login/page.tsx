"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Handle redirect result
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Get the token
          const token = await result.user.getIdToken();

          // Store token in cookie
          document.cookie = `firebase-token=${token}; path=/`;

          setIsRedirecting(true);
          router.push("/admin");
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Falha na autenticação");
      }
    };

    if (!loading && !user) {
      handleAuth();
    }
  }, [loading, router, user]);

  // Handle existing user
  useEffect(() => {
    const setToken = async () => {
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/`;
        setIsRedirecting(true);
        router.push("/admin");
      }
    };

    setToken();
  }, [user, router]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Erro ao iniciar autenticação. Por favor, tente novamente.");
      setIsRedirecting(false);
    }
  };

  // Show loading state
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            {isRedirecting ? "Redirecionando..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={signInWithGoogle}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
