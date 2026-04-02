"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, DollarSign, Search, ChevronDown, Eye, Truck, Settings, XCircle, Calendar, AlertTriangle, ShieldCheck, X, Package } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

    // States cho Modal Chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderDetails, setOrderDetails] = useState<any[]>([]);

    const fetchOrders = () => {
        fetch('http://localhost:5000/api/admin/orders')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setOrders(data) : setOrders([]))
            .catch(err => console.error("Lỗi lấy đơn hàng:", err));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // MỞ MODAL VÀ LẤY CHI TIẾT ĐƠN
    const handleViewDetails = async (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setOrderDetails([]); // Reset data cũ

        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${order.MaDH}`);
            const data = await res.json();
            if (Array.isArray(data)) setOrderDetails(data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết:", err);
        }
    };

    // XỬ LÝ CẬP NHẬT TRẠNG THÁI GIAO HÀNG
    const handleUpdateStatus = async (maDH: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${maDH}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThai: newStatus })
            });
            if (res.ok) {
                fetchOrders(); // Load lại danh sách ngoài bảng
                setSelectedOrder({ ...selectedOrder, TrangThai: newStatus }); // Cập nhật luôn trong Modal
            }
        } catch (err) {
            console.error(err);
        }
    };

    // XỬ LÝ CẬP NHẬT THANH TOÁN
    const handleUpdatePayment = async (maDH: number, daThanhToan: boolean) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${maDH}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ daThanhToan: daThanhToan })
            });
            if (res.ok) {
                fetchOrders();
                setSelectedOrder({ ...selectedOrder, DaThanhToan: daThanhToan });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Xử lý ảnh JSON
    const parseImage = (imgData: string) => {
        try {
            let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
            const img = Array.isArray(parsed) ? parsed[0] : parsed;
            let cleanImg = img.replace(/[\[\]"]/g, '');
            return cleanImg.startsWith('http') || cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
        } catch { return "/laptop-demo.png"; }
    };

    // XỬ LÝ TÌM KIẾM & LỌC REAL-TIME
    const filteredOrders = orders.filter(o => {
        const searchLower = searchTerm.toLowerCase();

        // Tạo mã đơn hàng ảo để so sánh (VD: ORD-2026-001)
        const orderId = `ORD-${new Date(o.NgayDat).getFullYear()}-${String(o.MaDH).padStart(3, '0')}`.toLowerCase();

        // Quét tìm kiếm qua Mã đơn, Tên khách hàng và cả Email
        const matchSearch =
            (o.HoTen || '').toLowerCase().includes(searchLower) ||
            (o.Email || '').toLowerCase().includes(searchLower) ||
            orderId.includes(searchLower);

        // Lọc theo Dropdown Trạng thái
        const matchStatus = statusFilter === 'Tất cả trạng thái' || o.TrangThai === statusFilter;

        // Chỉ hiển thị đơn hàng thỏa mãn CẢ 2 điều kiện
        return matchSearch && matchStatus;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.TrangThai === 'Chờ xử lý' || o.TrangThai === 'Chờ xác nhận').length,
        delivered: orders.filter(o => o.TrangThai === 'Đã giao').length,
        revenue: orders.filter(o => o.TrangThai !== 'Đã hủy' && o.TrangThai !== 'Bị từ chối (Spam)').reduce((sum, o) => sum + (o.TongTien || 0), 0)
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Đã giao': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={14} /> Đã giao</span>;
            case 'Đang giao': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Truck size={14} /> Đang giao</span>;
            case 'Đang xử lý': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Settings size={14} /> Đang xử lý</span>;
            case 'Chờ xác nhận':
            case 'Chờ xử lý': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={14} /> Chờ xử lý</span>;
            case 'Bị từ chối (Spam)': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/30"><AlertTriangle size={14} /> AI Chặn</span>;
            case 'Đã hủy': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><XCircle size={14} /> Đã hủy</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><Clock size={14} /> {status}</span>;
        }
    };

    return (
        <div className="space-y-8 relative pb-10">
            {/* Header & Stats */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý đơn hàng</h1>
                <p className="text-slate-400 text-sm mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng đơn hàng" value={stats.total} icon={<ShoppingBag size={22} className="text-cyan-400" />} colorClass="bg-[#151a25]" trend="+12%" />
                <StatCard title="Chờ xử lý" value={stats.pending} icon={<Clock size={22} className="text-amber-400" />} colorClass="bg-[#151a25]" />
                <StatCard title="Đã giao" value={stats.delivered} icon={<CheckCircle2 size={22} className="text-emerald-400" />} colorClass="bg-[#151a25]" />
                <StatCard title="Doanh thu" value={`${(stats.revenue / 1000000).toFixed(0)}Mđ`} icon={<DollarSign size={22} className="text-blue-400" />} colorClass="bg-[#151a25]" trend="+5%" />
            </div>

            {/* Main Content */}
            <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                {/* Thanh tìm kiếm và Lọc */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn (ORD-...), tên hoặc email khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e2330] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                        />
                    </div>
                    <div className="relative shrink-0">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full md:w-auto bg-[#1e2330] border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/50 transition-colors shadow-inner font-medium"
                        >
                            <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                            <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
                            <option value="Đang xử lý">⚙️ Đang xử lý</option>
                            <option value="Đang giao">🚚 Đang giao</option>
                            <option value="Đã giao">✅ Đã giao</option>
                            <option value="Đã hủy">❌ Đã hủy</option>
                            <option value="Bị từ chối (Spam)">⚠️ Bị từ chối (Spam)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e2330]/50 text-slate-400 text-sm border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium whitespace-nowrap">Mã đơn</th>
                                <th className="px-6 py-4 font-medium">Khách hàng</th>
                                <th className="px-6 py-4 font-medium whitespace-nowrap">Ngày đặt & Tiền</th>
                                <th className="px-6 py-4 font-medium whitespace-nowrap">Thanh toán</th>
                                <th className="px-6 py-4 font-medium">Trạng thái</th>
                                <th className="px-6 py-4 font-medium">AI Check</th>
                                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredOrders.length > 0 ? filteredOrders.map((o: any) => {
                                const orderId = `ORD-${new Date(o.NgayDat).getFullYear()}-${String(o.MaDH).padStart(3, '0')}`;
                                const isSpam = o.IsSpam || o.RiskScore_AI >= 1.0;
                                return (
                                    <tr key={o.MaDH} className={`transition-colors group ${isSpam ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/[0.02]'}`}>
                                        <td className="px-6 py-5 font-bold text-cyan-400">{orderId}</td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white mb-0.5">{o.HoTen || 'Khách vãng lai'}</div>
                                            <div className="text-xs text-slate-500">{o.Email || 'Không có email'}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-slate-400 flex items-center gap-2 mb-1.5 text-xs"><Calendar size={12} /> {new Date(o.NgayDat).toLocaleDateString('vi-VN')}</div>
                                            <div className="font-black text-white">{Number(o.TongTien || 0).toLocaleString('vi-VN')}đ</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-slate-300 text-xs mb-1">{o.PhuongThucThanhToan || 'COD'}</div>
                                            {o.DaThanhToan ? <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Đã thanh toán</span> : <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Chưa thanh toán</span>}
                                        </td>
                                        <td className="px-6 py-5">{getStatusBadge(o.TrangThai)}</td>
                                        <td className="px-6 py-5">
                                            {isSpam ? <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400"><AlertTriangle size={14} /> Risk: {(o.RiskScore_AI * 100).toFixed(0)}%</span> : <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400"><ShieldCheck size={14} /> Safe</span>}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {/* NÚT XEM CHI TIẾT */}
                                            <button onClick={() => handleViewDetails(o)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20 inline-flex items-center justify-center">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (<tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Không tìm thấy đơn hàng nào.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#151a25] border border-white/10 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">

                        {/* Header Modal */}
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1e2330]/50 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Package className="text-cyan-400" size={20} />
                                    Chi tiết Đơn hàng: ORD-{new Date(selectedOrder.NgayDat).getFullYear()}-{String(selectedOrder.MaDH).padStart(3, '0')}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Khách hàng: <span className="text-white font-bold">{selectedOrder.HoTen}</span></p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"><X size={18} /></button>
                        </div>

                        {/* Body Modal */}
                        <div className="overflow-y-auto p-6 flex flex-col md:flex-row gap-6">

                            {/* Cột trái: Danh sách sản phẩm */}
                            <div className="flex-1 space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sản phẩm đã đặt</h3>
                                {orderDetails.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8 animate-pulse text-sm">Đang tải sản phẩm...</div>
                                ) : (
                                    orderDetails.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 bg-[#1e2330] p-3 rounded-xl border border-white/5">
                                            <div className="w-16 h-16 shrink-0 bg-black/40 rounded-lg p-1 flex items-center justify-center">
                                                <img src={parseImage(item.HinhAnh)} alt="laptop" className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h4 className="text-white font-bold text-sm line-clamp-2 leading-snug">{item.TenSP}</h4>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-slate-400 font-medium">Số lượng: <span className="text-white">{item.SoLuong}</span></span>
                                                    <span className="font-black text-cyan-400 text-sm">{Number(item.GiaBan).toLocaleString('vi-VN')}đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Cột phải: Bảng điều khiển Trạng thái */}
                            <div className="w-full md:w-72 bg-[#1e2330] p-5 rounded-xl border border-white/5 h-fit space-y-5 shrink-0">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thanh toán</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.MaDH, true)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${selectedOrder.DaThanhToan ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                        >Đã trả</button>
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.MaDH, false)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${!selectedOrder.DaThanhToan ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                        >Chưa trả</button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tiến độ giao hàng</h3>
                                    <select
                                        value={selectedOrder.TrangThai}
                                        onChange={(e) => handleUpdateStatus(selectedOrder.MaDH, e.target.value)}
                                        className="w-full bg-[#151a25] border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                                    >
                                        <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
                                        <option value="Đang xử lý">⚙️ Đang xử lý kho</option>
                                        <option value="Đang giao">🚚 Đang giao hàng</option>
                                        <option value="Đã giao">✅ Giao thành công</option>
                                        <option value="Đã hủy">❌ Hủy đơn hàng</option>
                                    </select>
                                </div>

                                <div className="pt-5 border-t border-white/10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-400 font-bold text-sm">Tổng tiền:</span>
                                        <span className="text-xl font-black text-white">{Number(selectedOrder.TongTien || 0).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, colorClass, trend }: any) {
    return (
        <div className={`${colorClass} border border-white/5 rounded-2xl p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group shadow-lg`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-[#1e2330] border border-white/5`}>{icon}</div>
                {trend && <span className="text-xs font-bold text-emerald-400 flex items-center">{trend}</span>}
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="text-slate-400 text-sm font-medium">{title}</div>
            </div>
        </div>
    );
}