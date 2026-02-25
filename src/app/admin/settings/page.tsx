'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchSettings, updateSettings, uploadFile, getImageUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
    Save,
    Settings as SettingsIcon,
    Megaphone,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Image as ImageIcon,
    Loader2,
    Upload,
    FileText,
    CreditCard
} from 'lucide-react';
import Image from 'next/image';

export default function AdminSettingsPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        marquee_content: '',
        phone_number: '',
        email: '',
        address: '',
        facebook_link: '',
        tiktok_link: '',
        instagram_link: '',
        banner_image: '',
        studio_image: '',
        about_content: '',
        bank_id: '',
        bank_account: '',
        bank_owner: '',
        core_values: '[]',
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchSettings();
                // Pre-populate core values with defaults if empty
                if (!data.core_values || data.core_values === '[]') {
                    data.core_values = JSON.stringify([
                        { emoji: '🔥', title: 'Sáng Tạo', desc: 'Luôn đổi mới trong thiết kế' },
                        { emoji: '💎', title: 'Chất Lượng', desc: 'Chất liệu cao cấp, bền bỉ' },
                        { emoji: '⚡', title: 'Khác Biệt', desc: 'Phong cách độc đáo, không trùng lặp' },
                        { emoji: '🤝', title: 'Tận Tâm', desc: 'Hỗ trợ khách hàng 24/7' },
                    ]);
                }
                setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            await updateSettings(settings, token);
            showToast('Cập nhật cấu hình thành công!');
        } catch (error) {
            console.error('Failed to update settings', error);
            showToast('Cập nhật cấu hình thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner_image' | 'studio_image' = 'banner_image') => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        try {
            const url = await uploadFile(file, token);
            if (url) {
                setSettings(prev => ({ ...prev, [field]: url }));
                showToast(field === 'banner_image' ? 'Đã tải lên ảnh banner' : 'Đã tải lên ảnh Studio');
            }
        } catch (error) {
            showToast('Tải ảnh thất bại', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-2">
                        <SettingsIcon className="text-indigo-600" size={32} />
                        Cấu hình
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các thông tin chung và hiển thị trên website.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-street !bg-indigo-600 !text-white hover:!bg-indigo-700 flex items-center gap-2 rounded-lg shadow-md transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Lưu tất cả thay đổi
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marquee Settings */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Thông báo (Marquee)</h3>
                    </div>
                    <p className="text-xs text-gray-500">Dòng chữ chạy ở đầu trang web để thông báo khuyến mãi hoặc tin tức.</p>
                    <textarea
                        value={settings.marquee_content}
                        onChange={(e) => setSettings({ ...settings, marquee_content: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm min-h-[100px] bg-gray-50/50"
                        placeholder="Nhập nội dung thông báo..."
                    />
                </div>

                {/* Contact Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Phone size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Thông tin liên hệ</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={settings.phone_number}
                                onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="Số điện thoại"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <textarea
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm min-h-[80px] resize-none"
                                placeholder="Địa chỉ cửa hàng"
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Payment Settings */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Tài khoản nhận thanh toán</h3>
                    </div>
                    <p className="text-xs text-gray-500">Thông tin ngân hàng sẽ hiển thị khi khách chọn chuyển khoản và dùng để tạo mã QR (VietQR).</p>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Mã ngân hàng (VietQR)</label>
                            <input
                                type="text"
                                value={settings.bank_id}
                                onChange={(e) => setSettings({ ...settings, bank_id: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="VD: VCB, TCB, MB, ACB..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Số tài khoản</label>
                            <input
                                type="text"
                                value={settings.bank_account}
                                onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                                placeholder="VD: 1234567890"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Chủ tài khoản</label>
                            <input
                                type="text"
                                value={settings.bank_owner}
                                onChange={(e) => setSettings({ ...settings, bank_owner: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm uppercase"
                                placeholder="VD: NGUYEN VAN A"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Facebook size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Mạng xã hội</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-[#1877F2] text-white rounded-lg">
                                <Facebook size={16} />
                            </div>
                            <input
                                type="text"
                                value={settings.facebook_link}
                                onChange={(e) => setSettings({ ...settings, facebook_link: e.target.value })}
                                className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="Facebook Link"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-lg">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.83 4.83 0 01-3.77-1.54V6.69h3.77z"/></svg>
                            </div>
                            <input
                                type="text"
                                value={settings.tiktok_link}
                                onChange={(e) => setSettings({ ...settings, tiktok_link: e.target.value })}
                                className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="TikTok Link"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-[#FFB700] via-[#FF006F] to-[#7000FF] text-white rounded-lg">
                                <Instagram size={16} />
                            </div>
                            <input
                                type="text"
                                value={settings.instagram_link}
                                onChange={(e) => setSettings({ ...settings, instagram_link: e.target.value })}
                                className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="Instagram Link"
                            />
                        </div>
                    </div>
                </div>

                {/* Home Banner */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ImageIcon size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Banner trang chủ</h3>
                    </div>
                    <div className="relative group aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all hover:bg-gray-200/50 hover:border-indigo-300">
                        {settings.banner_image ? (
                            <>
                                <Image
                                    src={getImageUrl(settings.banner_image)}
                                    alt="Current Banner"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                                        <Upload size={16} />
                                        Thay đổi ảnh
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer">
                                <div className="p-3 bg-white rounded-full shadow-sm text-gray-400 mb-2 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">Tải lên ảnh banner</span>
                                <span className="text-[10px] text-gray-400 mt-1">Khuyên dùng: 1920x800 px</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* About Page Content - Full Width */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                        <ImageIcon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Ảnh Design Studio (Trang chủ)</h3>
                </div>
                <div className="relative group aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all hover:bg-gray-200/50 hover:border-pink-300">
                    {settings.studio_image ? (
                        <>
                            <Image
                                src={getImageUrl(settings.studio_image)}
                                alt="Studio Image"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-pink-600 hover:text-white transition-all">
                                    <Upload size={16} />
                                    Thay đổi ảnh
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'studio_image')} />
                                </label>
                            </div>
                        </>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                            <div className="p-3 bg-white rounded-full shadow-sm text-gray-400 mb-2 group-hover:text-pink-600 group-hover:scale-110 transition-all">
                                <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-pink-600">Tải lên ảnh Studio</span>
                            <span className="text-[10px] text-gray-400 mt-1">Khuyên dùng: 800x800 px</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'studio_image')} />
                        </label>
                    )}
                </div>
            </div>

            {/* About Page Content - Rich Text Editor */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Nội dung trang &quot;About Us&quot;</h3>
                </div>
                <p className="text-xs text-gray-500">Nội dung sẽ hiển thị trên trang /about. Bạn có thể định dạng văn bản và chèn ảnh.</p>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 border border-gray-200 rounded-t-lg p-2 bg-gray-50">
                    <button type="button" onClick={() => document.execCommand('bold')} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded" title="Bold">B</button>
                    <button type="button" onClick={() => document.execCommand('italic')} className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded" title="Italic">I</button>
                    <button type="button" onClick={() => document.execCommand('underline')} className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded" title="Underline">U</button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <button type="button" onClick={() => document.execCommand('formatBlock', false, 'h2')} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded" title="Heading">H2</button>
                    <button type="button" onClick={() => document.execCommand('formatBlock', false, 'h3')} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded" title="Subheading">H3</button>
                    <button type="button" onClick={() => document.execCommand('formatBlock', false, 'p')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="Paragraph">P</button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="Bullet List">• List</button>
                    <button type="button" onClick={() => document.execCommand('insertOrderedList')} className="px-2 py-1 text-sm hover:bg-gray-200 rounded" title="Numbered List">1. List</button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <label className="px-2 py-1 text-sm hover:bg-gray-200 rounded cursor-pointer flex items-center gap-1" title="Chèn ảnh">
                        <Upload size={14} /> Ảnh
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !token) return;
                            const url = await uploadFile(file, token);
                            if (url) {
                                document.execCommand('insertImage', false, getImageUrl(url));
                            }
                        }} />
                    </label>
                </div>

                {/* Editable area */}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full px-4 py-3 border border-gray-200 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm min-h-[300px] bg-white prose prose-sm max-w-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
                    dangerouslySetInnerHTML={{ __html: settings.about_content }}
                    onBlur={(e) => setSettings({ ...settings, about_content: (e.target as HTMLDivElement).innerHTML })}
                />
            </div>

            {/* Core Values Editor */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Giá Trị Cốt Lõi</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const vals = JSON.parse(settings.core_values || '[]');
                            vals.push({ emoji: '⭐', title: '', desc: '' });
                            setSettings({ ...settings, core_values: JSON.stringify(vals) });
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        + Thêm giá trị
                    </button>
                </div>
                <p className="text-xs text-gray-500">Các giá trị cốt lõi hiển thị trên trang About Us. Nếu để trống sẽ dùng mặc định.</p>
                <div className="space-y-3">
                    {(JSON.parse(settings.core_values || '[]') as { emoji: string; title: string; desc: string }[]).map((val, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="text"
                                value={val.emoji}
                                onChange={(e) => {
                                    const vals = JSON.parse(settings.core_values || '[]');
                                    vals[idx].emoji = e.target.value;
                                    setSettings({ ...settings, core_values: JSON.stringify(vals) });
                                }}
                                className="w-12 text-center text-xl px-1 py-1 border border-gray-200 rounded-lg bg-white"
                                placeholder="🔥"
                            />
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={val.title}
                                    onChange={(e) => {
                                        const vals = JSON.parse(settings.core_values || '[]');
                                        vals[idx].title = e.target.value;
                                        setSettings({ ...settings, core_values: JSON.stringify(vals) });
                                    }}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white"
                                    placeholder="Tiêu đề"
                                />
                                <input
                                    type="text"
                                    value={val.desc}
                                    onChange={(e) => {
                                        const vals = JSON.parse(settings.core_values || '[]');
                                        vals[idx].desc = e.target.value;
                                        setSettings({ ...settings, core_values: JSON.stringify(vals) });
                                    }}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white"
                                    placeholder="Mô tả ngắn"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const vals = JSON.parse(settings.core_values || '[]');
                                    vals.splice(idx, 1);
                                    setSettings({ ...settings, core_values: JSON.stringify(vals) });
                                }}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
