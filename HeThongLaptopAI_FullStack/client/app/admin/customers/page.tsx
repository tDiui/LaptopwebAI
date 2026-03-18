"use client";
import { useState, useEffect } from 'react';
import { Plus, Users, CheckCircle, Shield, User, Search, ChevronDown, Edit2, Trash2, MoreVertical, X } from 'lucide-react';

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);

    // --- STATE CHO TÌM KIẾM VÀ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Tất cả vai trò');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

    // State cho Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        HoTen: '', Email: '', MatKhau: '', VaiTro: 'Customer'
    });

    const fetchAccounts = () => {
        fetch('http://localhost:5000/api/admin/accounts')
            .then(res => res.json())
            .then(data => setAccounts(data))
            .catch(err => console.error("Lỗi:", err));
    };

    useEffect(() => { fetchAccounts(); }, []);

    // --- LOGIC TÌM KIẾM & LỌC DỮ LIỆU ---
    const filteredAccounts = accounts.filter(a => {
        const matchSearch = (a.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.Email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'Tất cả vai trò' || a.VaiTro === roleFilter;

        const isActive = a.TrangThai === true || a.TrangThai === 1;
        const matchStatus = statusFilter === 'Tất cả trạng thái' ||
            (statusFilter === 'Hoạt động' && isActive) ||
            (statusFilter === 'Bị khóa' && !isActive);

        return matchSearch && matchRole && matchStatus;
    });

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN API ---
    const handleToggleStatus = async (id: number, currentStatus: boolean | number) => {
        const newStatus = (currentStatus === true || currentStatus === 1) ? 0 : 1;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/accounts/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThaiMoi: newStatus })
            });
            if (res.ok) fetchAccounts();
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/accounts/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAccounts();
            else {
                const errorData = await res.json();
                alert("Không thể xóa: " + errorData.error);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setEditingId(null);
        setFormData({ HoTen: '', Email: '', MatKhau: '', VaiTro: 'Customer' });
    };

    const handleEditClick = (account: any) => {
        setEditingId(account.MaTK);
        setFormData({
            HoTen: account.HoTen || '',
            Email: account.Email || '',
            MatKhau: '', VaiTro: account.VaiTro || 'Customer'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId
            ? `http://localhost:5000/api/admin/accounts/${editingId}`
            : 'http://localhost:5000/api/admin/accounts';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchAccounts();
            } else {
                const errorData = await res.json();
                alert("Lỗi: " + errorData.error);
            }
        } catch (err) {
            console.error("Lỗi khi lưu:", err);
        }
    };

    const stats = {
        total: accounts.length,
        active: accounts.filter(a => a.TrangThai === true || a.TrangThai === 1).length,
        admins: accounts.filter(a => a.VaiTro === 'Admin').length,
        customers: accounts.filter(a => a.VaiTro === 'Customer').length
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý Tài khoản</h1>
                    <p className="text-slate-400 text-sm mt-1">Quản lý người dùng và phân quyền</p>
                </div>
                <button onClick={handleOpenModal} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
                    <Plus size={18} /> Thêm người dùng
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Tổng người dùng" value={stats.total} icon={<Users size={20} className="text-cyan-400" />} />
                <StatCard title="Đang hoạt động" value={stats.active} icon={<CheckCircle size={20} className="text-emerald-400" />} />
                <StatCard title="Admin" value={stats.admins} icon={<Shield size={20} className="text-rose-400" />} />
                <StatCard title="Khách hàng" value={stats.customers} icon={<User size={20} className="text-blue-400" />} />
            </div>

            <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                {/* THANH TÌM KIẾM VÀ LỌC */}
                <div className="p-6 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e2330] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none bg-[#1e2330] border border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/50 min-w-[150px]"
                        >
                            <option>Tất cả vai trò</option>
                            <option>Admin</option>
                            <option>Manager</option>
                            <option>Customer</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-[#1e2330] border border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/50 min-w-[150px]"
                        >
                            <option>Tất cả trạng thái</option>
                            <option>Hoạt động</option>
                            <option>Bị khóa</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1e2330]/50 text-slate-400 text-sm border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-medium">Người dùng</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Vai trò</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                            <th className="px-6 py-4 font-medium text-center">Đơn hàng</th>
                            <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {/* RENDER filteredAccounts THAY VÌ accounts */}
                        {filteredAccounts.length > 0 ? filteredAccounts.map((a: any) => {
                            const isActive = a.TrangThai === true || a.TrangThai === 1;
                            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.HoTen || 'User')}&background=random&color=fff&bold=true`;

                            return (
                                <tr key={a.MaTK} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-white/10" />
                                            <div className="font-bold text-white">{a.HoTen || 'Chưa cập nhật'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 flex items-center gap-2">
                                        <span className="text-slate-500">✉</span> {a.Email}
                                    </td>
                                    <td className="px-6 py-4"><RoleBadge role={a.VaiTro} /></td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(a.MaTK, a.TrangThai)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'}`}
                                        >
                                            {isActive ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full bg-slate-500" />}
                                            {isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{new Date(a.NgayTao).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-center font-bold text-white">{a.SoDonHang}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(a)} className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(a.MaTK)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                                            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><MoreVertical size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#151a25] border border-white/10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1e2330]/50">
                            <h2 className="text-xl font-bold text-white">{editingId ? "Cập nhật Tài khoản" : "Thêm Người dùng mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">HỌ VÀ TÊN *</label>
                                <input required type="text" value={formData.HoTen} onChange={e => setFormData({ ...formData, HoTen: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="Nguyễn Văn A" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">ĐỊA CHỈ EMAIL *</label>
                                <input required type="email" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="email@example.com" />
                            </div>

                            {!editingId && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">MẬT KHẨU *</label>
                                    <input required={!editingId} type="password" value={formData.MatKhau} onChange={e => setFormData({ ...formData, MatKhau: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="••••••••" />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">VAI TRÒ TRONG HỆ THỐNG</label>
                                <select value={formData.VaiTro} onChange={e => setFormData({ ...formData, VaiTro: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer">
                                    <option value="Customer">Khách hàng (Customer)</option>
                                    <option value="Manager">Quản lý (Manager)</option>
                                    <option value="Admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
                                    {editingId ? "LƯU THAY ĐỔI" : "TẠO TÀI KHOẢN"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Component phụ trợ
function StatCard({ title, value, icon }: any) {
    return (
        <div className="bg-[#151a25] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.02] transition-colors flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">{title}</span>
                <div className="p-2 rounded-lg bg-[#1e2330] border border-white/5">{icon}</div>
            </div>
            <div className="text-3xl font-bold text-white mt-4">{value}</div>
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    let colorClass = "";
    let icon = null;
    if (role === 'Admin') { colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20"; icon = <Shield size={12} />; }
    else if (role === 'Manager' || role === 'Staff') { colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20"; icon = <Users size={12} />; }
    else { colorClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"; icon = <User size={12} />; }
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>{icon} {role || 'Customer'}</span>;
}