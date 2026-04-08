"use client";
import Link from 'next/link';
import { Cpu, Zap, Star, Sparkles } from 'lucide-react';

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

export default function ProductCard({ laptop }: { laptop: any }) {
    // Tạo điểm AI giả lập cho ngầu
    const mockAiScore = 90 + ((laptop.MaSP || 0) % 10);

    return (
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col hover:border-cyan-500/50 transition-all group shadow-lg">

            {/* Khung Ảnh */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5 mb-5 p-4 flex items-center justify-center">
                <img
                    src={parseImage(laptop.HinhAnh)} // ĐÃ CẬP NHẬT HÀM PARSE IMAGE Ở ĐÂY
                    alt={laptop.TenSP}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
                />

                {/* Badge AI Score */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 backdrop-blur-md text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-cyan-500/30">
                    <Sparkles size={12} /> AI Score: {mockAiScore}
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-grow space-y-3">
                <p className="text-cyan-500 text-[10px] font-black uppercase tracking-widest">
                    {laptop.TenDanhMuc || laptop.TenDM || laptop.HangSX || "LAPTOP"}
                </p>

                <h3 className="text-white text-lg font-black line-clamp-2 tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
                    {laptop.TenSP}
                </h3>

                {/* Rating */}
                <div className="flex gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-slate-600"} />
                    ))}
                </div>

                {/* Cấu hình cơ bản */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                    {laptop.CPU && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Cpu size={14} className="text-cyan-500/70 shrink-0" />
                            <span className="truncate">CPU: {laptop.CPU}</span>
                        </div>
                    )}
                    {laptop.VGA && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Zap size={14} className="text-cyan-500/70 shrink-0" />
                            <span className="truncate">GPU: {laptop.VGA}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Giá & Nút bấm */}
            <div className="pt-5 mt-4 border-t border-white/5 flex items-end justify-between">
                <div>
                    <span className="text-cyan-400 text-xl font-black tracking-tighter">
                        {new Intl.NumberFormat('vi-VN').format(laptop.GiaBan || 0)}đ
                    </span>
                </div>
                <Link href={`/product/${laptop.MaSP || laptop.id}`}>
                    <button className="bg-white/5 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-white/10 hover:border-transparent group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        CHI TIẾT
                    </button>
                </Link>
            </div>

        </div>
    );
}