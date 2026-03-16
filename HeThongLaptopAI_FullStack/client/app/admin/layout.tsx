"use client";
import React from 'react';
import { usePathname } from 'next/navigation'; // 1. Nhập hook này
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Laptop } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname(); // 2. Lấy đường dẫn hiện tại

    return (
        <div className="flex min-h-screen bg-[#0b1121] text-slate-300">
            <aside className="w-64 border-r border-white/10 bg-[#0b1121]/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 bg-cyan-500 rounded-lg text-slate-950">
                        <Laptop size={20} />
                    </div>
                    <span className="font-black text-white text-xl tracking-tighter">AI Laptop</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {/* 3. So sánh pathname để bật trạng thái active tự động */}
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        href="/admin"
                        active={pathname === '/admin'}
                    />
                    <SidebarItem
                        icon={<Package size={20} />}
                        label="Sản phẩm"
                        href="/admin/products"
                        active={pathname === '/admin/products'}
                    />
                    <SidebarItem
                        icon={<BarChart3 size={20} />}
                        label="Phân tích"
                        href="/admin/analytics"
                        active={pathname === '/admin/analytics'}
                    />
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label="Cài đặt"
                        href="/admin/settings"
                        active={pathname === '/admin/settings'}
                    />
                </nav>

                <Link href="/" className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-cyan-400 transition-all">
                    <LogOut size={18} /> Về trang chủ
                </Link>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

// Giữ nguyên function SidebarItem nhưng đảm bảo nhận href và active
function SidebarItem({ icon, label, href, active }: any) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm 
                ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 hover:text-white'}`}>
                {icon} {label}
            </div>
        </Link>
    );
}