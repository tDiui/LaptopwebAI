"use client";
import { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
    // State Thông tin tài khoản
    const [accountInfo, setAccountInfo] = useState({ hoTen: '', email: '' });

    // State Thông báo (Toggles)
    const [notifications, setNotifications] = useState({
        newOrder: true,
        lowStock: true,
        weeklyReport: false,
        systemUpdate: true
    });

    // Lấy thông tin user hiện tại từ localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setAccountInfo({ hoTen: user.HoTen || '', email: user.Email || '' });
        }
    }, []);

    const handleUpdateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        // Trong thực tế, bạn sẽ gọi API PUT /api/admin/accounts/:id tại đây
        alert("Đã cập nhật thông tin tài khoản thành công!");
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Đổi mật khẩu thành công!");
    };

    return (
        <div className="space-y-6 relative pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Cài đặt</h1>
                <p className="text-slate-400 text-sm mt-1">Quản lý cấu hình hệ thống</p>
            </div>

            {/* Grid Layout chính */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. THÔNG TIN TÀI KHOẢN */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Thông tin tài khoản</h2>
                    </div>

                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tên hiển thị</label>
                            <input
                                type="text"
                                value={accountInfo.hoTen}
                                onChange={e => setAccountInfo({ ...accountInfo, hoTen: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={accountInfo.email}
                                onChange={e => setAccountInfo({ ...accountInfo, email: e.target.value })}
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2">
                            Cập nhật thông tin
                        </button>
                    </form>
                </div>

                {/* 2. THÔNG BÁO */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Thông báo</h2>
                    </div>

                    <div className="space-y-6">
                        <ToggleRow
                            label="Thông báo đơn hàng mới"
                            isActive={notifications.newOrder}
                            onClick={() => setNotifications({ ...notifications, newOrder: !notifications.newOrder })}
                        />
                        <ToggleRow
                            label="Cảnh báo tồn kho thấp"
                            isActive={notifications.lowStock}
                            onClick={() => setNotifications({ ...notifications, lowStock: !notifications.lowStock })}
                        />
                        <ToggleRow
                            label="Báo cáo hàng tuần"
                            isActive={notifications.weeklyReport}
                            onClick={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
                        />
                        <ToggleRow
                            label="Cập nhật hệ thống"
                            isActive={notifications.systemUpdate}
                            onClick={() => setNotifications({ ...notifications, systemUpdate: !notifications.systemUpdate })}
                        />
                    </div>
                </div>

                {/* 3. BẢO MẬT */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Bảo mật</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Mật khẩu mới</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#1e2330] hover:bg-white/5 border border-white/5 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                            Đổi mật khẩu
                        </button>
                    </form>
                </div>

                {/* 4. HỆ THỐNG */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Hệ thống</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ngôn ngữ</label>
                            <select className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                                <option>Tiếng Việt</option>
                                <option>English (US)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Múi giờ</label>
                            <select className="w-full bg-[#1e2330] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                                <option>GMT+7 (Hồ Chí Minh)</option>
                                <option>GMT+0 (London)</option>
                                <option>GMT-5 (New York)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 5. GIAO DIỆN */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <Palette size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Giao diện</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button className="h-20 bg-[#0b1121] border-2 border-cyan-500 rounded-xl transition-all"></button>
                        <button className="h-20 bg-cyan-500 border-2 border-transparent hover:border-white/20 rounded-xl transition-all"></button>
                        <button className="h-20 bg-slate-300 border-2 border-transparent hover:border-white/20 rounded-xl transition-all"></button>
                    </div>
                </div>

                {/* 6. DỮ LIỆU */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                            <Database size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Dữ liệu</h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full bg-[#1e2330] hover:bg-white/5 border border-white/5 text-white text-sm font-semibold py-3.5 px-4 rounded-xl transition-colors text-left">
                            Sao lưu dữ liệu
                        </button>
                        <button className="w-full bg-[#1e2330] hover:bg-white/5 border border-white/5 text-white text-sm font-semibold py-3.5 px-4 rounded-xl transition-colors text-left">
                            Khôi phục dữ liệu
                        </button>
                        <button className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold py-3.5 px-4 rounded-xl transition-colors text-left mt-2">
                            Xóa cache hệ thống
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Component phụ trợ: Nút Toggle tự code mô phỏng nút gạt của iOS/Android
function ToggleRow({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
    return (
        <div className="flex items-center justify-between cursor-pointer group" onClick={onClick}>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-cyan-500' : 'bg-[#1e2330] border border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isActive ? 'left-6' : 'left-1'}`}></div>
            </div>
        </div>
    );
}