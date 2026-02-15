'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#e60012]/15 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#f0ff00]/8 rounded-full blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px),
                              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)`,
                    }}
                />
            </div>

            <div className="relative z-10 text-center px-6">
                {/* Glitch 404 */}
                <div className="relative mb-8">
                    <h1
                        className="text-[12rem] md:text-[16rem] font-black text-transparent leading-none select-none"
                        style={{
                            WebkitTextStroke: '2px rgba(230, 0, 18, 0.3)',
                        }}
                    >
                        404
                    </h1>
                    <h1
                        className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-white leading-none select-none animate-pulse"
                        style={{
                            WebkitTextStroke: '1px rgba(230, 0, 18, 0.5)',
                            textShadow: '0 0 80px rgba(230, 0, 18, 0.3), 0 0 160px rgba(230, 0, 18, 0.1)',
                        }}
                    >
                        404
                    </h1>
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wider">
                    Trang không <span className="text-[#e60012]">tồn tại</span>
                </h2>
                <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                    Trang bạn tìm kiếm đã bị xóa, đổi tên hoặc không tồn tại.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-[#e60012] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a1a] transition-all flex items-center justify-center gap-2 rounded"
                    >
                        <Home size={18} />
                        Về trang chủ
                    </Link>
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-white/10 text-white font-bold uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2 rounded border border-white/20"
                    >
                        <Sparkles size={18} />
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}
