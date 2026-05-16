"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Thêm hook chuyển hướng
import { User, LogOut, Search, Settings } from "lucide-react"; // Thêm icon Search, Settings

interface UserType {
    MaTK: number;
    HoTen: string;
    Email?: string;
    SoDienThoai?: string;
    DiaChi?: string;
    VaiTro?: string; // Đổi thành string vì DB lưu là 'Admin', 'Customer'
    NgayTao?: string;
    TrangThai?: boolean;
}

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            const parsedUser: UserType = JSON.parse(savedUser);
            setUser(parsedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/";
    };

    // Hàm xử lý click bánh răng
    const handleSettingsClick = () => {
        if (user && (user.VaiTro === 'Admin' || user.VaiTro === 'Manager')) {
            router.push('/admin');
        } else {
            alert('🚫 Bạn không có quyền truy cập! Khu vực này chỉ dành cho quản trị viên.');
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center gap-6">

                {/* Logo */}
                <Link href="/" className="text-2xl font-black text-cyan-400 tracking-tighter shrink-0">
                    LAPTOP <span className="text-white">AI</span>
                </Link>

                {/* Menu */}
                <div className="hidden lg:flex space-x-8 text-sm font-medium text-slate-300 shrink-0">
                    <Link href="/products" className="hover:text-cyan-400 transition-colors">
                        Sản phẩm
                    </Link>
                    <Link href="/compare" className="hover:text-cyan-400 transition-colors">
                        So sánh
                    </Link>
                    <Link href="/benchmark" className="hover:text-cyan-400 transition-colors">
                        Benchmark
                    </Link>
                    <Link href="/cart" className="hover:text-cyan-400 transition-colors">
                        Giỏ hàng
                    </Link>
                </div>

                {/* CỤM TÌM KIẾM & CÀI ĐẶT MỚI THÊM VÀO */}
                <div className="flex-1 flex items-center justify-end max-w-md ml-auto gap-3">
                    <div className="relative flex items-center w-full">
                        <Search className="absolute left-4 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm laptop..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1A1F2B]/80 border border-white/10 rounded-full px-5 py-2 pl-11 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    <button
                        onClick={handleSettingsClick}
                        className="bg-[#1A1F2B]/80 border border-white/10 rounded-full p-2.5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center justify-center group shrink-0"
                        title="Cài đặt hệ thống (Chỉ dành cho Admin)"
                    >
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* User area */}
                <div className="flex items-center gap-4 shrink-0">
                    {user ? (
                        <div className="flex items-center gap-4">

                            {/* Liên kết đến trang Profile của User */}
                            <Link href="/profile" className="group">
                                <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer">
                                    <User size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span className="group-hover:text-cyan-400 transition-colors">
                                        Chào, {user.HoTen}
                                    </span>
                                </div>
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 transition-colors p-2"
                                title="Đăng xuất"
                            >
                                <LogOut size={18} />
                            </button>

                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-[#0b1121] px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] whitespace-nowrap">
                                Đăng nhập
                            </button>
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}

