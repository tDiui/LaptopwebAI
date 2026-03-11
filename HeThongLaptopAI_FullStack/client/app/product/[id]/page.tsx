"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Cpu, Zap, Monitor, Weight, HardDrive, ShieldCheck, ChevronLeft } from 'lucide-react';
// Sửa lỗi import Navbar theo đúng cấu trúc thư mục của bro
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function ProductDetail() {
    const { id } = useParams();
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        // Gọi API lấy dữ liệu thực tế từ Backend dựa trên ID
        fetch(`http://localhost:5000/api/laptops/${id}`)
            .then(res => res.json())
            .then(data => setItem(data))
            .catch(err => console.error("Lỗi fetch chi tiết:", err));
    }, [id]);

    if (!item) return (
        <div className="min-h-screen bg-[#0b1121] flex items-center justify-center text-cyan-400 font-black tracking-widest">
            🤖 AI ĐANG TRÍCH XUẤT DỮ LIỆU...
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0b1121] text-slate-300 selection:bg-cyan-500/30">
            {/* Navbar kính mờ đồng bộ */}
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <Link href="/" className="flex items-center text-slate-500 hover:text-cyan-400 mb-10 transition-all w-fit group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-widest ml-2">Quay lại danh sách</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Cột 1: Hình ảnh & Hiệu ứng Glow */}
                    <div className="relative group">
                        {/* Quầng sáng Neon phía sau ảnh */}
                        <div className="absolute -inset-4 bg-cyan-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>

                        <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden p-12">
                            <img
                                src={item.HinhAnh || "/laptop-demo.png"} // Đảm bảo ảnh đã có trong folder public
                                alt={item.TenSP}
                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700"
                            />
                            {/* Badge AI Verified chuẩn thiết kế */}
                            <div className="absolute top-8 right-8 bg-cyan-500/20 backdrop-blur-md text-cyan-400 text-[10px] font-black px-4 py-2 rounded-full border border-cyan-500/30 shadow-lg tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" /> AI VERIFIED
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Thông tin chi tiết & Cấu hình */}
                    <div className="space-y-10">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-tight">{item.TenSP}</h1>
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-black text-cyan-400 tracking-tighter">
                                    {new Intl.NumberFormat('vi-VN').format(item.GiaBan)}đ
                                </p>
                                <span className="text-[10px] font-bold bg-white/5 text-slate-500 px-3 py-1 rounded-lg border border-white/5">TRẢ GÓP 0%</span>
                            </div>
                        </div>

                        {/* Thông số kỹ thuật dạng Card nhỏ */}
                        <div className="grid grid-cols-2 gap-4">
                            <SpecItem icon={<Cpu size={20} />} label="Vi xử lý" value={item.CPU} />
                            <SpecItem icon={<Zap size={20} />} label="Đồ họa" value={item.VGA} />
                            <SpecItem icon={<HardDrive size={20} />} label="Bộ nhớ" value={item.RAM} />
                            <SpecItem icon={<Monitor size={20} />} label="Màn hình" value={item.ManHinh} />
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Chi tiết AI Review</h3>
                            <p className="text-slate-400 leading-relaxed text-sm bg-white/5 p-6 rounded-3xl border border-white/5 italic">
                                "{item.MoTa || "Dữ liệu mô tả của trợ lý AI đang được cập nhật từ hệ thống..."}"
                            </p>
                        </div>

                        <button className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 py-5 rounded-[1.5rem] font-black text-sm transition-all shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] active:scale-95 uppercase tracking-widest">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

function SpecItem({ icon, label, value }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-[1.8rem] flex flex-col gap-3 hover:border-cyan-500/30 transition-all group">
            <div className="text-cyan-400 group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{value || "N/A"}</div>
            </div>
        </div>
    );
}