"use client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

// Dữ liệu giả lập cho biểu đồ
const data = [
    { name: 'T1', doanhThu: 45, donHang: 120 },
    { name: 'T2', doanhThu: 52, donHang: 145 },
    { name: 'T3', doanhThu: 48, donHang: 130 },
    { name: 'T4', doanhThu: 61, donHang: 168 },
    { name: 'T5', doanhThu: 55, donHang: 150 },
    { name: 'T6', doanhThu: 67, donHang: 185 },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-500 text-sm">Tổng quan hoạt động kinh doanh</p>
            </div>

            {/* 4 Thẻ thống kê hàng đầu */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng doanh thu" value="58.7 tỷ" percent="+12.5%" icon={<DollarSign />} color="text-cyan-400" />
                <StatCard title="Đơn hàng" value="1,245" percent="+8.2%" icon={<ShoppingCart />} color="text-blue-400" />
                <StatCard title="Khách hàng" value="856" percent="+15.3%" icon={<Users />} color="text-purple-400" />
                <StatCard title="Tăng trưởng" value="23.1%" percent="+4.1%" icon={<TrendingUp />} color="text-green-400" />
            </div>

            {/* Khu vực biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Doanh thu theo tháng">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="doanhThu" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Đơn hàng theo tháng">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Bar dataKey="donHang" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Bảng sản phẩm bán chạy */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
                <h2 className="text-xl font-bold text-white mb-6">Sản phẩm bán chạy</h2>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-500 border-b border-white/10">
                            <th className="pb-4 font-medium uppercase tracking-wider text-xs px-4">Sản phẩm</th>
                            <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right px-4">Số lượng bán</th>
                            <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right px-4">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <ProductRow name="MacBook Pro 16 inch M3 Max" sales={245} revenue="22.045.000.000đ" />
                        <ProductRow name="Laptop Gaming AI G5" sales={182} revenue="4.550.000.000đ" />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Các component phụ hỗ trợ layout
function StatCard({ title, value, percent, icon, color }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 bg-white/5 rounded-2xl ${color}`}>{icon}</div>
                <span className="text-green-400 text-xs font-bold">{percent}</span>
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase mb-1">{title}</div>
            <div className="text-2xl font-black text-white">{value}</div>
        </div>
    );
}

function ChartContainer({ title, children }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem]">
            <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
            {children}
        </div>
    );
}

function ProductRow({ name, sales, revenue }: any) {
    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="py-4 font-bold text-white px-4">{name}</td>
            <td className="py-4 text-slate-400 text-right px-4">{sales}</td>
            <td className="py-4 text-cyan-400 font-bold text-right px-4">{revenue}</td>
        </tr>
    );
}