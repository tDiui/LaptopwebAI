"use client";
import Link from 'next/link';
import { Cpu, Zap, Star, Sparkles, Scale } from 'lucide-react';

// --- ĐỊNH NGHĨA INTERFACE CHO PROPS ---
interface ProductCardProps {
    laptop: any;
    onCompare: () => void; // Hàm xử lý thêm/xóa khỏi danh sách so sánh
    isComparing: boolean;  // Trạng thái máy đã có trong danh sách hay chưa
}

// --- HÀM BÓC TÁCH ẢNH JSON ---
const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
        const img = Array.isArray(parsed) ? parsed[0] : parsed;
        let cleanImg = img.replace(/[\[\]"]/g, '');
        return cleanImg.startsWith('http') || cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
    } catch {
        return "/laptop-demo.png";
    }
};

export default function ProductCard({ laptop, onCompare, isComparing }: ProductCardProps) {
    // Tạo điểm AI giả lập
    const mockAiScore = 90 + ((laptop.MaSP || 0) % 10);

    return (
        <div className={`bg-[#1e293b]/40 backdrop-blur-xl border rounded-[2rem] p-5 flex flex-col hover:bg-[#1e293b]/60 transition-all group shadow-lg ${isComparing ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/10'
            }`}>

            {/* Khung Ảnh */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5 mb-5 p-4 flex items-center justify-center">
                <img
                    src={parseImage(laptop.HinhAnh)}
                    alt={laptop.TenSP}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
                />

                {/* Badge AI Score */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 backdrop-blur-md text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-cyan-500/30">
                    <Sparkles size={12} /> AI SCORE: {mockAiScore}
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-grow space-y-3">
                <p className="text-cyan-500 text-[9px] font-black uppercase tracking-[0.2em]">
                    {laptop.TenDanhMuc || laptop.TenDM || laptop.HangSX || "PREMIUM LAPTOP"}
                </p>

                <h3 className="text-white text-lg font-black line-clamp-2 tracking-tight leading-tight group-hover:text-cyan-400 transition-colors h-12">
                    {laptop.TenSP}
                </h3>

                {/* Rating */}
                <div className="flex gap-1 text-yellow-500/80">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-slate-700"} />
                    ))}
                </div>

                {/* Cấu hình cơ bản */}
                <div className="grid grid-cols-1 gap-2 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                        <Cpu size={14} className="text-cyan-500/50 shrink-0" />
                        <span className="truncate">{laptop.CPU || "Đang cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                        <Zap size={14} className="text-cyan-500/50 shrink-0" />
                        <span className="truncate">{laptop.VGA || "Đang cập nhật"}</span>
                    </div>
                </div>
            </div>

            {/* Giá & Nút bấm */}
            <div className="pt-5 mt-4 border-t border-white/5 space-y-4">
                <div className="flex items-baseline justify-between">
                    <span className="text-cyan-400 text-2xl font-black tracking-tighter">
                        {new Intl.NumberFormat('vi-VN').format(laptop.GiaBan || 0)}đ
                    </span>
                </div>

                <div className="flex gap-2">
                    {/* NÚT CHI TIẾT - Chuyển trang */}
                    <Link href={`/product/${laptop.MaSP || laptop.id}`} className="flex-1">
                        <button className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                            Chi tiết
                        </button>
                    </Link>

                    {/* NÚT SO SÁNH - Chỉ xử lý logic, không chuyển trang */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onCompare();
                        }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isComparing
                                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] border-transparent'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-cyan-500/50'
                            }`}
                    >
                        <Scale size={14} />
                        {isComparing ? 'Đã thêm' : 'So sánh'}
                    </button>
                </div>
            </div>
        </div>
    );
}