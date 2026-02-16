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
    Youtube,
    Instagram,
    Image as ImageIcon,
    Loader2,
    Upload
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
        youtube_link: '',
        instagram_link: '',
        banner_image: '',
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchSettings();
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        try {
            const url = await uploadFile(file, token);
            if (url) {
                setSettings(prev => ({ ...prev, banner_image: url }));
                showToast('Đã tải lên ảnh banner');
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
                            <div className="w-8 h-8 flex items-center justify-center bg-[#FF0000] text-white rounded-lg">
                                <Youtube size={16} />
                            </div>
                            <input
                                type="text"
                                value={settings.youtube_link}
                                onChange={(e) => setSettings({ ...settings, youtube_link: e.target.value })}
                                className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                placeholder="Youtube Link"
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
        </div>
    );
}
