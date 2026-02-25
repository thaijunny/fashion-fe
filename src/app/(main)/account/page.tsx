'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AccountPage() {
    const { user, token, loading, refreshUser, openLoginModal } = useAuth();
    const { showToast } = useToast();

    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone_number: '',
        address: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            openLoginModal();
        }
    }, [loading, user]);

    const handleSaveProfile = async () => {
        if (!token) return;
        setSavingProfile(true);
        try {
            await updateProfile(profileForm, token);
            await refreshUser();
            showToast('Cập nhật thông tin thành công!');
        } catch (error: any) {
            showToast(error.message || 'Cập nhật thất bại', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!token) return;
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        if (passwordForm.new_password.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            return;
        }
        setSavingPassword(true);
        try {
            await changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            }, token);
            showToast('Đổi mật khẩu thành công!');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="animate-spin text-[#e60012]" size={40} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <p className="text-gray-400">Vui lòng đăng nhập để xem trang này.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-16">
            <div className="container-street max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight mb-2">
                        Tài Khoản
                    </h1>
                    <p className="text-gray-500">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
                </div>

                {/* Profile Info Card */}
                <div className="bg-[#111] border border-[#2a2a2a] p-8 mb-6">
                    <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-6 flex items-center gap-2">
                        <User size={20} className="text-[#e60012]" />
                        Thông Tin Cá Nhân
                    </h2>

                    <div className="space-y-5">
                        {/* Email (read-only) */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-gray-400">
                                <Mail size={16} className="text-gray-600" />
                                <span>{user.email}</span>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Họ và Tên</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Số Điện Thoại</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={profileForm.phone_number}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors"
                                    placeholder="VD: 0901234567"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Địa Chỉ</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-600" size={16} />
                                <textarea
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors min-h-[80px] resize-none"
                                    placeholder="Nhập địa chỉ giao hàng"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="w-full py-3 bg-[#e60012] text-white font-bold uppercase tracking-wider hover:bg-[#cc0010] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Lưu Thay Đổi
                        </button>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-[#111] border border-[#2a2a2a] p-8">
                    <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-[#e60012]" />
                        Đổi Mật Khẩu
                    </h2>

                    <div className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Mật Khẩu Hiện Tại</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors"
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                >
                                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Mật Khẩu Mới</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors"
                                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                >
                                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Xác Nhận Mật Khẩu Mới</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type="password"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-[#e60012] transition-colors"
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={savingPassword || !passwordForm.current_password || !passwordForm.new_password}
                            className="w-full py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold uppercase tracking-wider hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                            Đổi Mật Khẩu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
