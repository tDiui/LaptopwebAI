"use client";
import React, { useState, useEffect } from 'react'; // Bổ sung import useState, useEffect
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Laptop, Users, FolderTree } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Bọc logic vào một hàm async để báo cho React biết đây là tác vụ chạy ngầm, 
        // không làm nghẽn quá trình render ban đầu
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.VaiTro === 'Customer') {
                    window.location.href = '/';
                } else {
                    setUserRole(user.VaiTro); // Lỗi cảnh báo sẽ biến mất!
                }
            } else {
                // Tạm thời comment lại, sau này có trang login thì mở ra
                // window.location.href = '/login';
            }
        };

        checkAuth(); // Gọi hàm vừa tạo
    }, []);

    // Trong lúc đang check quyền thì render màn hình loading cho an toàn
    if (!userRole) return (
        <div className="min-h-screen bg-[#0b1121] text-cyan-400 flex items-center justify-center font-bold">
            Đang kiểm tra quyền truy cập...
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0b1121] text-slate-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0b1121]/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
                {/* Logo Section */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 bg-cyan-500 rounded-lg text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        <Laptop size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-white text-xl tracking-tighter leading-none">AI Laptop</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Admin Panel</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
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
                        icon={<FolderTree size={20} />}
                        label="Danh mục"
                        href="/admin/categories"
                        active={pathname === '/admin/categories'}
                    />

                    {/* CHỈ ADMIN MỚI NHÌN THẤY MỤC TÀI KHOẢN */}
                    {userRole === 'Admin' && (
                        <SidebarItem
                            icon={<Users size={20} />}
                            label="Tài khoản"
                            href="/admin/customers"
                            active={pathname === '/admin/customers'}
                        />
                    )}

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

                {/* Footer Link */}
                <Link href="/" className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all group">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Về trang chủ
                </Link>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

// Component hiển thị từng mục trong Sidebar
function SidebarItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm 
                ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
                {icon} {label}
            </div>
        </Link>
    );
}