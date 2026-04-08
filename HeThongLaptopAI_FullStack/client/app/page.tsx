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

    // --- STATE CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Đẹp nhất cho lưới 3 cột (2 hàng)

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

    // --- TOÁN HỌC PHÂN TRANG ---
    const totalPages = Math.ceil(laptops.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Cắt mảng sản phẩm lấy đúng 6 cái cho trang hiện tại
    const currentLaptops = laptops.slice(indexOfFirstItem, indexOfLastItem);

    // Hàm chuyển trang kèm hiệu ứng cuộn mượt mà
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Cuộn lên vừa tầm chữ "Sản phẩm nổi bật"
        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {/* DÙNG currentLaptops ĐỂ RENDER THAY VÌ laptops GỐC */}
                            {currentLaptops.map((laptop) => (
                                <LaptopCard key={laptop.MaSP} data={laptop} />
                            ))}
                        </div>

                        {/* --- GIAO DIỆN THANH PHÂN TRANG --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-16">
                                {/* Nút Trước */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2330] border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>

                                {/* Các số trang */}
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Rút gọn trang bằng dấu ... nếu quá dài
                                    if (totalPages > 5 && (page < currentPage - 1 || page > currentPage + 1) && page !== 1 && page !== totalPages) {
                                        if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-2 text-slate-500">...</span>;
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => paginate(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${currentPage === page ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#1e2330] border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/50'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                {/* Nút Sau */}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2330] border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        )}
                    </>
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