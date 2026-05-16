"use client";
import { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Palette, Database, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPassLoading, setIsPassLoading] = useState(false);

    // State Thông tin tài khoản
    const [accountInfo, setAccountInfo] = useState({ hoTen: '', email: '' });

    // State Mật khẩu
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // State Thông báo (Lưu local)
    const [notifications, setNotifications] = useState({
        newOrder: true, lowStock: true, weeklyReport: false, systemUpdate: true
    });

    // State Hệ thống (Lưu local)
    const [systemSettings, setSystemSettings] = useState({
        language: 'Tiếng Việt', timezone: 'GMT+7 (Hồ Chí Minh)'
    });

    // Khởi tạo dữ liệu khi vào trang
    useEffect(() => {
        // 1. Lấy thông tin user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserId(user.MaTK || user.id);
            setAccountInfo({ hoTen: user.HoTen || '', email: user.Email || '' });
        }

        // 2. Lấy cài đặt local (nếu có)
        const savedNoti = localStorage.getItem('admin_notifications');
        if (savedNoti) setNotifications(JSON.parse(savedNoti));

        const savedSys = localStorage.getItem('admin_system_settings');
        if (savedSys) setSystemSettings(JSON.parse(savedSys));
    }, []);

    // Lưu Cài đặt Thông báo/Hệ thống mỗi khi có thay đổi
    useEffect(() => {
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('admin_system_settings', JSON.stringify(systemSettings));
    }, [systemSettings]);

    // CHỨC NĂNG: CẬP NHẬT TÀI KHOẢN
    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return alert("Không tìm thấy thông tin tài khoản!");

        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountInfo)
            });

            const data = await res.json();
            if (res.ok) {
                // Cập nhật lại localStorage để header/avatar đổi tên theo
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.HoTen = accountInfo.hoTen;
                storedUser.Email = accountInfo.email;
                localStorage.setItem('user', JSON.stringify(storedUser));

                alert("Đã cập nhật thông tin tài khoản thành công!");
                window.dispatchEvent(new Event('storage')); // Trigger update giao diện
            } else {
                alert(data.error || "Cập nhật thất bại!");
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
        setIsLoading(false);
    };

    // CHỨC NĂNG: ĐỔI MẬT KHẨU
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return alert("Mật khẩu xác nhận không khớp!");
        }
        if (passwords.new.length < 6) {
            return alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        setIsPassLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/change-password/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Đổi mật khẩu thành công!");
                setPasswords({ current: '', new: '', confirm: '' }); // Reset form
            } else {
                alert(data.error || "Đổi mật khẩu thất bại!");
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
        setIsPassLoading(false);
    };

    return (
        <div className="space-y-6 relative pb-10">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Cài đặt</h1>
                <p className="text-slate-400 text-sm mt-1">Quản lý cấu hình hệ thống & tài khoản</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. THÔNG TIN TÀI KHOẢN */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><User size={20} /></div>
                        <h2 className="text-lg font-bold text-white">Thông tin tài khoản</h2>
                    </div>

                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tên hiển thị</label>
                            <input
                                type="text" required
                                value={accountInfo.hoTen}
                                onChange={e => setAccountInfo({ ...accountInfo, hoTen: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Email</label>
                            <input
                                type="email" required
                                value={accountInfo.email}
                                onChange={e => setAccountInfo({ ...accountInfo, email: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <button disabled={isLoading} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2 flex justify-center items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Cập nhật thông tin'}
                        </button>
                    </form>
                </div>

                {/* 3. BẢO MẬT */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Shield size={20} /></div>
                        <h2 className="text-lg font-bold text-white">Đổi mật khẩu</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Mật khẩu hiện tại</label>
                            <input
                                type="password" required
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Mật khẩu mới</label>
                                <input
                                    type="password" required
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Xác nhận mật khẩu</label>
                                <input
                                    type="password" required
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <button disabled={isPassLoading} type="submit" className="w-full bg-[#1e2330] hover:bg-white/5 border border-white/5 text-white font-bold py-3 rounded-xl transition-colors mt-2 flex justify-center items-center gap-2">
                            {isPassLoading ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận đổi mật khẩu'}
                        </button>
                    </form>
                </div>

                {/* 2. THÔNG BÁO (Hoạt động bằng LocalStorage) */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Bell size={20} /></div>
                        <h2 className="text-lg font-bold text-white">Tuỳ chọn thông báo</h2>
                    </div>

                    <div className="space-y-6">
                        <ToggleRow label="Thông báo đơn hàng mới" isActive={notifications.newOrder} onClick={() => setNotifications({ ...notifications, newOrder: !notifications.newOrder })} color="bg-emerald-500" />
                        <ToggleRow label="Cảnh báo tồn kho thấp" isActive={notifications.lowStock} onClick={() => setNotifications({ ...notifications, lowStock: !notifications.lowStock })} color="bg-emerald-500" />
                        <ToggleRow label="Báo cáo hàng tuần" isActive={notifications.weeklyReport} onClick={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })} color="bg-emerald-500" />
                        <ToggleRow label="Cập nhật hệ thống" isActive={notifications.systemUpdate} onClick={() => setNotifications({ ...notifications, systemUpdate: !notifications.systemUpdate })} color="bg-emerald-500" />
                    </div>
                </div>

                {/* 4. HỆ THỐNG */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Globe size={20} /></div>
                        <h2 className="text-lg font-bold text-white">Hệ thống</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ngôn ngữ</label>
                            <select
                                value={systemSettings.language}
                                onChange={e => setSystemSettings({ ...systemSettings, language: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                            >
                                <option>Tiếng Việt</option>
                                <option>English (US)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Múi giờ</label>
                            <select
                                value={systemSettings.timezone}
                                onChange={e => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                            >
                                <option>GMT+7 (Hồ Chí Minh)</option>
                                <option>GMT+0 (London)</option>
                                <option>GMT-5 (New York)</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Component phụ trợ
function ToggleRow({ label, isActive, onClick, color = 'bg-cyan-500' }: any) {
    return (
        <div className="flex items-center justify-between cursor-pointer group" onClick={onClick}>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isActive ? color : 'bg-[#1e2330] border border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isActive ? 'left-6' : 'left-1'}`}></div>
            </div>
        </div>
    );
}