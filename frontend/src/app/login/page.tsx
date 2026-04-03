"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/Navbar";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const router = useRouter();

  // 1. Handle the redirect result when coming back from Google
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Success! authContext will update 'user' and the next useEffect will redirect
          router.push("/admin");
        }
      } catch (err: any) {
        console.error("Redirect check failed:", err);
        setError(err.message);
      } finally {
        setCheckingRedirect(false);
      }
    };
    handleRedirect();
  }, [router]);

  // 2. Redirect if already logged in
  useEffect(() => {
    if (user && !checkingRedirect) {
      router.push("/admin");
    }
  }, [user, checkingRedirect, router]);

  const handleLogin = async () => {
    setSigningIn(true);
    setError("");
    try {
      await loginWithGoogle();
      // Redirect happens in useEffect
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar mode="admin" />
      
      <div className="login-container">
        <div className="login-card reveal">
          <div className="login-header">
            <h1 className="admin-title">Admin Login</h1>
            <p className="admin-subtitle">Secure access for Vaibhav Verma Photography Archive.</p>
          </div>

          {error && (
            <div className="admin-message error" style={{ marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <button 
            onClick={handleLogin} 
            className="admin-button google-btn"
            disabled={signingIn}
            style={{ width: "100%", margin: "0 auto" }}
          >
            {signingIn ? (
              "Connecting to Google..."
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: var(--bg);
          display: grid;
          place-items: center;
          padding: 20px;
        }
        .login-container {
          width: 100%;
          max-width: 420px;
          margin-top: -50px;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px;
          border-radius: 24px;
          text-align: center;
        }
        .login-header {
          margin-bottom: 32px;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #fff !important;
          color: #000 !important;
          font-weight: 500;
          letter-spacing: 0.5px;
          height: 48px;
        }
        .google-icon {
          flex-shrink: 0;
        }
        .login-footer {
          margin-top: 24px;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
