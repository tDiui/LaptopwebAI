"use client";
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Clock, Save } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function UserProfile() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Lấy MaTK từ localStorage sau khi đăng nhập
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser.MaTK) {
            fetch(`http://localhost:5000/api/auth/profile/${savedUser.MaTK}`)
                .then(res => res.json())
                .then(data => setUser(data));
        }
    }, []);

    if (!user) return <div className="min-h-screen bg-[#0b1121] text-cyan-400 p-20">Đang tải hồ sơ AI...</div>;

    return (
        <main className="min-h-screen bg-[#0b1121] text-slate-300">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cột 1: Thẻ Profile Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                            <div className="w-24 h-24 bg-cyan-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-cyan-500/30">
                                <User size={40} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white">{user.HoTen}</h2>
                            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">{user.VaiTro}</p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-around text-sm">
                                <div><p className="text-white font-black">12</p><p className="text-xs text-slate-500">Đơn hàng</p></div>
                                <div><p className="text-white font-black">5</p><p className="text-xs text-slate-500">Yêu thích</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Form chi tiết */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem]">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                                <Shield className="mr-3 text-cyan-400" size={20} /> THÔNG TIN TÀI KHOẢN
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileInput icon={<User size={18} />} label="Họ và Tên" value={user.HoTen} />
                                <ProfileInput icon={<Mail size={18} />} label="Email" value={user.Email} disabled />
                                <ProfileInput icon={<Phone size={18} />} label="Số điện thoại" value={user.SoDienThoai || "Chưa cập nhật"} />
                                <ProfileInput icon={<Clock size={18} />} label="Ngày gia nhập" value={new Date(user.NgayTao).toLocaleDateString()} disabled />
                            </div>

                            <div className="mt-6">
                                <ProfileInput icon={<MapPin size={18} />} label="Địa chỉ giao hàng" value={user.DiaChi || "Chưa cập nhật"} isFullWidth />
                            </div>

                            <button className="mt-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2 group">
                                <Save size={18} /> CẬP NHẬT HỒ SƠ
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

function ProfileInput({ icon, label, value, disabled = false, isFullWidth = false }: any) {
    return (
        <div className={`space-y-2 ${isFullWidth ? 'w-full' : ''}`}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
                <input
                    type="text"
                    defaultValue={value}
                    disabled={disabled}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    );
}