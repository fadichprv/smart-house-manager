'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Home, Lock } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode') || '';
    setCode(oobCode);

    if (!oobCode) {
      setError('This reset link is missing a code. Please request a new password reset link.');
      setIsChecking(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .catch(() => {
        setError('This reset link is invalid or expired. Please request a new one.');
      })
      .finally(() => setIsChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, code, password);
      setMessage('Your password has been reset. Redirecting to sign in...');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Unable to reset password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
          <p className="text-slate-400 mt-1 text-center">Create a new password for your account.</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {isChecking ? (
            <p className="text-sm text-slate-400 text-center">Checking reset link...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                disabled={!code || !!message}
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                disabled={!code || !!message}
                required
                autoComplete="new-password"
              />

              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <p className="text-sm text-emerald-300">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading} disabled={!code || !!message}>
                Reset Password
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-slate-400 mt-6">
            Need another link?{' '}
            <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Request reset
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
