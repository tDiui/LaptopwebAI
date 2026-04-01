"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

interface UserType {
    MaTK: number;
    HoTen: string;
    Email?: string;
    SoDienThoai?: string;
    DiaChi?: string;
    VaiTro?: number;
    NgayTao?: string;
    TrangThai?: boolean;
}

export default function Navbar() {
    const [user, setUser] = useState<UserType | null>(null);

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

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="text-2xl font-black text-cyan-400 tracking-tighter">
                    LAPTOP <span className="text-white">AI</span>
                </Link>

                {/* Menu */}
                <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
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

                {/* User area */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">

                            {/* Liên kết đến trang Profile của User */}
                            <Link href="/profile" className="group">
                                <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer">
                                    {/* Icon User sẽ phóng to nhẹ khi di chuột vào cụm tên */}
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
                            <button className="bg-cyan-500 hover:bg-cyan-400 text-[#0b1121] px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                Đăng nhập
                            </button>
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}