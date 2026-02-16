'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { fetchAllUsersAdmin, toggleBlockUser, updateUserRole } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
    Search, Shield, ShieldOff, Users, Mail, Calendar, Crown, User as UserIcon, Ban, CheckCircle2
} from 'lucide-react';

export default function AdminUsersPage() {
    const { token, user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Confirm modals
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        type: 'block' | 'role';
        userId: string;
        userName: string;
        data?: any;
    }>({ isOpen: false, type: 'block', userId: '', userName: '' });

    const loadUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchAllUsersAdmin(token);
            setUsers(data);
        } catch {
            showToast('Không thể tải danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, [token]);

    const executeToggleBlock = async () => {
        const { userId } = confirmAction;
        if (!token || !userId) return;
        setActionLoading(userId);
        setConfirmAction(prev => ({ ...prev, isOpen: false }));
        try {
            const res = await toggleBlockUser(userId, token);
            showToast(res.message);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: res.is_blocked } : u));
        } catch (err: any) {
            showToast(err.message || 'Lỗi', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const executeRoleChange = async () => {
        const { userId, data: newRole } = confirmAction;
        if (!token || !userId || !newRole) return;
        setActionLoading(userId);
        setConfirmAction(prev => ({ ...prev, isOpen: false }));
        try {
            const res = await updateUserRole(userId, newRole, token);
            showToast(res.message);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.role } : u));
        } catch (err: any) {
            showToast(err.message || 'Lỗi', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u => {
        const matchSearch = !searchTerm ||
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        blocked: users.filter(u => u.is_blocked).length,
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Người Dùng</h1>
                    <p className="text-gray-500 mt-1">Quản lý tài khoản người dùng</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg"><Users size={20} className="text-indigo-600" /></div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Tổng cộng</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg"><Crown size={20} className="text-amber-600" /></div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.admins}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Admin</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg"><Ban size={20} className="text-red-600" /></div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.blocked}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Bị khóa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Tìm theo tên hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                        {(['all', 'user', 'admin'] as const).map(r => (
                            <button key={r} onClick={() => setFilterRole(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterRole === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                                {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'User'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Người dùng</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vai trò</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(u => {
                                    const isSelf = u.id === currentUser?.id;
                                    return (
                                        <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.is_blocked ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            (u.full_name || u.email)?.[0]?.toUpperCase() || '?'
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{u.full_name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500 flex items-center gap-1"><Mail size={14} /> {u.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.role === 'admin' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                                                        <Crown size={12} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                                        <UserIcon size={12} /> User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_blocked ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                                                        <Ban size={12} /> Đã khóa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                                                        <CheckCircle2 size={12} /> Hoạt động
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {!isSelf && u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => setConfirmAction({
                                                                isOpen: true,
                                                                type: 'block',
                                                                userId: u.id,
                                                                userName: u.full_name || u.email,
                                                                data: u.is_blocked
                                                            })}
                                                            disabled={actionLoading === u.id}
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.is_blocked
                                                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                                } disabled:opacity-50`}
                                                        >
                                                            {actionLoading === u.id ? (
                                                                <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                            ) : u.is_blocked ? (
                                                                <><Shield size={12} /> Mở khóa</>
                                                            ) : (
                                                                <><ShieldOff size={12} /> Khóa</>
                                                            )}
                                                        </button>
                                                    )}
                                                    {!isSelf && !u.is_blocked && (
                                                        <select
                                                            value={u.role}
                                                            onChange={e => setConfirmAction({
                                                                isOpen: true,
                                                                type: 'role',
                                                                userId: u.id,
                                                                userName: u.full_name || u.email,
                                                                data: e.target.value
                                                            })}
                                                            disabled={actionLoading === u.id}
                                                            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                    {isSelf && (
                                                        <span className="text-xs text-gray-400 italic">Bạn</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                title={confirmAction.type === 'block'
                    ? (confirmAction.data ? 'Mở khóa người dùng?' : 'Khóa người dùng?')
                    : 'Thay đổi quyền hạn?'}
                message={confirmAction.type === 'block'
                    ? `Bạn có chắc chắn muốn ${confirmAction.data ? 'mở khóa' : 'khóa'} tài khoản của "${confirmAction.userName}"?`
                    : `Bạn có chắc chắn muốn thay đổi quyền hạn của "${confirmAction.userName}" thành ${confirmAction.data?.toUpperCase()}?`}
                onConfirm={confirmAction.type === 'block' ? executeToggleBlock : executeRoleChange}
                onCancel={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
                type={confirmAction.type === 'block' ? (confirmAction.data ? 'success' : 'danger') : 'warning'}
            />
        </div>
    );
}
