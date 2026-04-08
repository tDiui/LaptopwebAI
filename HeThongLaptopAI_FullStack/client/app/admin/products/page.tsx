"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'; // Đã thêm ChevronLeft, ChevronRight

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // --- STATE CHO TÌM KIẾM VÀ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

    // --- STATE CHO PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; // Số sản phẩm trên 1 trang

    // State form và mảng file ảnh
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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

    // Tự động quay về trang 1 khi người dùng gõ tìm kiếm hoặc đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // --- LOGIC LỌC SẢN PHẨM ---
    const filteredProducts = products.filter(p => {
        // Lọc theo Tên sản phẩm hoặc Tên danh mục
        const matchSearch = (p.TenSP || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.TenDM || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Lọc theo Tồn kho
        let matchStatus = true;
        if (statusFilter === 'Còn hàng') {
            matchStatus = p.SoLuongTon > 0;
        } else if (statusFilter === 'Hết hàng') {
            matchStatus = p.SoLuongTon <= 0;
        }

        return matchSearch && matchStatus;
    });

    // --- TOÁN HỌC PHÂN TRANG ---
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Cắt mảng để lấy sản phẩm hiển thị cho trang hiện tại
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    // Hàm chuyển trang
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


    // Xử lý file ảnh
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
            TenSP: product.TenSP || '',
            MaDM: product.MaDM || '',
            GiaBan: product.GiaBan || '', SoLuongTon: product.SoLuongTon || '',
            CPU: product.CPU || '', RAM: product.RAM || '', VGA: product.VGA || '',
            ManHinh: product.ManHinh || '', O_Cung: product.O_Cung || '', TrongLuong: product.TrongLuong || '', MoTa: product.MoTa || ''
        });

        try {
            if (product.HinhAnh) {
                const parsedUrls = JSON.parse(product.HinhAnh);
                setPreviewUrls(Array.isArray(parsedUrls) ? parsedUrls : [product.HinhAnh]);
            } else {
                setPreviewUrls([]);
            }
        } catch {
            setPreviewUrls(product.HinhAnh ? [product.HinhAnh] : []);
        }

        setFiles([]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Cảnh báo: Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi Database. Tiếp tục?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) fetchProducts();
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));

        files.forEach(file => data.append('HinhAnh', file));

        const url = editingId ? `http://localhost:5000/api/admin/products/${editingId}` : 'http://localhost:5000/api/admin/products';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method: method, body: data });
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            }
        } catch (err) {
            console.error("Lỗi khi lưu:", err);
        }
    };

    return (
        <div className="space-y-6 relative pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý sản phẩm</h1>
                    <p className="text-slate-400 text-sm mt-1">Danh sách tất cả laptop trong hệ thống</p>
                </div>
                <button onClick={handleOpenModal} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Plus size={18} /> Thêm sản phẩm
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[600px] shadow-lg">
                {/* Thanh tìm kiếm và Lọc */}
                <div className="p-6 border-b border-white/5 flex gap-4 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e2330] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                    <div className="relative shrink-0">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-[#1e2330] border border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none cursor-pointer focus:border-cyan-500/50 transition-colors min-w-[160px] font-medium"
                        >
                            <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                            <option value="Còn hàng">Còn hàng</option>
                            <option value="Hết hàng">Hết hàng</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Bảng dữ liệu - Flex-1 đẩy phân trang xuống đáy */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e2330]/50 text-slate-400 text-sm border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                                <th className="px-6 py-4 font-medium">CPU</th>
                                <th className="px-6 py-4 font-medium">GPU</th>
                                <th className="px-6 py-4 font-medium text-center">AI Score</th>
                                <th className="px-6 py-4 font-medium">Giá</th>
                                <th className="px-6 py-4 font-medium text-center">Tồn kho</th>
                                <th className="px-6 py-4 font-medium text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {/* Thay filteredProducts bằng currentProducts */}
                            {currentProducts.length > 0 ? currentProducts.map((p: any) => {
                                const mockAiScore = 90 + ((p.MaSP || 0) % 10); // Mock điểm AI

                                return (
                                    <tr key={p.MaSP} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{p.TenSP}</div>
                                            <div className="text-xs text-cyan-500 mt-0.5 font-semibold">{p.TenDM || p.TenHang || 'Chưa phân loại'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">{p.CPU}</td>
                                        <td className="px-6 py-4 text-slate-300">{p.VGA}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                                                {mockAiScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">{Number(p.GiaBan).toLocaleString('vi-VN')}đ</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={p.SoLuongTon > 0 ? "text-slate-300 font-bold" : "text-red-400 font-semibold"}>
                                                {p.SoLuongTon > 0 ? p.SoLuongTon : 'Hết hàng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEditClick(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(p.MaSP)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        Không tìm thấy sản phẩm nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- GIAO DIỆN THANH PHÂN TRANG TÍCH HỢP --- */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#1e2330]/30 mt-auto shrink-0">
                        <div className="text-sm text-slate-400">
                            Hiển thị <span className="text-white font-bold">{indexOfFirstItem + 1}</span> đến <span className="text-white font-bold">{Math.min(indexOfLastItem, filteredProducts.length)}</span> trong tổng số <span className="text-white font-bold">{filteredProducts.length}</span> sản phẩm
                        </div>
                        <div className="flex items-center gap-1.5">
                            {/* Nút Trước (Prev) */}
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {/* Các nút Số trang */}
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                // Logic rút gọn hiển thị dải trang (1 ... 4 5 6 ... 10)
                                if (totalPages > 5 && (page < currentPage - 1 || page > currentPage + 1) && page !== 1 && page !== totalPages) {
                                    if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-2 text-slate-500">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Nút Sau (Next) */}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL FORM GIỮ NGUYÊN 100% CỦA BRO --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#151a25] border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1e2330]/50 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white">{editingId ? "Chỉnh sửa sản phẩm" : "Thêm Laptop Mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">

                            {/* KHU VỰC UPLOAD 3 ẢNH */}
                            <div className="col-span-2 border-2 border-dashed border-white/10 rounded-xl p-6 bg-[#1e2330] hover:border-cyan-500/50 transition-colors">
                                {previewUrls.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            {previewUrls.map((url, idx) => (
                                                <div key={idx} className="relative rounded-lg overflow-hidden bg-black/50 aspect-video flex items-center justify-center">
                                                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                                    {idx === 0 && <span className="absolute top-2 left-2 bg-cyan-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded">Ảnh chính</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-center">
                                            <button type="button" onClick={() => { setFiles([]); setPreviewUrls([]); }} className="text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20">
                                                Xóa và chọn lại
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center cursor-pointer w-full py-6">
                                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-full mb-3"><Upload size={20} /></div>
                                        <span className="text-white font-medium text-sm">Nhấn để tải lên tối đa 3 ảnh</span>
                                        <span className="text-slate-500 text-xs mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">TÊN SẢN PHẨM *</label>
                                <input required type="text" value={formData.TenSP} onChange={e => setFormData({ ...formData, TenSP: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">DANH MỤC *</label>
                                <select required value={formData.MaDM} onChange={e => setFormData({ ...formData, MaDM: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer">
                                    <option value="" disabled className="text-slate-500">-- Chọn danh mục --</option>
                                    {categories.map((c: any) => (
                                        <option key={c.MaDM} value={c.MaDM}>{c.TenDM}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">GIÁ BÁN (VNĐ) *</label>
                                <input required type="number" value={formData.GiaBan} onChange={e => setFormData({ ...formData, GiaBan: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">SỐ LƯỢNG TỒN *</label>
                                <input required type="number" value={formData.SoLuongTon} onChange={e => setFormData({ ...formData, SoLuongTon: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">CPU</label>
                                <input type="text" value={formData.CPU} onChange={e => setFormData({ ...formData, CPU: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">GPU (VGA)</label>
                                <input type="text" value={formData.VGA} onChange={e => setFormData({ ...formData, VGA: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">RAM</label>
                                <input type="text" value={formData.RAM} onChange={e => setFormData({ ...formData, RAM: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ổ CỨNG</label>
                                <input type="text" value={formData.O_Cung} onChange={e => setFormData({ ...formData, O_Cung: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">MÀN HÌNH</label>
                                <input type="text" value={formData.ManHinh} onChange={e => setFormData({ ...formData, ManHinh: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">TRỌNG LƯỢNG (KG)</label>
                                <input type="number" step="0.01" value={formData.TrongLuong} onChange={e => setFormData({ ...formData, TrongLuong: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">MÔ TẢ SẢN PHẨM</label>
                                <textarea rows={4} value={formData.MoTa} onChange={e => setFormData({ ...formData, MoTa: e.target.value })} className="w-full bg-[#1e2330] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500 resize-none"></textarea>
                            </div>

                            <div className="col-span-2 pt-2">
                                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-colors">
                                    {editingId ? "LƯU THAY ĐỔI" : "THÊM SẢN PHẨM VÀO KHO"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}