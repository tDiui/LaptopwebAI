//"use client";
//import { useState, useEffect } from 'react';
//import { DollarSign, ShoppingCart, Users, ShieldAlert, TrendingUp, Activity } from 'lucide-react';

//export default function DashboardPage() {
//    const [stats, setStats] = useState({
//        TotalRevenue: 0,
//        TotalOrders: 0,
//        TotalCustomers: 0,
//        SpamBlocked: 0
//    });
//    const [loading, setLoading] = useState(true);

//    useEffect(() => {
//        // Gọi API lấy thống kê
//        fetch('http://localhost:5000/api/admin/stats')
//            .then(res => res.json())
//            .then(data => {
//                setStats({
//                    TotalRevenue: data.TotalRevenue || 0,
//                    TotalOrders: data.TotalOrders || 0,
//                    TotalCustomers: data.TotalCustomers || 0,
//                    SpamBlocked: data.SpamBlocked || 0
//                });
//                setLoading(false);
//            })
//            .catch(err => {
//                console.error("Lỗi tải thống kê:", err);
//                setLoading(false);
//            });
//    }, []);

//    // Mảng cấu hình các thẻ (Card) thống kê để render cho gọn
//    const statCards = [
//        {
//            title: "Tổng Doanh Thu",
//            value: `${Number(stats.TotalRevenue).toLocaleString('vi-VN')}đ`,
//            icon: <DollarSign size={24} className="text-emerald-400" />,
//            bgColor: "bg-emerald-500/10",
//            trend: "+12.5%",
//            trendColor: "text-emerald-400"
//        },
//        {
//            title: "Tổng Đơn Hàng",
//            value: stats.TotalOrders.toLocaleString('vi-VN'),
//            icon: <ShoppingCart size={24} className="text-cyan-400" />,
//            bgColor: "bg-cyan-500/10",
//            trend: "+5.2%",
//            trendColor: "text-emerald-400"
//        },
//        {
//            title: "Tổng Khách Hàng",
//            value: stats.TotalCustomers.toLocaleString('vi-VN'),
//            icon: <Users size={24} className="text-blue-400" />,
//            bgColor: "bg-blue-500/10",
//            trend: "+18 mới",
//            trendColor: "text-emerald-400"
//        },
//        {
//            title: "AI Chặn Spam",
//            value: stats.SpamBlocked.toLocaleString('vi-VN'),
//            icon: <ShieldAlert size={24} className="text-rose-400" />,
//            bgColor: "bg-rose-500/10",
//            trend: "An toàn",
//            trendColor: "text-emerald-400"
//        }
//    ];

//    return (
//        <div className="space-y-8 relative">
//            {/* Header */}
//            <div className="flex justify-between items-end">
//                <div>
//                    <h1 className="text-3xl font-black text-white">Dashboard Tổng Quan</h1>
//                    <p className="text-slate-500 text-sm mt-1">Hoạt động kinh doanh và kiểm duyệt AI</p>
//                </div>
//                <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-xl font-bold">
//                    <Activity size={16} className="animate-pulse" />
//                    Hệ thống đang hoạt động
//                </div>
//            </div>

//            {/* Lưới các thẻ Thống kê (Grid) */}
//            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                {statCards.map((card, index) => (
//                    <div
//                        key={index}
//                        className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden group"
//                    >
//                        {/* Hiệu ứng ánh sáng góc thẻ */}
//                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>

//                        <div className="flex justify-between items-start mb-4">
//                            <div className={`p-4 rounded-2xl ${card.bgColor}`}>
//                                {card.icon}
//                            </div>
//                            <div className={`flex items-center gap-1 text-sm font-bold ${card.trendColor}`}>
//                                <TrendingUp size={14} />
//                                {card.trend}
//                            </div>
//                        </div>

//                        <div>
//                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.title}</p>
//                            <h3 className="text-3xl font-black text-white">
//                                {loading ? "..." : card.value}
//                            </h3>
//                        </div>
//                    </div>
//                ))}
//            </div>

//            {/* Khu vực có thể thêm biểu đồ (Chart) sau này */}
//            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 h-96 flex flex-col items-center justify-center text-slate-500">
//                    <Activity size={48} className="mb-4 opacity-20" />
//                    <p className="font-bold">Khu vực hiển thị Biểu đồ Doanh Thu</p>
//                    <p className="text-sm">Có thể tích hợp thư viện Recharts hoặc Chart.js vào đây</p>
//                </div>
//                <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 h-96 flex flex-col items-center justify-center text-slate-500">
//                    <ShieldAlert size={48} className="mb-4 opacity-20" />
//                    <p className="font-bold">Log kiểm duyệt AI</p>
//                    <p className="text-sm text-center mt-2">Danh sách các đơn hàng hoặc benchmark bị AI đánh dấu rủi ro cao sẽ hiển thị tại đây.</p>
//                </div>
//            </div>
//        </div>
//    );
//}




