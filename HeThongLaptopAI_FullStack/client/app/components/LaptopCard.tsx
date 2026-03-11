"use client";

import Link from "next/link";

interface Laptop {
    MaSP: number;
    TenSP: string;
    GiaBan: number;
    HinhAnh?: string;
    CPU?: string;
    RAM?: string;
    O_Cung?: string;
    VGA?: string;
    ManHinh?: string;
    TrongLuong?: number;
    MoTa?: string;
    TrangThai?: boolean;
}

interface LaptopCardProps {
    data: Laptop;
}

export default function LaptopCard({ data }: LaptopCardProps) {
    return (
        /* 1. Wrap toàn bộ Card bằng Link để bấm vào đâu cũng chuyển trang */
        <Link href={`/product/${data.MaSP}`} className="block group">
            <div
                className="relative bg-slate-900/40 backdrop-blur-xl 
                           border border-white/10 
                           p-5 rounded-[2.5rem]
                           transition-all duration-500 cursor-pointer
                           hover:scale-[1.03] hover:bg-slate-900/80
                           hover:border-cyan-400/60
                           hover:shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)]"
            >
                {/* Hiệu ứng tia sáng chạy quanh viền khi hover */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Khung ảnh sản phẩm */}
                <div className="relative aspect-video mb-5 overflow-hidden rounded-2xl bg-slate-950">
                    <img
                        src={data.HinhAnh || "/laptop-demo.png"} // Đảm bảo file này có trong folder public
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={data.TenSP}
                    />

                    {/* Badge AI Score */}
                    <span className="absolute top-3 right-3 bg-cyan-500/20 backdrop-blur-md text-cyan-400 text-[12px] font-bold px-3 py-1 rounded-full border border-cyan-400/30">
                        AI Score: 98
                    </span>
                </div>

                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {data.TenSP}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-1">
                        {data.CPU && <p>⚙️ CPU: {data.CPU}</p>}
                        {data.VGA && <p>⚡ GPU: {data.VGA}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-black text-cyan-400 tracking-tighter">
                            {typeof data.GiaBan === "number"
                                ? data.GiaBan.toLocaleString("vi-VN") + "đ"
                                : "—"}
                        </span>

                        {/* 2. Chuyển nút bấm thành thẻ span để không bị lỗi lồng thẻ 'a' trong 'a' */}
                        <span
                            className="bg-cyan-400 group-hover:bg-cyan-300 text-slate-950 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                        >
                            Xem chi tiết
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}