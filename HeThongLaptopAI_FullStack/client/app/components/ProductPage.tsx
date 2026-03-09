"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái đóng/mở
    const [formData, setFormData] = useState({
        TenSP: '', GiaBan: '', SoLuongTon: '', CPU: '', RAM: '', VGA: '', HinhAnh: ''
    });

    const fetchProducts = () => {
        fetch('http://localhost:5000/api/admin/products')
            .then(res => res.json())
            .then(data => setProducts(data));
    };

    useEffect(() => { fetchProducts(); }, []);

    // Hàm xử lý khi nhấn "Lưu sản phẩm"
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Thêm sản phẩm thành công!");
                setIsModalOpen(false); // Đóng modal
                setFormData({ TenSP: '', GiaBan: '', SoLuongTon: '', CPU: '', RAM: '', VGA: '', HinhAnh: '' }); // Reset form
                fetchProducts(); // Tải lại danh sách
            }
        } catch (err) {
            console.error("Lỗi khi thêm:", err);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500 text-sm">Cập nhật kho hàng</p>
                </div>
                {/* Nút mở Modal */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                    <Plus size={20} /> Thêm máy mới
                </button>
            </div>

            {/* Bảng danh sách (Giữ nguyên như cũ) */}
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Tên sản phẩm</th>
                            <th className="px-6 py-4">Cấu hình</th>
                            <th className="px-6 py-4">Giá bán</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((p: any) => (
                            <tr key={p.MaSP} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-bold text-white">{p.TenSP}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{p.CPU} | {p.RAM}</td>
                                <td className="px-6 py-4 text-cyan-400 font-bold">{Number(p.GiaBan).toLocaleString()}đ</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:text-white"><Edit2 size={16} /></button>
                                    <button className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL OVERLAY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-white">Thêm Laptop <span className="text-cyan-400">Mới</span></h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">Tên sản phẩm</label>
                                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-cyan-500 outline-none"
                                        onChange={e => setFormData({ ...formData, TenSP: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">Giá bán (VNĐ)</label>
                                    <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, GiaBan: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">Số lượng tồn</label>
                                    <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, SoLuongTon: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">CPU</label>
                                    <input type="text" placeholder="Ví dụ: Core i7 13700H" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, CPU: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">RAM</label>
                                    <input type="text" placeholder="Ví dụ: 16GB DDR5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, RAM: e.target.value })} />
                                </div>

                                <div className="col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20">
                                        XÁC NHẬN LƯU VÀO CƠ SỞ DỮ LIỆU
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}