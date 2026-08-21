'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Authentication failed');
      }

      const data = await res.json();

      // Store token
      if (data.access_token) {
        localStorage.setItem('moyvakil_token', data.access_token);
        localStorage.setItem('moyvakil_user', JSON.stringify(data.user));
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    uz: { login: 'Kirish', register: "Ro'yxatdan o'tish", email: 'Elektron pochta', password: 'Parol', name: 'Ism', loginBtn: 'Tizimga kirish', registerBtn: "Ro'yxatdan o'tish", noAccount: "Hisobingiz yo'qmi?", hasAccount: 'Hisobingiz bormi?' },
    ru: { login: 'Войти', register: 'Регистрация', email: 'Электронная почта', password: 'Пароль', name: 'Имя', loginBtn: 'Войти в систему', registerBtn: 'Зарегистрироваться', noAccount: 'Нет аккаунта?', hasAccount: 'Уже есть аккаунт?' },
    en: { login: 'Login', register: 'Register', email: 'Email', password: 'Password', name: 'Name', loginBtn: 'Sign In', registerBtn: 'Sign Up', noAccount: "Don't have an account?", hasAccount: 'Already have an account?' },
  }['ru'];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Scale className="h-10 w-10 text-secondary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-text">
              {mode === 'login' ? t.login : t.register}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-text mb-1 block">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text mb-1 block">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text mb-1 block">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={8} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === 'login' ? t.loginBtn : t.registerBtn}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-secondary font-medium hover:underline"
            >
              {mode === 'login' ? t.registerBtn : t.loginBtn}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
