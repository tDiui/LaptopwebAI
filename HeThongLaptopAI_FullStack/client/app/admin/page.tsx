"use client";
import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Laptop, Users, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        tongDoanhThu: 0,
        tongDonHang: 0,
        tongSanPham: 0,
        tongKhachHang: 0,
        donHangMoi: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/admin/dashboard-stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => console.error("Lỗi tải thống kê:", err));
    }, []);

    if (loading) {
        return <div className="h-full flex items-center justify-center text-cyan-400 font-bold animate-pulse">Đang tải dữ liệu hệ thống...</div>;
    }

    return (
        <div className="space-y-8 relative pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Tổng quan hệ thống</h1>
                <p className="text-slate-400 text-sm mt-1">Theo dõi các chỉ số quan trọng của cửa hàng AI Laptop</p>
            </div>

            {/* Thẻ Thống Kê (Stats Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng doanh thu"
                    value={`${Number(stats.tongDoanhThu).toLocaleString('vi-VN')}đ`}
                    icon={<DollarSign size={22} className="text-emerald-400" />}
                    colorClass="bg-emerald-500/10 border-emerald-500/20"
                    trend="+12.5%"
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats.tongDonHang}
                    icon={<ShoppingBag size={22} className="text-blue-400" />}
                    colorClass="bg-blue-500/10 border-blue-500/20"
                    trend="+5.2%"
                />
                <StatCard
                    title="Sản phẩm trong kho"
                    value={stats.tongSanPham}
                    icon={<Laptop size={22} className="text-purple-400" />}
                    colorClass="bg-purple-500/10 border-purple-500/20"
                />
                <StatCard
                    title="Khách hàng"
                    value={stats.tongKhachHang}
                    icon={<Users size={22} className="text-cyan-400" />}
                    colorClass="bg-cyan-500/10 border-cyan-500/20"
                    trend="+18.1%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Biểu đồ giả lập (Mock Chart) để làm đẹp UI */}
                <div className="col-span-2 bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Activity size={20} /></div>
                            <h2 className="text-lg font-bold text-white">Lưu lượng truy cập & AI Request</h2>
                        </div>
                        <select className="bg-[#1e2330] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none">
                            <option>7 ngày qua</option>
                            <option>Tháng này</option>
                        </select>
                    </div>
                    {/* Vẽ biểu đồ dạng cột đơn giản bằng Tailwind */}
                    <div className="h-64 flex items-end justify-between gap-2 md:gap-6 pt-4 border-b border-white/5">
                        {[40, 70, 45, 90, 65, 85, 110].map((height, i) => (
                            <div key={i} className="w-full flex flex-col justify-end items-center group cursor-pointer">
                                <div className="text-cyan-400 opacity-0 group-hover:opacity-100 text-[10px] font-bold mb-2 transition-opacity">{height * 12}</div>
                                <div
                                    className="w-full bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-md hover:to-cyan-300 transition-all duration-500 relative"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-4 px-2 font-medium">
                        <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                    </div>
                </div>

                {/* Đơn hàng gần đây */}
                <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white">Đơn hàng mới</h2>
                        <button className="text-xs text-cyan-400 font-bold hover:underline">Xem tất cả</button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {stats.donHangMoi && stats.donHangMoi.length > 0 ? (
                            stats.donHangMoi.map((order: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#1e2330] border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-white">{order.HoTen || 'Khách hàng'}</span>
                                        <span className="text-xs text-slate-400">{new Date(order.NgayDat).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-cyan-400">+{Number(order.TongTien).toLocaleString('vi-VN')}đ</span>
                                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            {order.TrangThai || 'Mới'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                                Chưa có đơn hàng nào.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component Thẻ thống kê
function StatCard({ title, value, icon, colorClass, trend }: any) {
    return (
        <div className="bg-[#151a25] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl border ${colorClass}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <ArrowUpRight size={14} /> {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <div className="text-slate-400 text-sm font-medium mb-1">{title}</div>
                <div className="text-3xl font-black text-white">{value}</div>
            </div>
        </div>
    );
}