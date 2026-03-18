"use client";
import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, Edit2, Trash2, FolderTree, Activity, Box, TrendingUp, Gamepad2, Palette, Briefcase, Laptop2, Monitor, Wallet, X, Package } from 'lucide-react'; // Đã xóa import MoreVertical

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);

    // --- STATE CHO TÌM KIẾM VÀ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ TenDM: '', MoTa: '', Slug: '', Icon: 'FolderTree', ColorClass: 'cyan', TrangThai: 1 });

    const fetchCategories = () => {
        fetch('http://localhost:5000/api/admin/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchCategories(); }, []);

    // Helper: Map tên Icon từ DB ra Component thật
    const getIconComponent = (iconName: string, size = 24) => {
        switch (iconName) {
            case 'Gamepad2': return <Gamepad2 size={size} />;
            case 'Palette': return <Palette size={size} />;
            case 'Briefcase': return <Briefcase size={size} />;
            case 'Laptop2': return <Laptop2 size={size} />;
            case 'Monitor': return <Monitor size={size} />;
            case 'Wallet': return <Wallet size={size} />;
            default: return <FolderTree size={size} />;
        }
    };

    // Helper: Lấy màu CSS
    const getColorClasses = (colorName: string) => {
        const colors: any = {
            red: "bg-red-500/10 text-red-500",
            purple: "bg-purple-500/10 text-purple-400",
            blue: "bg-blue-500/10 text-blue-400",
            cyan: "bg-cyan-500/10 text-cyan-400",
            emerald: "bg-emerald-500/10 text-emerald-400",
            slate: "bg-slate-500/10 text-slate-400"
        };
        return colors[colorName] || colors.cyan;
    };

    // --- LOGIC LỌC DANH MỤC ---
    const filteredCategories = categories.filter(c => {
        // Lọc theo tên hoặc mô tả
        const matchSearch = (c.TenDM || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.MoTa || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Lọc theo trạng thái
        const isActive = c.TrangThai === true || c.TrangThai === 1;
        const matchStatus = statusFilter === 'Tất cả trạng thái' ||
            (statusFilter === 'Hoạt động' && isActive) ||
            (statusFilter === 'Ẩn' && !isActive);

        return matchSearch && matchStatus;
    });

    // Tính toán số liệu thống kê
    const stats = {
        total: categories.length,
        active: categories.filter(c => c.TrangThai === true || c.TrangThai === 1).length,
        totalProducts: categories.reduce((sum, c) => sum + (c.SoSanPham || 0), 0),
        popular: categories.length > 0 ? categories.reduce((prev, current) => (prev.SoSanPham > current.SoSanPham) ? prev : current) : null
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `http://localhost:5000/api/admin/categories/${editingId}` : 'http://localhost:5000/api/admin/categories';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchCategories();
            } else alert("Có lỗi xảy ra");
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa danh mục này?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
            else { const err = await res.json(); alert(err.error); }
        } catch (err) { alert("Lỗi kết nối"); }
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý Danh mục</h1>
                    <p className="text-slate-400 text-sm mt-1">Quản lý danh mục sản phẩm</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ TenDM: '', MoTa: '', Slug: '', Icon: 'FolderTree', ColorClass: 'cyan', TrangThai: 1 }); setIsModalOpen(true); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
                    <Plus size={18} /> Thêm danh mục
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Tổng danh mục" value={stats.total} icon={<FolderTree size={20} className="text-cyan-400" />} />
                <StatCard title="Đang hoạt động" value={stats.active} icon={<Activity size={20} className="text-emerald-400" />} />
                <StatCard title="Tổng sản phẩm" value={stats.totalProducts} icon={<Package size={20} className="text-blue-400" />} />
                <StatCard title="Phổ biến nhất" value={stats.popular ? stats.popular.TenDM : 'N/A'} subValue={stats.popular ? `${stats.popular.SoSanPham} sản phẩm` : ''} icon={<TrendingUp size={20} className="text-purple-400" />} />
            </div>

            {/* Thanh tìm kiếm và Lọc */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#151a25] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none bg-[#151a25] border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/50 min-w-[160px] transition-colors"
                    >
                        <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Ẩn">Ẩn</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Lưới Danh mục (Category Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCategories.length > 0 ? filteredCategories.map((c: any) => (
                    <div key={c.MaDM} className="bg-[#151a25] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col h-full group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(c.ColorClass)}`}>
                                {getIconComponent(c.Icon, 24)}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{c.TenDM}</h3>
                        <p className="text-sm text-slate-400 mb-6 flex-1">{c.MoTa}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Package size={14} /> {c.SoSanPham || 0} sản phẩm</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.TrangThai ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {c.TrangThai ? 'Hoạt động' : 'Tắt'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-1 md:col-span-3 text-center py-10 text-slate-500 bg-[#151a25] border border-white/5 rounded-2xl">
                        Không tìm thấy danh mục nào phù hợp.
                    </div>
                )}
            </div>

            {/* Bảng Chi tiết danh mục (Table) */}
            {filteredCategories.length > 0 && (
                <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-xl mt-8">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-bold text-white">Chi tiết danh mục</h2>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e2330]/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5 font-bold">
                            <tr>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Sản phẩm</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredCategories.map((c: any) => (
                                <tr key={c.MaDM} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${getColorClasses(c.ColorClass)}`}>
                                                {getIconComponent(c.Icon, 18)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{c.TenDM}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{c.MoTa}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-white/5 text-cyan-400 rounded-md text-xs font-mono">{c.Slug}</span></td>
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2"><Package size={14} className="text-slate-500" /> {c.SoSanPham || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.TrangThai ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {c.TrangThai ? 'Hoạt động' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(c.NgayTao).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setEditingId(c.MaDM); setFormData({ TenDM: c.TenDM, MoTa: c.MoTa, Slug: c.Slug, Icon: c.Icon, ColorClass: c.ColorClass, TrangThai: c.TrangThai }); setIsModalOpen(true); }} className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(c.MaDM)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form Thêm/Sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#151a25] border border-white/10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1e2330]/50">
                            <h2 className="text-xl font-bold text-white">{editingId ? "Sửa Danh mục" : "Thêm Danh mục"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="text-xs font-semibold text-slate-400 mb-1.5 block">TÊN DANH MỤC *</label><input required type="text" value={formData.TenDM} onChange={e => setFormData({ ...formData, TenDM: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="VD: Gaming" /></div>
                            <div><label className="text-xs font-semibold text-slate-400 mb-1.5 block">SLUG (URL) *</label><input required type="text" value={formData.Slug} onChange={e => setFormData({ ...formData, Slug: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="vd: gaming-laptop" /></div>
                            <div><label className="text-xs font-semibold text-slate-400 mb-1.5 block">MÔ TẢ</label><textarea value={formData.MoTa} onChange={e => setFormData({ ...formData, MoTa: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500 resize-none" rows={2}></textarea></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold text-slate-400 mb-1.5 block">ICON</label><select value={formData.Icon} onChange={e => setFormData({ ...formData, Icon: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500"><option value="Gamepad2">Gamepad</option><option value="Palette">Palette (Creator)</option><option value="Briefcase">Briefcase (Business)</option><option value="Laptop2">Laptop (Ultrabook)</option><option value="Monitor">Monitor</option><option value="FolderTree">Mặc định</option></select></div>
                                <div><label className="text-xs font-semibold text-slate-400 mb-1.5 block">MÀU SẮC</label><select value={formData.ColorClass} onChange={e => setFormData({ ...formData, ColorClass: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500"><option value="red">Đỏ (Red)</option><option value="purple">Tím (Purple)</option><option value="blue">Xanh dương (Blue)</option><option value="cyan">Xanh lá (Cyan)</option></select></div>
                            </div>
                            {/* Trạng thái danh mục khi sửa */}
                            {editingId && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">TRẠNG THÁI</label>
                                    <select value={formData.TrangThai} onChange={e => setFormData({ ...formData, TrangThai: Number(e.target.value) })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500">
                                        <option value={1}>Hoạt động</option>
                                        <option value={0}>Ẩn</option>
                                    </select>
                                </div>
                            )}
                            <div className="pt-4"><button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-colors">{editingId ? "LƯU THAY ĐỔI" : "TẠO DANH MỤC"}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, subValue, icon }: any) {
    return (
        <div className="bg-[#151a25] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.02] transition-colors flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">{title}</span>
                <div className="p-2 rounded-lg bg-[#1e2330] border border-white/5">{icon}</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-white mt-2">{value}</div>
                {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
            </div>
        </div>
    );
}