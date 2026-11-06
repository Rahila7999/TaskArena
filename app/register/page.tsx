'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { AuthHeader } from '@/app/components/auth/auth-header';
import { SocialAuthButtons } from '@/app/components/auth/social-auth-buttons';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return 'All fields are required.';
    }

    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call Registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrorMessage('An account with this email already exists. Please log in instead.');
        } else {
          setErrorMessage(data.message || 'Registration failed. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // 2. Registration Successful -> Auto Login
      setSuccessMessage('Account created successfully! Logging you in...');

      const loginResult = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginResult?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      } else {
        // Fallback: If auto-login fails, redirect to /login
        router.push('/login?registered=true');
      }
    } catch {
      setErrorMessage('A network error occurred during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setLoadingProvider(provider);

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      await signIn(provider, { callbackUrl });
    } catch {
      setErrorMessage(`Failed to initiate ${provider} registration. Please try again.`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <AuthHeader
          title="Create Your Account"
          subtitle="Join TaskArena to conquer workplace tasks, gain XP, and climb the leaderboard."
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

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-in fade-in duration-200"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-snug">{successMessage}</div>
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
              or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                disabled={isSubmitting || loadingProvider !== null}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Work Email Address
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
                placeholder="alex@company.com"
                disabled={isSubmitting || loadingProvider !== null}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting || loadingProvider !== null}
                className="w-full pl-10 pr-11 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loadingProvider !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:from-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-400 font-semibold hover:underline transition-colors"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}

