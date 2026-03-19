"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Package } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Mảng chứa file ảnh và link preview
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Cập nhật formData có đầy đủ thông số và MaDM
    const [formData, setFormData] = useState({
        TenSP: '', MaDM: '', GiaBan: '', SoLuongTon: '', CPU: '', RAM: '', VGA: '', ManHinh: '', O_Cung: '', TrongLuong: '', MoTa: ''
    });

    const fetchProducts = () => {
        fetch('http://localhost:5000/api/admin/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    const fetchCategories = () => {
        fetch('http://localhost:5000/api/admin/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Xử lý chọn tối đa 3 file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).slice(0, 3);
            setFiles(selectedFiles);
            const urls = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setEditingId(null);
        setFiles([]);
        setPreviewUrls([]);
        setFormData({ TenSP: '', MaDM: '', GiaBan: '', SoLuongTon: '', CPU: '', RAM: '', VGA: '', ManHinh: '', O_Cung: '', TrongLuong: '', MoTa: '' });
    };

    const handleEditClick = (product: any) => {
        setEditingId(product.MaSP);
        setFormData({
            TenSP: product.TenSP || '', MaDM: product.MaDM || '', GiaBan: product.GiaBan || '', SoLuongTon: product.SoLuongTon || '',
            CPU: product.CPU || '', RAM: product.RAM || '', VGA: product.VGA || '',
            ManHinh: product.ManHinh || '', O_Cung: product.O_Cung || '', TrongLuong: product.TrongLuong || '', MoTa: product.MoTa || ''
        });

        // Xử lý load ảnh cũ (giải mã chuỗi JSON)
        try {
            if (product.HinhAnh) {
                const parsedUrls = JSON.parse(product.HinhAnh);
                setPreviewUrls(Array.isArray(parsedUrls) ? parsedUrls : [product.HinhAnh]);
            } else setPreviewUrls([]);
        } catch {
            setPreviewUrls(product.HinhAnh ? [product.HinhAnh] : []);
        }

        setFiles([]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa vĩnh viễn sản phẩm này?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) fetchProducts();
        } catch (err) { alert("Lỗi kết nối Server!"); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Sử dụng FormData để gửi kèm File thay vì JSON
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));
        files.forEach(file => data.append('HinhAnh', file));

        const url = editingId ? `http://localhost:5000/api/admin/products/${editingId}` : 'http://localhost:5000/api/admin/products';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method: method, body: data });
            if (res.ok) {
                alert(editingId ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
                setIsModalOpen(false);
                fetchProducts();
            } else {
                const errData = await res.json();
                alert("Lỗi: " + errData.error);
            }
        } catch (err) {
            console.error("Lỗi khi lưu:", err);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500 text-sm mt-1">Cập nhật kho hàng & thông số AI</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                    <Plus size={20} /> Thêm máy mới
                </button>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-5">Sản phẩm</th>
                            <th className="px-6 py-5">Danh mục</th>
                            <th className="px-6 py-5">Cấu hình chính</th>
                            <th className="px-6 py-5">Giá bán</th>
                            <th className="px-6 py-5">Kho</th>
                            <th className="px-6 py-5 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((p: any) => (
                            <tr key={p.MaSP} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-base">{p.TenSP}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                        <Package size={12} /> {p.TenDM || 'Chưa phân loại'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    <div className="line-clamp-1">{p.CPU}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{p.RAM} | {p.VGA}</div>
                                </td>
                                <td className="px-6 py-4 text-white font-bold">{Number(p.GiaBan).toLocaleString()}đ</td>
                                <td className="px-6 py-4 text-slate-400 font-medium">{p.SoLuongTon}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEditClick(p)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(p.MaSP)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL OVERLAY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-white">{editingId ? "Cập nhật Sản phẩm" : "Thêm Laptop Mới"}</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

                                {/* Khu vực Upload Ảnh */}
                                <div className="col-span-2 border-2 border-dashed border-white/10 rounded-2xl p-6 bg-[#1e2330]/50 hover:border-cyan-500/50 transition-colors">
                                    {previewUrls.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                {previewUrls.map((url, idx) => (
                                                    <div key={idx} className="relative rounded-xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center border border-white/5">
                                                        <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                                        {idx === 0 && <span className="absolute top-2 left-2 bg-cyan-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded">Ảnh chính</span>}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-center">
                                                <button type="button" onClick={() => { setFiles([]); setPreviewUrls([]); }} className="text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors">
                                                    Xóa và chọn lại ảnh
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer w-full py-8">
                                            <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-full mb-4"><Upload size={24} /></div>
                                            <span className="text-white font-bold text-sm">Nhấn để tải ảnh sản phẩm lên</span>
                                            <span className="text-slate-500 text-xs mt-1">Hỗ trợ tối đa 3 ảnh (JPG, PNG)</span>
                                            <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>

                                {/* Các trường nhập liệu */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Tên sản phẩm *</label>
                                    <input required type="text" value={formData.TenSP} onChange={e => setFormData({ ...formData, TenSP: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white focus:border-cyan-500 outline-none transition-colors" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Danh mục *</label>
                                    <select required value={formData.MaDM} onChange={e => setFormData({ ...formData, MaDM: e.target.value })} className="w-full bg-[#1A1F2B] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white focus:border-cyan-500 outline-none transition-colors appearance-none cursor-pointer">
                                        <option value="" disabled>-- Chọn danh mục --</option>
                                        {categories.map((c: any) => (
                                            <option key={c.MaDM} value={c.MaDM}>{c.TenDM}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Giá bán (VNĐ) *</label>
                                    <input required type="number" value={formData.GiaBan} onChange={e => setFormData({ ...formData, GiaBan: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Số lượng tồn *</label>
                                    <input required type="number" value={formData.SoLuongTon} onChange={e => setFormData({ ...formData, SoLuongTon: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">CPU</label>
                                    <input type="text" value={formData.CPU} onChange={e => setFormData({ ...formData, CPU: e.target.value })} placeholder="Ví dụ: Core i7 13700H" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">GPU (VGA)</label>
                                    <input type="text" value={formData.VGA} onChange={e => setFormData({ ...formData, VGA: e.target.value })} placeholder="Ví dụ: RTX 4060 8GB" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">RAM</label>
                                    <input type="text" value={formData.RAM} onChange={e => setFormData({ ...formData, RAM: e.target.value })} placeholder="Ví dụ: 16GB DDR5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">Ổ CỨNG</label>
                                    <input type="text" value={formData.O_Cung} onChange={e => setFormData({ ...formData, O_Cung: e.target.value })} placeholder="Ví dụ: 512GB NVMe SSD" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">MÀN HÌNH</label>
                                    <input type="text" value={formData.ManHinh} onChange={e => setFormData({ ...formData, ManHinh: e.target.value })} placeholder="Ví dụ: 15.6 inch FHD 144Hz" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">TRỌNG LƯỢNG (KG)</label>
                                    <input type="number" step="0.01" value={formData.TrongLuong} onChange={e => setFormData({ ...formData, TrongLuong: e.target.value })} placeholder="Ví dụ: 2.1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 transition-colors" />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider">MÔ TẢ SẢN PHẨM</label>
                                    <textarea rows={3} value={formData.MoTa} onChange={e => setFormData({ ...formData, MoTa: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white outline-none focus:border-cyan-500 resize-none transition-colors"></textarea>
                                </div>

                                <div className="col-span-2 pt-2">
                                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] tracking-wide">
                                        {editingId ? "LƯU THAY ĐỔI VÀO CƠ SỞ DỮ LIỆU" : "XÁC NHẬN LƯU VÀO CƠ SỞ DỮ LIỆU"}
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