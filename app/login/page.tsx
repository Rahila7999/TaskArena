'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { AuthHeader } from '@/app/components/auth/auth-header';
import { SocialAuthButtons } from '@/app/components/auth/social-auth-buttons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccessDenied' || errorParam === 'OAuthAccountNotLinked') {
      return 'Account access denied: This email is registered with a different login method. Please sign in with your email and password.';
    }
    if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback') {
      return 'OAuth service error. Please check your credentials or try again later.';
    }
    return null;
  });
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotPasswordNotice(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setForgotPasswordNotice(false);
    setLoadingProvider(provider);

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      await signIn(provider, { callbackUrl });
    } catch {
      setErrorMessage(`Failed to initiate ${provider} login. Please try again.`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <AuthHeader
          title="Welcome Back, Warrior"
          subtitle="Log in to claim your streak, gain XP, and tackle today's quests."
        />

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Forgot password notice */}
        {forgotPasswordNotice && (
          <div
            role="status"
            className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs leading-relaxed"
          >
            ℹ️ Password reset will be available soon. For now, please contact your team admin or register a new account.
          </div>
        )}

        {/* Social Logins */}
        <SocialAuthButtons
          onSignIn={handleSocialSignIn}
          loadingProvider={loadingProvider}
          disabled={isSubmitting}
        />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              or continue with email
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="warrior@taskarena.com"
                disabled={isSubmitting || loadingProvider !== null}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordNotice(true)}
                className="text-xs text-blue-500 hover:text-blue-400 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting || loadingProvider !== null}
                className="w-full pl-10 pr-11 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 bg-muted/60"
            />
            <label htmlFor="remember-me" className="ml-2.5 text-xs text-muted-foreground select-none">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loadingProvider !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entering Arena...</span>
              </>
            ) : (
              <span>Enter the Arena</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have a TaskArena account?{' '}
          <Link
            href="/register"
            className="text-blue-500 hover:text-blue-400 font-semibold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

