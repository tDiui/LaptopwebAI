"use client";

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
        <div
            className="group relative bg-slate-900/40 backdrop-blur-xl 
                       border border-white/10 
                       p-5 rounded-[2.5rem]
                       transition-all duration-500 cursor-pointer
                       hover:scale-[1.03] hover:bg-slate-900/80
                       hover:border-cyan-400/60
                       hover:shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)]"
        >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative aspect-video mb-5 overflow-hidden rounded-2xl bg-slate-950">
                <img
                    src={data.HinhAnh || "/laptop-demo.png"}
                    className="w-full h-full object-cover"
                    alt={data.TenSP}
                />

                <span className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 text-[15px] font-bold px-2 py-1 rounded-full border border-cyan-400/30">
                    AI Score: 98
                </span>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                    {data.TenSP}
                </h3>

                <div className="text-xs text-slate-400 space-y-1">
                    {data.CPU && <p>⚙️ CPU: {data.CPU}</p>}
                    {data.VGA && <p>⚡ GPU: {data.VGA}</p>}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-black text-cyan-400">
                        {data.GiaBan?.toLocaleString("vi-VN")}đ
                    </span>
                    <button className="btn-cyan text-sm">
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}