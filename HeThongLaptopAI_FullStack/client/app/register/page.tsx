"use client";
import { useState } from 'react';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        hoTen: '', email: '', matKhau: '', soDienThoai: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Đăng ký thành công! Hãy đăng nhập nhé");
                window.location.href = '/login';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
        }
    };

    return (
        <main className="min-h-screen bg-[#0b1121] flex items-center justify-center p-6 selection:bg-cyan-500/30">
            {/* Card Đăng ký */}
            <div className="w-full max-w-[500px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tighter">
                        GIA NHẬP <span className="text-cyan-400">AI WORLD</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Bắt đầu hành trình công nghệ của bro ngay hôm nay</p>
                </header>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Họ tên */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Họ và Tên</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" required placeholder="Nguyễn Văn A"
                                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="email" required placeholder="bro@example.com"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                        </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Số điện thoại</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" required placeholder="0901xxx..."
                                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                        </div>
                    </div>

                    {/* Mật khẩu */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="password" required placeholder="••••••••"
                                onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-4 rounded-2xl font-black text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center group mt-4">
                        TẠO TÀI KHOẢN <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-xs">
                    Đã có tài khoản? <Link href="/login" className="text-cyan-400 font-bold hover:underline">Đăng nhập ngay</Link>
                </p>
            </div>
        </main>
    );
}