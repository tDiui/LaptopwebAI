"use client";
import { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, Cpu, Zap, Star, ChevronDown, ChevronRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
// Vẫn import ProductCard cũ (dùng cho dạng lưới)
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductsPage() {
    // --- 1. QUẢN LÝ STATE ---
    const [allLaptops, setAllLaptops] = useState<any[]>([]); // Danh sách gốc từ DB
    const [filteredLaptops, setFilteredLaptops] = useState<any[]>([]); // Danh sách hiển thị sau khi lọc
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm

    // Switch Grid/List - Mặc định là 'grid' như Ảnh 2
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // State cho Bộ lọc
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

    // --- 2. GỌI API LẤY DỮ LIỆU ---
    useEffect(() => {
        fetch('http://localhost:5000/api/laptops')
            .then(res => res.json())
            .then(data => {
                setAllLaptops(data);
                setFilteredLaptops(data); // Ban đầu hiển thị tất cả
            })
            .catch(err => console.error("Lỗi fetch:", err));
    }, []);

    // --- 3. LOGIC LỌC TỔNG HỢP (TÌM KIẾM + HÃNG) ---
    useEffect(() => {
        const results = allLaptops.filter(laptop => {
            // Điều kiện 1: Tìm kiếm (Search)
            const matchesSearch =
                laptop.TenSP.toLowerCase().includes(searchTerm.toLowerCase()) ||
                laptop.HangSX?.toLowerCase().includes(searchTerm.toLowerCase());

            // Điều kiện 2: Lọc theo Hãng (Brand Filter)
            const matchesBrand = selectedBrand ? laptop.HangSX === selectedBrand : true;

            // Cả hai điều kiện phải đúng
            return matchesSearch && matchesBrand;
        });
        setFilteredLaptops(results);
    }, [searchTerm, selectedBrand, allLaptops]); // Chạy lại mỗi khi gõ phím hoặc dữ liệu gốc thay đổi

    // Lấy danh sách hãng duy nhất để làm bộ lọc
    const uniqueBrands = [...new Set(allLaptops.map(l => l.HangSX))].filter(Boolean) as string[];

    return (
        <main className="min-h-screen bg-[#080d17] text-white selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto max-w-7xl px-6 py-12 pb-32"> {/* Thêm pb-32 tạo khoảng cách Footer */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        Khám phá <span className="text-cyan-400 uppercase">Laptop AI</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                        {filteredLaptops.length} sản phẩm được tìm thấy
                    </p>
                </div>

                {/* --- THANH CÔNG CỤ (SEARCH + FILTER + VIEW TOGGLE) --- */}
                <div className="flex flex-col lg:flex-row gap-5 mb-16">
                    {/* Ô tìm kiếm */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm laptop theo tên, hãng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật state khi gõ
                            className="w-full bg-[#1e293b]/30 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-cyan-500/50 transition-all italic text-sm text-slate-300 placeholder:text-slate-600"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px] font-black tracking-widest"
                            >
                                XÓA
                            </button>
                        )}
                    </div>

                    {/* Bộ lọc & View Mode (Khôi phục từ Ảnh 2) */}
                    <div className="flex items-center gap-3">
                        {/* Nút Bộ lọc */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)} // Toggle menu
                                className="bg-[#1e293b]/30 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all group min-w-[150px] justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Filter size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span>Bộ lọc</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Menu Lọc (Dropdown) */}
                            {showFilterMenu && (
                                <div className="absolute top-full mt-3 right-0 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-[200px] shadow-2xl z-30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest p-2">Lọc theo Hãng</h4>
                                    {uniqueBrands.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => { setSelectedBrand(brand); setShowFilterMenu(false); }}
                                            className={`w-full text-left p-2.5 rounded-lg text-xs font-bold transition-all ${selectedBrand === brand ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-white/5'}`}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                    {selectedBrand && (
                                        <button
                                            onClick={() => { setSelectedBrand(null); setShowFilterMenu(false); }}
                                            className="w-full text-left p-2.5 rounded-lg text-xs font-black text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                                        >
                                            <X size={14} /> XÓA LỌC HÃNG
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="bg-[#1e293b]/30 border border-white/10 rounded-2xl p-1.5 flex gap-1 items-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- LƯỚI SẢN PHẨM (Grid vs List) --- */}
                {filteredLaptops.length > 0 ? (
                    viewMode === 'grid' ? (
                        /* Layout Grid: Giữ nguyên lướt như cũ */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredLaptops.map((laptop: any) => (
                                <ProductCard key={laptop.MaSP || laptop.id} laptop={laptop} />
                            ))}
                        </div>
                    ) : (
                        /* Layout List: Giao diện danh sách dọc mới */
                        <div className="flex flex-col gap-4 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredLaptops.map((laptop: any) => (
                                <ProductListCard key={laptop.MaSP || laptop.id} laptop={laptop} />
                            ))}
                        </div>
                    )
                ) : (
                    /* Trạng thái không tìm thấy thực thể */
                    <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-slate-900/10">
                        <Search size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-500 italic">AI không tìm thấy thực thể "{searchTerm || selectedBrand}"</h3>
                        <p className="text-slate-600 text-sm mt-2 font-medium uppercase tracking-widest">Thử một từ khóa hoặc bộ lọc khác xem sao bro!</p>
                        {(searchTerm || selectedBrand) && (
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedBrand(null); }}
                                className="mt-8 text-cyan-400 font-black border border-cyan-400/30 px-6 py-2.5 rounded-xl hover:bg-cyan-400/10 transition-all text-[11px] uppercase tracking-widest"
                            >
                                Reset tìm kiếm & lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

// --- SUB-COMPONENT: PRODUCTLISTCARD (Cho dạng hiển thị dọc) ---
function ProductListCard({ laptop }: { laptop: any }) {
    return (
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center hover:border-cyan-500/50 transition-all group shadow-lg">
            {/* Thumbnail */}
            <div className="w-full md:w-[220px] aspect-[4/3] rounded-xl overflow-hidden bg-slate-950/50 shrink-0">
                <img
                    src={laptop.HinhAnh ? (laptop.HinhAnh.startsWith('http') ? laptop.HinhAnh : `/${laptop.HinhAnh}`) : "/laptop-demo.png"}
                    alt={laptop.TenSP}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
            </div>

            {/* Thông tin chữ & Specs */}
            <div className="flex-grow space-y-3">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{laptop.HangSX || "ASUS"}</p>
                <h3 className="text-white text-xl font-black truncate tracking-tight uppercase leading-tight">{laptop.TenSP}</h3>

                {/* Rating & specs */}
                <div className="flex items-center gap-4 py-2">
                    <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-slate-600"} />)}
                    </div>
                    <div className="flex gap-1.5 text-cyan-400 bg-cyan-500/10 text-[9px] font-black tracking-widest px-3 py-1 rounded-full border border-cyan-500/30">
                        <Sparkles size={10} /> AI Score: 98
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Cpu size={14} className="text-cyan-500/70" />
                        <span className="truncate">CPU: {laptop.CPU || 'M3 Pro'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Zap size={14} className="text-cyan-500/70" />
                        <span className="truncate">GPU: {laptop.VGA || '14-core GPU'}</span>
                    </div>
                </div>
            </div>

            {/* Giá & Hành động */}
            <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center md:items-end gap-3 md:border-l border-white/5 md:pl-10 shrink-0">
                <div className="text-left md:text-right">
                    <span className="text-cyan-400 text-2xl font-black tracking-tighter">
                        {new Intl.NumberFormat('vi-VN').format(laptop.GiaBan || 49990000)}đ
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Giá bao gồm VAT</p>
                </div>
                <Link href={`/product/${laptop.MaSP || laptop.id}`}>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-1 group/btn">
                        XEM CHI TIẾT <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </Link>
            </div>
        </div>
    );
}