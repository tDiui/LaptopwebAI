"use client";
import React from 'react';
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Laptop } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0b1121] text-slate-300">
            {/* Sidebar bên trái */}
            <aside className="w-64 border-r border-white/10 bg-[#0b1121]/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 bg-cyan-500 rounded-lg text-slate-950">
                        <Laptop size={20} />
                    </div>
                    <span className="font-black text-white text-xl tracking-tighter">AI Laptop</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <SidebarItem icon={<Package size={20} />} label="Sản phẩm" />
                    <SidebarItem icon={<BarChart3 size={20} />} label="Phân tích" />
                    <SidebarItem icon={<Settings size={20} />} label="Cài đặt" />
                </nav>

                <Link href="/" className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-cyan-400 transition-all">
                    <LogOut size={18} /> Về trang chủ
                </Link>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 hover:text-white'}`}>
            {icon} {label}
        </div>
    );
}