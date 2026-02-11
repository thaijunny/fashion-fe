'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const GOOGLE_CLIENT_ID = '725448588950-b3mdsmnqj8tj9ttam14c0ajhjk7d4b3j.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, googleLogin, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: isLogin ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'center',
        }
      );
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [isLogin]);

  const handleGoogleCallback = async (response: any) => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin(response.credential);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Vui lòng nhập họ tên');
          setIsLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#e60012 1px, transparent 1px), linear-gradient(90deg, #e60012 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#e60012]/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#f0ff00]/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-white">UNTYPED</span>
              <span className="text-[#e60012]"> CLOTHING</span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-[#2a2a2a] p-8 rounded-sm">
          {/* Toggle */}
          <div className="flex mb-8 border border-[#2a2a2a] rounded-sm overflow-hidden">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                isLogin
                  ? 'bg-[#e60012] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                !isLogin
                  ? 'bg-[#e60012] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-[#e60012]/10 border border-[#e60012]/30 text-[#ff6b6b] text-sm rounded-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-street w-full pl-12"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-street w-full pl-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-street w-full pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <span className="text-gray-500 text-sm hover:text-[#e60012] cursor-pointer transition-colors">
                  Quên mật khẩu?
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-street w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="px-4 text-gray-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          {/* Google Sign-In */}
          <div id="google-signin-btn" className="flex justify-center" />
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer">Điều khoản dịch vụ</span>
          {' '}và{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer">Chính sách bảo mật</span>
        </p>
      </div>
    </div>
  );
}
