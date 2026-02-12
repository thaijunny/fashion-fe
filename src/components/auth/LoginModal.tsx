'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, X } from 'lucide-react';

const GOOGLE_CLIENT_ID = '725448588950-b3mdsmnqj8tj9ttam14c0ajhjk7d4b3j.apps.googleusercontent.com';

declare global {
    interface Window {
        google?: any;
    }
}

export default function LoginModal() {
    const { isLoginModalOpen, closeLoginModal, login, register, googleLogin } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isLoginModalOpen) {
            setEmail('');
            setPassword('');
            setFullName('');
            setError('');
            setIsLoading(false);
        }
    }, [isLoginModalOpen]);

    // Load Google Identity Services script
    useEffect(() => {
        if (!isLoginModalOpen) return;

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
                document.getElementById('google-signin-btn-modal'),
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
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [isLoginModalOpen, isLogin]);

    const handleGoogleCallback = async (response: any) => {
        setError('');
        setIsLoading(true);
        try {
            await googleLogin(response.credential);
            // closeLoginModal() is called inside handleAuth in AuthContext
        } catch (err: any) {
            setError(err.message || 'Google login failed');
            setIsLoading(false);
        }
    };

    if (!isLoginModalOpen) return null;

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
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div
                className="relative w-full max-w-md bg-[#1a1a1a] border border-[#2a2a2a] p-8 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={closeLoginModal}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight">
                        <span className="text-white">UNTYPED</span>
                        <span className="text-[#e60012]"> CLOTHING</span>
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        {isLogin ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex mb-8 border border-[#2a2a2a] rounded-sm overflow-hidden">
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${isLogin
                                ? 'bg-[#e60012] text-white'
                                : 'bg-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Đăng Nhập
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${!isLogin
                                ? 'bg-[#e60012] text-white'
                                : 'bg-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        Đăng Ký
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-3 bg-[#e60012]/10 border border-[#e60012]/30 text-[#ff6b6b] text-xs rounded-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-street w-full !pl-12 text-sm"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-street w-full !pl-12 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="input-street w-full !pl-12 pr-12 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-street w-full text-sm mt-4 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-[#2a2a2a]" />
                    <span className="px-4 text-gray-500 text-[10px] uppercase tracking-widest">hoặc</span>
                    <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                {/* Google Sign-In */}
                <div id="google-signin-btn-modal" className="flex justify-center min-h-[40px]" />

                <p className="text-center text-gray-600 text-[10px] mt-6 leading-relaxed">
                    Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                </p>
            </div>
        </div>
    );
}

