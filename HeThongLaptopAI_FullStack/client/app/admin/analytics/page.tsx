"use client";
import { useState, useEffect } from 'react';
import { Zap, Cpu, Monitor, HardDrive, BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
    // Giả lập dữ liệu Benchmark (Sau này có thể fetch từ API)
    const categoryStats = [
        { name: "Gaming", count: 128, score: 94, icon: <Zap size={20} className="text-cyan-400" /> },
        { name: "Business", count: 245, score: 87, icon: <Cpu size={20} className="text-cyan-400" /> },
        { name: "Creator", count: 156, score: 92, icon: <Monitor size={20} className="text-cyan-400" /> },
        { name: "Budget", count: 89, score: 78, icon: <HardDrive size={20} className="text-cyan-400" /> }
    ];

    const topLaptops = [
        { name: "MacBook Pro 16\"", score: 98, cpu: 98, gpu: 95, ai: 98, overall: 97, rank: 1 },
        { name: "Legion Pro 7i", score: 95, cpu: 95, gpu: 98, ai: 92, overall: 95, rank: 2 },
        { name: "XPS 15", score: 91, cpu: 90, gpu: 88, ai: 95, overall: 91, rank: 3 },
        { name: "Zephyrus G14", score: 89, cpu: 92, gpu: 85, ai: 89, overall: 89, rank: 4 },
        { name: "ThinkPad X1", score: 85, cpu: 85, gpu: 80, ai: 88, overall: 85, rank: 5 }
    ];

    return (
        <div className="space-y-6 relative pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Phân tích & Benchmark</h1>
                <p className="text-slate-400 text-sm mt-1">Đánh giá hiệu năng và so sánh sản phẩm</p>
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

                {/* 1. Biểu đồ Cột (Bar Chart) */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-8">So sánh điểm Benchmark</h2>
                    <div className="flex-1 relative">
                        {/* Lưới ngang nền */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[100, 75, 50, 25, 0].map((val) => (
                                <div key={val} className="w-full flex items-center gap-4 text-xs text-slate-500">
                                    <span className="w-6 text-right">{val}</span>
                                    <div className="flex-1 border-b border-white/5 border-dashed"></div>
                                </div>
                            ))}
                        </div>

                        {/* Các cột dữ liệu */}
                        <div className="absolute inset-0 ml-10 flex items-end justify-around pb-6 pt-2">
                            {topLaptops.map((laptop, idx) => (
                                <div key={idx} className="w-full flex flex-col justify-end items-center group relative h-full">
                                    {/* Tooltip điểm */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#1e2330] border border-white/10 text-cyan-400 text-xs font-bold px-2 py-1 rounded transition-opacity">
                                        {laptop.score}
                                    </div>
                                    <div
                                        className="w-8 md:w-12 bg-cyan-400 hover:bg-cyan-300 transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-t-sm"
                                        style={{ height: `${laptop.score}%` }}
                                    ></div>
                                    {/* Nhãn tên xoay nghiêng */}
                                    <span className="absolute -bottom-6 text-[10px] text-slate-400 -rotate-45 whitespace-nowrap translate-y-10 group-hover:text-white transition-colors">
                                        {laptop.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-16"></div> {/* Spacer cho text xoay nghiêng */}
                </div>

                {/* 2. Biểu đồ Đa chiều (Radar Chart bằng SVG thuần) */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col items-center">
                    <h2 className="text-lg font-bold text-white mb-2 w-full text-left">Phân tích đa chiều</h2>
                    <div className="w-full max-w-[400px] aspect-square relative flex items-center justify-center mt-4">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            {/* Khung mạng nhện (Webs) */}
                            {[100, 75, 50, 25].map((scale, i) => (
                                <polygon
                                    key={i}
                                    points={`
                                        200,${200 - 150 * (scale / 100)} 
                                        ${200 + 130 * (scale / 100)},${200 - 75 * (scale / 100)} 
                                        ${200 + 130 * (scale / 100)},${200 + 75 * (scale / 100)} 
                                        200,${200 + 150 * (scale / 100)} 
                                        ${200 - 130 * (scale / 100)},${200 + 75 * (scale / 100)} 
                                        ${200 - 130 * (scale / 100)},${200 - 75 * (scale / 100)}
                                    `}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Điểm số các mốc trục chéo */}
                            <text x="205" y="55" fill="#64748b" fontSize="10">100</text>
                            <text x="205" y="92" fill="#64748b" fontSize="10">75</text>
                            <text x="205" y="130" fill="#64748b" fontSize="10">50</text>
                            <text x="205" y="167" fill="#64748b" fontSize="10">25</text>

                            {/* Các đường trục (Axes) */}
                            <line x1="200" y1="200" x2="200" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="200" y1="200" x2="330" y2="125" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="200" y1="200" x2="330" y2="275" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="200" y1="200" x2="200" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="200" y1="200" x2="70" y2="275" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <line x1="200" y1="200" x2="70" y2="125" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                            {/* Vùng dữ liệu (Data Polygon) - Giả lập mức điểm trung bình */}
                            <polygon
                                points="
                                    200,65 
                                    317,133 
                                    304,260 
                                    200,320 
                                    83,265 
                                    83,135
                                "
                                fill="rgba(34,211,238,0.2)"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                className="transition-all duration-1000"
                            />

                            {/* Các đốm tròn nối điểm */}
                            <circle cx="200" cy="65" r="4" fill="#22d3ee" />
                            <circle cx="317" cy="133" r="4" fill="#22d3ee" />
                            <circle cx="304" cy="260" r="4" fill="#22d3ee" />
                            <circle cx="200" cy="320" r="4" fill="#22d3ee" />
                            <circle cx="83" cy="265" r="4" fill="#22d3ee" />
                            <circle cx="83" cy="135" r="4" fill="#22d3ee" />
                        </svg>

                        {/* Nhãn dán các trục */}
                        <div className="absolute top-0 text-xs text-slate-400 font-medium">CPU Performance</div>
                        <div className="absolute top-[30%] right-2 text-xs text-slate-400 font-medium">GPU Performance</div>
                        <div className="absolute bottom-[30%] right-6 text-xs text-slate-400 font-medium">AI Workload</div>
                        <div className="absolute bottom-2 text-xs text-slate-400 font-medium">Battery Life</div>
                        <div className="absolute bottom-[30%] left-6 text-xs text-slate-400 font-medium">Build Quality</div>
                        <div className="absolute top-[30%] left-0 text-xs text-slate-400 font-medium">Value for Money</div>
                    </div>
                </div>

            </div>

            {/* Bảng điểm chi tiết */}
            <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-lg mt-8">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <BarChart2 className="text-cyan-400" size={20} />
                    <h2 className="text-lg font-bold text-white">Bảng điểm chi tiết</h2>
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
                                    <td className="px-6 py-4 font-bold text-white">{laptop.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <ScoreBadge score={laptop.cpu} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ScoreBadge score={laptop.gpu} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ScoreBadge score={laptop.ai} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center font-black text-white px-3 py-1 rounded-full border border-white/10">
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