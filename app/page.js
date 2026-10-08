'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const { login, register, user } = useAuth();
  const router = useRouter();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'member' });

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-brand-50/30 to-surface-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-elevated p-8 animate-slide-up">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900">EcoHub</h1>
              <p className="text-xs text-surface-500">Organization Finance Manager</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-surface-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            {mode === 'login'
              ? 'Sign in to access your organization dashboard.'
              : 'Join your organization on EcoHub.'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Alex Rivera"
                  value={form.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="input">
                  <option value="member">Member</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-surface-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-brand-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>

          {/* Demo credentials */}
          {mode === 'login' && (
            <div className="mt-6 pt-5 border-t border-surface-100">
              <p className="text-xs text-surface-400 mb-2 font-medium text-center">Demo Credentials</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Admin', email: 'admin@ecohub.dev' },
                  { label: 'Treasurer', email: 'treasurer@ecohub.dev' },
                  { label: 'Member', email: 'member1@ecohub.dev' },
                ].map(({ label, email }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setForm({ ...form, email, password: 'password123' })}
                    className="text-xs px-2 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-surface-600 border border-surface-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
