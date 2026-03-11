"use client";
import { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', matKhau: '' });

    const handleLogin = async (e: any) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            alert(`Chào mừng ${data.user.HoTen}!`);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/'; // Về trang chủ
        } else alert(data.error);
    };

    return (
        <main className="min-h-screen bg-[#0b1121] flex items-center justify-center p-6">
            <div className="w-full max-w-[450px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tighter">
                        AI <span className="text-cyan-400">LOGIN</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Đăng nhập để trải nghiệm hệ thống AI</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input type="email" required placeholder="name@company.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input type="password" required placeholder="••••••••" 
                                onChange={(e) => setFormData({...formData, matKhau: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                        </div>
                    </div>

                    <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center group">
                        Đăng nhập <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Chưa có tài khoản? <Link href="/register" className="text-cyan-400 font-bold hover:underline">Đăng ký ngay</Link>
                </p>
            </div>
        </main>
    );
}