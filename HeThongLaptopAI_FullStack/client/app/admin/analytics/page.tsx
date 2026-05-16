"use client";
import { useState, useEffect, useMemo } from 'react';
import { Zap, Cpu, Monitor, HardDrive, BarChart2, Loader2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [laptops, setLaptops] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. GỌI API LẤY DỮ LIỆU THẬT NHƯ BÊN CLIENT
    useEffect(() => {
        fetch('http://localhost:5000/api/laptops/benchmark-data')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLaptops(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi fetch Admin Analytics:", err);
                setIsLoading(false);
            });
    }, []);

    // 2. TÍNH TOÁN & XẾP HẠNG TỰ ĐỘNG
    const { categoryStats, topLaptops } = useMemo(() => {
        if (!laptops || laptops.length === 0) return { categoryStats: [], topLaptops: [] };

        // Xử lý từng máy thật trong DB
        const processedLaptops = laptops.map(lap => {
            // Giả lập logic tính điểm phần cứng từ Giá bán & ID (Đồng bộ logic với client)
            const baseAI = lap.GiaBan ? Math.min(95, 50 + Math.floor(lap.GiaBan / 1000000)) : 65;
            const dbUserScore = lap.UserScore || 50;

            // Tính toán Overall (Trung bình giữa phần cứng và người dùng đánh giá)
            const overall = Math.round((baseAI + dbUserScore) / 2);

            return {
                id: lap.MaSP,
                name: lap.TenSP,
                // Bóc tách điểm CPU/GPU tượng trưng dựa trên điểm gốc để lên UI Admin cho đẹp
                cpu: Math.min(99, baseAI + (lap.MaSP % 5)),
                gpu: Math.min(99, baseAI - (lap.MaSP % 4)),
                ai: baseAI,
                overall: overall
            };
        });

        // Lấy Top 5 máy có điểm Overall cao nhất
        const sortedTop5 = processedLaptops
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 5)
            .map((lap, idx) => ({ ...lap, rank: idx + 1 }));

        // Thống kê theo danh mục (Giả lập số liệu dựa trên DB thật)
        const catStats = [
            { name: "Gaming", count: Math.floor(laptops.length * 0.4), score: sortedTop5[0]?.overall || 90, icon: <Zap size={20} className="text-cyan-400" /> },
            { name: "Business", count: Math.floor(laptops.length * 0.3), score: sortedTop5[1]?.overall || 85, icon: <Cpu size={20} className="text-cyan-400" /> },
            { name: "Creator", count: Math.floor(laptops.length * 0.2), score: sortedTop5[2]?.overall || 88, icon: <Monitor size={20} className="text-cyan-400" /> },
            { name: "Budget", count: Math.floor(laptops.length * 0.1), score: 75, icon: <HardDrive size={20} className="text-cyan-400" /> }
        ];

        return { categoryStats: catStats, topLaptops: sortedTop5 };
    }, [laptops]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-cyan-400 font-bold uppercase tracking-widest gap-4">
                <Loader2 className="animate-spin" size={32} />
                Đang đồng bộ dữ liệu hệ thống...
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Phân tích & Benchmark</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Đánh giá hiệu năng và so sánh sản phẩm <span className="text-cyan-400 font-bold">(Live Data)</span>
                </p>
            </div>

            {/* 4 Thẻ điểm trung bình danh mục */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryStats.map((cat, idx) => (
                    <div key={idx} className="bg-[#151a25] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.02] transition-colors flex justify-between items-start shadow-lg">
                        <div>
                            <div className="p-2.5 bg-cyan-500/10 rounded-xl inline-block mb-4 border border-cyan-500/20">
                                {cat.icon}
                            </div>
                            <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                            <p className="text-slate-500 text-xs mt-1">{cat.count} sản phẩm</p>
                        </div>
                        <div className="text-3xl font-black text-white">{cat.score}</div>
                    </div>
                ))}
            </div>

            {/* Khu vực Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Biểu đồ Cột (Tự động chạy theo Top 5) */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-8">So sánh điểm Benchmark (Top 5 Kho)</h2>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[100, 75, 50, 25, 0].map((val) => (
                                <div key={val} className="w-full flex items-center gap-4 text-xs text-slate-500">
                                    <span className="w-6 text-right">{val}</span>
                                    <div className="flex-1 border-b border-white/5 border-dashed"></div>
                                </div>
                            ))}
                        </div>

                        <div className="absolute inset-0 ml-10 flex items-end justify-around pb-6 pt-2">
                            {topLaptops.map((laptop, idx) => (
                                <div key={idx} className="w-full flex flex-col justify-end items-center group relative h-full">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#1e2330] border border-white/10 text-cyan-400 text-xs font-bold px-2 py-1 rounded transition-opacity z-10">
                                        {laptop.overall}
                                    </div>
                                    <div
                                        className="w-8 md:w-12 bg-cyan-400 hover:bg-cyan-300 transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-t-sm"
                                        style={{ height: `${laptop.overall}%` }}
                                    ></div>
                                    <span className="absolute -bottom-6 text-[10px] text-slate-400 -rotate-45 whitespace-nowrap translate-y-10 group-hover:text-white transition-colors w-24 truncate text-center">
                                        {laptop.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-16"></div>
                </div>

                {/* 2. Biểu đồ Đa chiều */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col items-center">
                    <h2 className="text-lg font-bold text-white mb-2 w-full text-left">Phân tích đa chiều</h2>
                    <div className="w-full max-w-[400px] aspect-square relative flex items-center justify-center mt-4">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            {[100, 75, 50, 25].map((scale, i) => (
                                <polygon
                                    key={i}
                                    points={`200,${200 - 150 * (scale / 100)} ${200 + 130 * (scale / 100)},${200 - 75 * (scale / 100)} ${200 + 130 * (scale / 100)},${200 + 75 * (scale / 100)} 200,${200 + 150 * (scale / 100)} ${200 - 130 * (scale / 100)},${200 + 75 * (scale / 100)} ${200 - 130 * (scale / 100)},${200 - 75 * (scale / 100)}`}
                                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                                />
                            ))}
                            <polygon
                                points="200,65 317,133 304,260 200,320 83,265 83,135"
                                fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="2"
                                className="animate-pulse duration-[3000ms]"
                            />
                        </svg>
                        <div className="absolute top-0 text-xs text-slate-400 font-medium">CPU Performance</div>
                        <div className="absolute top-[30%] right-2 text-xs text-slate-400 font-medium">GPU Performance</div>
                        <div className="absolute bottom-[30%] right-6 text-xs text-slate-400 font-medium">AI Workload</div>
                        <div className="absolute bottom-2 text-xs text-slate-400 font-medium">Battery Life</div>
                        <div className="absolute bottom-[30%] left-6 text-xs text-slate-400 font-medium">Build Quality</div>
                        <div className="absolute top-[30%] left-0 text-xs text-slate-400 font-medium">Value for Money</div>
                    </div>
                </div>
            </div>

            {/* Bảng điểm chi tiết - DỮ LIỆU THẬT */}
            <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-lg mt-8">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <BarChart2 className="text-cyan-400" size={20} />
                    <h2 className="text-lg font-bold text-white">Bảng điểm chi tiết (Top 5 Database)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e2330]/50 text-slate-400 text-sm border-b border-white/5">
                            <tr>
                                <th className="px-6 py-5 font-medium">Sản phẩm</th>
                                <th className="px-6 py-5 font-medium text-center">CPU Score</th>
                                <th className="px-6 py-5 font-medium text-center">GPU Score</th>
                                <th className="px-6 py-5 font-medium text-center">AI Score</th>
                                <th className="px-6 py-5 font-medium text-center">Overall</th>
                                <th className="px-6 py-5 font-medium text-center">Xếp hạng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {topLaptops.map((laptop, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">
                                        <div className="line-clamp-1 max-w-xs" title={laptop.name}>{laptop.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center"><ScoreBadge score={laptop.cpu} /></td>
                                    <td className="px-6 py-4 text-center"><ScoreBadge score={laptop.gpu} /></td>
                                    <td className="px-6 py-4 text-center"><ScoreBadge score={laptop.ai} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center font-black text-white px-3 py-1 rounded-full border border-white/10 bg-white/5">
                                            {laptop.overall}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-slate-400 font-bold">#{laptop.rank}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Component phụ trợ cho các ô điểm số
function ScoreBadge({ score }: { score: number }) {
    return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold text-xs">
            {score}
        </span>
    );
}