//"use client";
//import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
//import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

//// Dữ liệu giả lập cho biểu đồ
//const data = [
//    { name: 'T1', doanhThu: 45, donHang: 120 },
//    { name: 'T2', doanhThu: 52, donHang: 145 },
//    { name: 'T3', doanhThu: 48, donHang: 130 },
//    { name: 'T4', doanhThu: 61, donHang: 168 },
//    { name: 'T5', doanhThu: 55, donHang: 150 },
//    { name: 'T6', doanhThu: 67, donHang: 185 },
//];

//export default function DashboardPage() {
//    return (
//        <div className="space-y-8">
//            <div>
//                <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
//                <p className="text-slate-500 text-sm">Tổng quan hoạt động kinh doanh</p>
//            </div>

//            {/* 4 Thẻ thống kê hàng đầu */}
//            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                <StatCard title="Tổng doanh thu" value="58.7 tỷ" percent="+12.5%" icon={<DollarSign />} color="text-cyan-400" />
//                <StatCard title="Đơn hàng" value="1,245" percent="+8.2%" icon={<ShoppingCart />} color="text-blue-400" />
//                <StatCard title="Khách hàng" value="856" percent="+15.3%" icon={<Users />} color="text-purple-400" />
//                <StatCard title="Tăng trưởng" value="23.1%" percent="+4.1%" icon={<TrendingUp />} color="text-green-400" />
//            </div>

//            {/* Khu vực biểu đồ */}
//            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                <ChartContainer title="Doanh thu theo tháng">
//                    <ResponsiveContainer width="100%" height={250}>
//                        <LineChart data={data}>
//                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
//                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
//                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
//                            <Line type="monotone" dataKey="doanhThu" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
//                        </LineChart>
//                    </ResponsiveContainer>
//                </ChartContainer>

//                <ChartContainer title="Đơn hàng theo tháng">
//                    <ResponsiveContainer width="100%" height={250}>
//                        <BarChart data={data}>
//                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
//                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
//                            <Bar dataKey="donHang" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={40} />
//                        </BarChart>
//                    </ResponsiveContainer>
//                </ChartContainer>
//            </div>

//            {/* Bảng sản phẩm bán chạy */}
//            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
//                <h2 className="text-xl font-bold text-white mb-6">Sản phẩm bán chạy</h2>
//                <table className="w-full text-left text-sm">
//                    <thead>
//                        <tr className="text-slate-500 border-b border-white/10">
//                            <th className="pb-4 font-medium uppercase tracking-wider text-xs px-4">Sản phẩm</th>
//                            <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right px-4">Số lượng bán</th>
//                            <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right px-4">Doanh thu</th>
//                        </tr>
//                    </thead>
//                    <tbody className="divide-y divide-white/5">
//                        <ProductRow name="MacBook Pro 16 inch M3 Max" sales={245} revenue="22.045.000.000đ" />
//                        <ProductRow name="Laptop Gaming AI G5" sales={182} revenue="4.550.000.000đ" />
//                    </tbody>
//                </table>
//            </div>
//        </div>
//    );
//}

//// Các component phụ hỗ trợ layout
//function StatCard({ title, value, percent, icon, color }: any) {
//    return (
//        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group">
//            <div className="flex justify-between items-start mb-4">
//                <div className={`p-3 bg-white/5 rounded-2xl ${color}`}>{icon}</div>
//                <span className="text-green-400 text-xs font-bold">{percent}</span>
//            </div>
//            <div className="text-slate-500 text-xs font-bold uppercase mb-1">{title}</div>
//            <div className="text-2xl font-black text-white">{value}</div>
//        </div>
//    );
//}

//function ChartContainer({ title, children }: any) {
//    return (
//        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
//            <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
//            {children}
//        </div>
//    );
//}

//function ProductRow({ name, sales, revenue }: any) {
//    return (
//        <tr className="hover:bg-white/5 transition-colors">
//            <td className="py-4 font-bold text-white px-4">{name}</td>
//            <td className="py-4 text-slate-400 text-right px-4">{sales}</td>
//            <td className="py-4 text-cyan-400 font-bold text-right px-4">{revenue}</td>
//        </tr>
//    );
//}