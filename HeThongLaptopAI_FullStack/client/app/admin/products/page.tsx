"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        TenSP: '', GiaBan: '', SoLuongTon: '', CPU: '', RAM: '', VGA: ''
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("❌ Lỗi load sản phẩm:", err);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // Xử lý khi chọn ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile)); // Tạo link xem trước tạm thời
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // SỬ DỤNG FORMDATA ĐỂ GỬI FILE
        const data = new FormData();
        data.append('TenSP', formData.TenSP);
        data.append('GiaBan', formData.GiaBan);
        data.append('SoLuongTon', formData.SoLuongTon);
        data.append('CPU', formData.CPU);
        data.append('RAM', formData.RAM);
        data.append('VGA', formData.VGA);
        if (file) {
            data.append('HinhAnh', file);
        }

        try {
            const res = await fetch('http://localhost:5000/api/admin/products', {
                method: 'POST',
                // Lưu ý: Không để Content-Type header khi dùng FormData
                body: data
            });

            if (res.ok) {
                alert("Thêm sản phẩm thành công!");
                setIsModalOpen(false);
                fetchProducts();
            } else {
                const errorData = await res.json();
                alert("Lỗi: " + errorData.error);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500 text-sm">Cấu hình và kho hàng</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} /> Thêm máy mới
                </button>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Ảnh</th>
                            <th className="px-6 py-4">Sản phẩm</th>
                            <th className="px-6 py-4">Giá bán</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((p: any) => (
                            <tr key={p.MaSP} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                                        {p.HinhAnh ? (
                                            <img src={p.HinhAnh} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={18} /></div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{p.TenSP}</div>
                                    <div className="text-xs text-slate-500">{p.CPU} | {p.RAM}</div>
                                </td>
                                <td className="px-6 py-4 text-cyan-400 font-bold">{Number(p.GiaBan).toLocaleString()}đ</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg"><Edit2 size={16} /></button>
                                    <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM SẢN PHẨM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Thêm Laptop mới</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Khu vực Upload Ảnh */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-all relative">
                                {previewUrl ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setFile(null); setPreviewUrl(null); }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white shadow-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center cursor-pointer py-4">
                                        <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-400 mb-2">
                                            <Upload size={24} />
                                        </div>
                                        <span className="text-white font-bold">Chọn ảnh sản phẩm</span>
                                        <span className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-4">
                                <input required placeholder="Tên máy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                                    onChange={e => setFormData({ ...formData, TenSP: e.target.value })} />

                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="number" placeholder="Giá bán (VNĐ)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, GiaBan: e.target.value })} />
                                    <input required type="number" placeholder="Số lượng tồn" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, SoLuongTon: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Cấu hình CPU" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, CPU: e.target.value })} />
                                    <input placeholder="Dung lượng RAM" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        onChange={e => setFormData({ ...formData, RAM: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl mt-4 shadow-lg shadow-cyan-500/20 uppercase tracking-widest">
                                Xác nhận thêm sản phẩm
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}