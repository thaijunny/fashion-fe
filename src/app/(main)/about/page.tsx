'use client';

import { useState, useEffect } from 'react';
import { fetchSettings, getImageUrl } from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { MapPin, Phone, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_ABOUT = `<p>UNTYPED CLOTHING — thương hiệu thời trang đường phố được thành lập với sứ mệnh mang đến phong cách độc đáo, khác biệt cho thế hệ trẻ Việt Nam.</p>
<p>Chúng tôi tin rằng thời trang không chỉ là quần áo — đó là cách bạn thể hiện bản thân, là tuyên ngôn cá nhân trước thế giới. Mỗi thiết kế của UNTYPED đều mang trong mình tinh thần tự do, sáng tạo và dám khác biệt.</p>
<p>Với đội ngũ thiết kế trẻ, đầy nhiệt huyết cùng chất lượng sản phẩm được kiểm soát chặt chẽ, UNTYPED cam kết mang đến cho bạn những sản phẩm không chỉ đẹp mắt mà còn bền bỉ theo thời gian.</p>
<p>Đặc biệt, với Design Studio — công cụ thiết kế trực tuyến độc quyền, bạn có thể tự tay tạo nên những tác phẩm thời trang mang dấu ấn cá nhân, từ ý tưởng đến sản phẩm thực tế.</p>`;

const DEFAULT_CORE_VALUES = [
    { emoji: '🔥', title: 'Sáng Tạo', desc: 'Luôn đổi mới trong thiết kế' },
    { emoji: '💎', title: 'Chất Lượng', desc: 'Chất liệu cao cấp, bền bỉ' },
    { emoji: '⚡', title: 'Khác Biệt', desc: 'Phong cách độc đáo, không trùng lặp' },
    { emoji: '🤝', title: 'Tận Tâm', desc: 'Hỗ trợ khách hàng 24/7' },
];

export default function AboutPage() {
    const { settings } = useSettings();
    const [aboutContent, setAboutContent] = useState('');
    const [coreValues, setCoreValues] = useState(DEFAULT_CORE_VALUES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAbout = async () => {
            try {
                const data = await fetchSettings();
                setAboutContent(data.about_content || DEFAULT_ABOUT);
                if (data.core_values) {
                    try {
                        const parsed = JSON.parse(data.core_values);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setCoreValues(parsed);
                        }
                    } catch { /* use defaults */ }
                }
            } catch {
                setAboutContent(DEFAULT_ABOUT);
            } finally {
                setLoading(false);
            }
        };
        loadAbout();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Banner */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: settings.banner_image
                                ? `url('${getImageUrl(settings.banner_image)}')`
                                : "url('/images/studio-demo.png')",
                        }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
                </div>

                {/* Content */}
                <div className="relative z-10 container-street text-center">
                    <span className="text-[#e60012] font-bold uppercase tracking-[0.3em] text-sm block mb-6 drop-shadow-lg">About Us</span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                        ABOUT <span className="text-[#e60012]">US</span>
                    </h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg drop-shadow-md">
                        Câu chuyện đằng sau thương hiệu thời trang đường phố UNTYPED CLOTHING.
                    </p>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
            </section>

            {/* Content */}
            <section className="py-16 md:py-24 bg-[#0a0a0a]">
                <div className="container-street">
                    <div className="grid lg:grid-cols-5 gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-4 bg-[#1a1a1a] rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="prose prose-invert prose-lg max-w-none [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_h2]:text-white [&_h2]:font-extrabold [&_h2]:uppercase [&_h3]:text-white [&_h3]:font-bold [&_p]:text-gray-300 [&_p]:leading-relaxed [&_li]:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: aboutContent }}
                                />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Brand Values */}
                            <div className="bg-[#111] border border-[#2a2a2a] p-8">
                                <h3 className="text-white font-extrabold uppercase tracking-wider mb-6 text-lg">Giá Trị Cốt Lõi</h3>
                                <div className="space-y-5">
                                    {coreValues.map((value, i) => (
                                        <div key={i} className="flex items-start gap-4 group">
                                            <span className="text-2xl group-hover:scale-125 transition-transform">{value.emoji}</span>
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wider">{value.title}</h4>
                                                <p className="text-gray-500 text-sm">{value.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Card - from Settings */}
                            <div className="bg-[#111] border border-[#2a2a2a] p-8">
                                <h3 className="text-white font-extrabold uppercase tracking-wider mb-6 text-lg">Liên Hệ</h3>
                                <div className="space-y-4">
                                    {settings.phone_number && (
                                        <a href={`tel:${settings.phone_number}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-[#e60012]/10 flex items-center justify-center flex-shrink-0">
                                                <Phone size={14} className="text-[#e60012]" />
                                            </div>
                                            <span className="text-sm">{settings.phone_number}</span>
                                        </a>
                                    )}
                                    {settings.email && (
                                        <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-[#e60012]/10 flex items-center justify-center flex-shrink-0">
                                                <Mail size={14} className="text-[#e60012]" />
                                            </div>
                                            <span className="text-sm">{settings.email}</span>
                                        </a>
                                    )}
                                    {settings.address && (
                                        <div className="flex items-start gap-3 text-gray-400">
                                            <div className="w-8 h-8 rounded-full bg-[#e60012]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MapPin size={14} className="text-[#e60012]" />
                                            </div>
                                            <span className="text-sm leading-relaxed">{settings.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-[#e60012] to-[#b3000e] p-8 text-center">
                                <Sparkles className="mx-auto mb-3 text-white/80" size={28} />
                                <h3 className="text-white font-extrabold uppercase tracking-wider mb-2">Bắt Đầu Thiết Kế</h3>
                                <p className="text-white/70 text-sm mb-5">Tự tay tạo phong cách riêng với Design Studio</p>
                                <Link href="/studio" className="inline-flex items-center gap-2 bg-white text-[#e60012] font-bold uppercase tracking-wider text-sm px-6 py-3 hover:bg-gray-100 transition-colors">
                                    Thử Ngay <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
