"use client";
import { useEffect, useState } from 'react';
// Kiểm tra kỹ: folder 'components' phải nằm ngoài folder 'app'
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LaptopCard from './components/LaptopCard';
import FloatingAIButton from './components/FloatingAIButton';

// 1. Tạo "khuôn" để fix lỗi "Unexpected any"
interface Laptop {
    MaSP: number;
    TenSP: string;
    GiaBan: number;
    HinhAnh?: string;
    Rating?: number;
}

export default function Home() {
    // 2. Sử dụng interface Laptop thay vì any
    const [laptops, setLaptops] = useState<Laptop[]>([]);

    useEffect(() => {
        // Gọi API từ Backend port 5000
        fetch('http://localhost:5000/api/laptops')
            .then(res => res.json())
            .then(data => {
                console.log("Dữ liệu về tới Frontend rồi nè:", data);
                if (Array.isArray(data)) {
                    setLaptops(data);
                }
            })
            .catch(err => console.error("Lỗi lấy dữ liệu:", err));
    }, []);

    // CHỈ DÙNG DUY NHẤT 1 LỆNH RETURN Ở ĐÂY
    return (
        <main className="min-h-screen bg-[#0b1121] selection:bg-cyan-500/30">
            <Navbar />
            <HeroSection />

            <div className="container mx-auto px-6 py-20">
                <h2 className="text-4xl font-black mb-12 text-center text-white tracking-tighter">
                    Sản phẩm <span className="text-cyan-400 italic">nổi bật</span>
                </h2>

                {/* 3. Logic hiển thị: Nếu mảng có phần tử thì render, không thì hiện loading */}
                {laptops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {laptops.map((laptop) => (
                            <LaptopCard key={laptop.MaSP} data={laptop} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-10 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                        🤖 AI đang kết nối với SQL Server để lấy dữ liệu...
                    </div>
                )}
            </div>
            <FloatingAIButton />
        </main>
    );

}