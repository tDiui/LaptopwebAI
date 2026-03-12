"use client";
import { useState, useEffect } from 'react';
import { Lock, Unlock, Mail, Phone, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);

    // Fetch dữ liệu khách hàng
    const fetchCustomers = () => {
        fetch('http://localhost:5000/api/admin/customers')
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error("Lỗi tải dữ liệu khách hàng:", err));
    };

    useEffect(() => { fetchCustomers(); }, []);

    // Hàm xử lý Khóa / Mở khóa tài khoản
    const handleToggleStatus = async (id: number, currentStatus: boolean | number) => {
        // Nếu đang active (true/1) thì trạng thái mới là 0 (Khóa). Ngược lại là 1 (Mở).
        const isActive = currentStatus === true || currentStatus === 1;
        const newStatus = isActive ? 0 : 1;

        const actionText = isActive ? "Khóa" : "Mở khóa";
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/customers/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThaiMoi: newStatus })
            });

            if (res.ok) {
                alert(`Đã ${actionText} tài khoản thành công!`);
                fetchCustomers(); // Tải lại bảng
            } else {
                alert("Có lỗi xảy ra từ máy chủ.");
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            alert("Lỗi kết nối Server!");
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white">Quản lý Khách hàng</h1>
                    <p className="text-slate-500 text-sm">Kiểm soát tài khoản người dùng</p>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Liên hệ</th>
                            <th className="px-6 py-4">Ngày đăng ký</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {customers.map((c: any) => {
                            // Xử lý hiển thị trạng thái (MSSQL trả về true/false cho kiểu BIT)
                            const isActive = c.TrangThai === true || c.TrangThai === 1;

                            return (
                                <tr key={c.MaTK} className={`hover:bg-white/5 transition-colors ${!isActive ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                                                <UserIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{c.HoTen || 'Chưa cập nhật'}</div>
                                                <div className="text-xs text-slate-500">ID: #{c.MaTK}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-300 flex items-center gap-2 mb-1">
                                            <Mail size={14} className="text-slate-500" /> {c.Email}
                                        </div>
                                        <div className="text-sm text-slate-300 flex items-center gap-2">
                                            <Phone size={14} className="text-slate-500" /> {c.SoDienThoai || 'Chưa có'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(c.NgayTao).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 flex items-center justify-center gap-1 w-fit mx-auto'}`}>
                                            {!isActive && <ShieldAlert size={12} />}
                                            {isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(c.MaTK, c.TrangThai)}
                                            className={`p-2 rounded-lg transition-colors ${isActive ? 'hover:bg-red-500/10 hover:text-red-400 text-slate-400' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                                            title={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                        >
                                            {isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {customers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        Chưa có khách hàng nào trong hệ thống.
                    </div>
                )}
            </div>
        </div>
    );
}