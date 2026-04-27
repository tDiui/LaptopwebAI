"use client";
import { useEffect, useState } from 'react';
import {
    ChevronLeft, Scale, Zap, Cpu, MemoryStick as Ram,
    CheckCircle2, Trash2, Sparkles, CreditCard, Monitor, HardDrive, Weight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ComparisonPage() {
    // KHỞI TẠO LÀ MẢNG RỖNG ĐỂ TRÁNH LỖI .MAP
    const [compareList, setCompareList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Lấy dữ liệu thực tế từ Database
    useEffect(() => {
        const loadCompareData = async () => {
            try {
                const saved = localStorage.getItem('compareList');
                if (!saved) {
                    setLoading(false);
                    return;
                }

                const localItems = JSON.parse(saved);
                // Đảm bảo localItems là mảng
                if (!Array.isArray(localItems) || localItems.length === 0) {
                    setLoading(false);
                    return;
                }

                const ids = localItems.map((item: any) => item.MaSP).join(',');

                const res = await fetch(`http://localhost:5000/api/laptops/compare?ids=${ids}`);
                const data = await res.json();

                // KIỂM TRA DỮ LIỆU TRẢ VỀ CÓ PHẢI MẢNG KHÔNG
                if (Array.isArray(data)) {
                    setCompareList(data);
                } else {
                    console.error("Dữ liệu API không phải mảng:", data);
                    setCompareList([]);
                }
            } catch (err) {
                console.error("Lỗi truy xuất dữ liệu:", err);
                setCompareList([]);
            } finally {
                setLoading(false);
            }
        };

        loadCompareData();
    }, []);

    const removeFromCompare = (id: number) => {
        setCompareList((prev) => {
            const newList = Array.isArray(prev) ? prev.filter(item => item.MaSP !== id) : [];
            localStorage.setItem('compareList', JSON.stringify(newList));
            return newList;
        });
    };

    // 2. Định nghĩa các hàng so sánh (Khớp 100% với DB của bro)
    const criteria = [
        { label: 'Giá thành', key: 'GiaBan', icon: <CreditCard size={18} />, better: 'lower', unit: '₫' },
        { label: 'Màn hình', key: 'ManHinh', icon: <Monitor size={18} />, better: 'text', unit: '' },
        { label: 'Bộ xử lý (CPU)', key: 'CPU', icon: <Cpu size={18} />, better: 'text', unit: '' },
        { label: 'Đồ họa (VGA)', key: 'VGA', icon: <Zap size={18} />, better: 'text', unit: '' },
        { label: 'Bộ nhớ (RAM)', key: 'RAM', icon: <Ram size={18} />, better: 'text', unit: '' },
        { label: 'Ổ cứng', key: 'O_Cung', icon: <HardDrive size={18} />, better: 'text', unit: '' },
        { label: 'Trọng lượng', key: 'TrongLuong', icon: <Weight size={18} />, better: 'lower', unit: ' kg' },
    ];

    // 3. Logic tìm "Winner"
    const isWinner = (val: any, key: string, better: string) => {
        if (better === 'text' || !Array.isArray(compareList) || compareList.length < 2) return false;

        const extractNum = (v: any) => {
            if (typeof v === 'number') return v;
            if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
            return 0;
        };

        const values = compareList.map(p => extractNum(p[key]));
        const currentVal = extractNum(val);

        if (better === 'higher') return currentVal === Math.max(...values) && currentVal !== 0;
        if (better === 'lower') return currentVal === Math.min(...values) && currentVal !== 0;
        return false;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#080d17] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cyan-400 font-black tracking-widest text-xs uppercase">Đang đồng bộ thực thể...</p>
            </div>
        </div>
    );

    if (!Array.isArray(compareList) || compareList.length === 0) {
        return (
            <main className="min-h-screen bg-[#080d17] text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40">
                    <Scale size={80} className="text-slate-800 mb-6" />
                    <h2 className="text-xl font-black uppercase text-slate-500 tracking-tighter">Danh sách so sánh trống</h2>
                    <Link href="/products" className="mt-8 bg-cyan-500 text-slate-950 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">Quay lại chọn máy</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#080d17] text-white pb-20 selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto max-w-7xl px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/5 pb-10">
                    <div>
                        <Link href="/products" className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-6 hover:text-white transition-colors">
                            <ChevronLeft size={14} /> Quay lại danh sách
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                            So sánh <span className="text-cyan-400">Laptop</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => { setCompareList([]); localStorage.removeItem('compareList'); }}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all w-fit"
                    >
                        Xóa tất cả dữ liệu
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* --- CỘT TIÊU CHÍ (Labels) --- */}
                    <div className="lg:w-1/5 space-y-4 pt-[320px] hidden lg:block">
                        {criteria.map((item) => (
                            <div key={item.key} className="h-24 flex items-center gap-4 bg-slate-900/40 border border-white/5 rounded-3xl px-6 text-slate-400 shadow-inner">
                                <div className="text-cyan-500 bg-cyan-500/10 p-2.5 rounded-xl">{item.icon}</div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* --- DANH SÁCH SẢN PHẨM --- */}
                    <div className="flex-1 flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
                        {Array.isArray(compareList) && compareList.map((laptop) => (
                            <div key={laptop.MaSP} className="min-w-[320px] flex-1 space-y-4 snap-start">
                                {/* Card Đầu trang */}
                                <div className="bg-[#1e293b]/30 border border-white/10 rounded-[3rem] p-10 text-center relative group hover:border-cyan-500/30 transition-all">
                                    <button
                                        onClick={() => removeFromCompare(laptop.MaSP)}
                                        className="absolute top-6 right-6 text-slate-600 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-full"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="h-44 flex items-center justify-center mb-8">
                                        <img
                                            src={parseImage(laptop.HinhAnh)}
                                            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                                            alt={laptop.TenSP}
                                        />
                                    </div>
                                    <p className="text-cyan-500 text-[10px] font-black tracking-[0.2em] uppercase mb-3">{laptop.HangSX || 'AI LAPTOP'}</p>
                                    <h3 className="text-lg font-black tracking-tight leading-tight uppercase h-14 line-clamp-2">{laptop.TenSP}</h3>
                                </div>

                                {/* Thông số chi tiết */}
                                {criteria.map((c) => {
                                    const winner = isWinner(laptop[c.key], c.key, c.better);
                                    const value = laptop[c.key];

                                    return (
                                        <div
                                            key={c.key}
                                            className={`h-24 flex flex-col justify-center px-8 rounded-[2rem] border transition-all duration-500 ${winner
                                                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[inset_0_0_30px_rgba(34,211,238,0.05)]'
                                                    : 'bg-slate-900/20 border-white/5'
                                                }`}
                                        >
                                            <div className="lg:hidden text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{c.label}</div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm font-black tracking-tighter ${winner ? 'text-cyan-400' : 'text-slate-300'}`}>
                                                    {c.key === 'GiaBan'
                                                        ? new Intl.NumberFormat('vi-VN').format(value || 0)
                                                        : (value || 'N/A')}
                                                    {c.unit}
                                                </span>
                                                {winner && <CheckCircle2 size={18} className="text-cyan-400 animate-pulse" />}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Action */}
                                <Link href={`/product/${laptop.MaSP}`} className="block">
                                    <button className="w-full bg-cyan-500/5 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                        Xem chi tiết cấu hình
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- HELPER PARSE ẢNH ---
const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
        const img = Array.isArray(parsed) ? parsed[0] : parsed;
        let cleanImg = img.replace(/[\[\]"]/g, '');
        return cleanImg.startsWith('http') || cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
    } catch { return "/laptop-demo.png"; }
};