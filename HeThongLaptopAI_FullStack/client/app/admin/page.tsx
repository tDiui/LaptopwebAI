"use client";
import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Laptop, Users, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        tongDoanhThu: 0,
        tongDonHang: 0,
        tongSanPham: 0,
        tongKhachHang: 0,
        donHangMoi: [],
        chartData: [] // 👉 THÊM STATE HỨNG DỮ LIỆU BIỂU ĐỒ TỪ BACKEND
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lưu ý: Nếu bro để route trong laptopRoutes, có thể URL phải là /api/laptops/admin/dashboard-stats
        fetch('http://localhost:5000/api/admin/dashboard-stats')
            .then(res => res.json())
            .then(data => {
                setStats({
                    tongDoanhThu: data.revenue || data.tongDoanhThu || 0,
                    tongDonHang: data.orders || data.tongDonHang || 0,
                    tongSanPham: data.products || data.tongSanPham || 0,
                    tongKhachHang: data.customers || data.tongKhachHang || 0,
                    donHangMoi: data.donHangMoi || [],
                    chartData: data.chartData || [] // 👉 LẤY DATA BIỂU ĐỒ
                });
                setLoading(false);
            })
            .catch(err => console.error("Lỗi tải thống kê:", err));
    }, []);

    if (loading) {
        return <div className="h-full flex items-center justify-center text-cyan-400 font-bold animate-pulse">Đang tải dữ liệu hệ thống...</div>;
    }

    // TÍNH TOÁN CHIỀU CAO TỐI ĐA CHO BIỂU ĐỒ (Để các cột co giãn chuẩn xác)
    const maxChartValue = stats.chartData.length > 0
        ? Math.max(...stats.chartData.map((d: any) => Math.max(d.traffic, d.aiRequests)))
        : 100;

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
                {/* BIỂU ĐỒ CỘT KÉP (DUAL BAR CHART) VỚI DỮ LIỆU THẬT */}
                <div className="col-span-2 bg-[#151a25] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Activity size={20} /></div>
                            <h2 className="text-lg font-bold text-white">Lưu lượng truy cập & AI Request</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Chú thích màu sắc */}
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-400"></div> Truy cập</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></div> AI Request</div>
                            </div>
                            <select className="bg-[#1e2330] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none">
                                <option>7 ngày qua</option>
                                <option>Tháng này</option>
                            </select>
                        </div>
                    </div>

                    {/* VẼ BIỂU ĐỒ */}
                    <div className="h-64 flex items-end justify-between gap-1 md:gap-4 pt-4 border-b border-white/5 relative">
                        {stats.chartData && stats.chartData.length > 0 ? stats.chartData.map((day: any, i: number) => {
                            // Tính toán chiều cao linh hoạt theo phần trăm
                            const trafficHeight = maxChartValue > 0 ? (day.traffic / maxChartValue) * 100 : 0;
                            const aiHeight = maxChartValue > 0 ? (day.aiRequests / maxChartValue) * 100 : 0;

                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                                    {/* Tooltip hiển thị thông số khi di chuột vào cột */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-[#1e2330] border border-white/10 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 pointer-events-none transition-opacity flex flex-col gap-1 shadow-xl">
                                        <div className="text-white font-black border-b border-white/10 pb-1 mb-1">{day.name}</div>
                                        <span className="text-purple-400 font-bold">Lượt truy cập: {day.traffic}</span>
                                        <span className="text-cyan-400 font-bold">AI Xử lý: {day.aiRequests}</span>
                                    </div>

                                    {/* Cột Kép */}
                                    <div className="flex items-end justify-center gap-1 w-full h-full">
                                        {/* Cột Truy cập (Màu Tím) */}
                                        <div
                                            className="w-1/2 max-w-[20px] bg-gradient-to-t from-purple-500/20 to-purple-400/80 rounded-t-md group-hover:to-purple-300 transition-all duration-700 min-h-[4px]"
                                            style={{ height: `${trafficHeight}%` }}
                                        ></div>

                                        {/* Cột AI Request (Màu Xanh Cyan) */}
                                        <div
                                            className="w-1/2 max-w-[20px] bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-md group-hover:to-cyan-300 transition-all duration-700 min-h-[4px]"
                                            style={{ height: `${aiHeight}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Chưa có dữ liệu tracking</div>
                        )}
                    </div>

                    {/* Nhãn trục X (T2, T3, T4...) */}
                    <div className="flex justify-between text-xs text-slate-500 mt-4 px-2 font-medium">
                        {stats.chartData && stats.chartData.length > 0
                            ? stats.chartData.map((day: any, i: number) => <span key={i} className="flex-1 text-center">{day.name}</span>)
                            : <><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></>
                        }
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
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
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