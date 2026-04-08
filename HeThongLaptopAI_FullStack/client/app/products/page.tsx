"use client";
import { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, Cpu, Zap, Star, ChevronDown, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react'; // Đã thêm ChevronLeft
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
// import Footer from '../components/Footer'; // Nếu có Footer thì mở lại dòng này

export default function ProductsPage() {
    // --- 1. QUẢN LÝ STATE ---
    const [allLaptops, setAllLaptops] = useState<any[]>([]);
    const [filteredLaptops, setFilteredLaptops] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]); // Thêm State chứa danh mục động
    const [searchTerm, setSearchTerm] = useState("");

    // Switch Grid/List
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // State cho Bộ lọc Danh mục (Đồng bộ với Admin)
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Hiển thị 8 sản phẩm 1 trang

    // --- 2. GỌI API LẤY DỮ LIỆU ---
    useEffect(() => {
        // Lấy danh sách sản phẩm
        fetch('http://localhost:5000/api/laptops')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllLaptops(data);
                    setFilteredLaptops(data);
                }
            })
            .catch(err => console.error("Lỗi fetch laptops:", err));

        // Lấy danh sách Danh mục từ Database
        fetch('http://localhost:5000/api/admin/categories')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setCategories(data) : setCategories([]))
            .catch(err => console.error("Lỗi fetch categories:", err));
    }, []);

    // --- 3. LOGIC LỌC TỔNG HỢP (TÌM KIẾM + DANH MỤC) ---
    useEffect(() => {
        const results = allLaptops.filter(laptop => {
            // Điều kiện 1: Tìm kiếm
            const matchesSearch = (laptop.TenSP || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (laptop.HangSX || '').toLowerCase().includes(searchTerm.toLowerCase());

            // Điều kiện 2: Lọc theo Danh mục (So sánh mã hoặc tên)
            const matchesCat = selectedCategory === 'Tất cả' ||
                laptop.MaDM?.toString() === selectedCategory ||
                laptop.TenDanhMuc === selectedCategory ||
                laptop.TenDM === selectedCategory;

            return matchesSearch && matchesCat;
        });

        setFilteredLaptops(results);
        setCurrentPage(1); // Tự động quay về trang 1 khi lọc
    }, [searchTerm, selectedCategory, allLaptops]);

    // --- 4. TOÁN HỌC PHÂN TRANG ---
    const totalPages = Math.ceil(filteredLaptops.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLaptops = filteredLaptops.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-[#080d17] text-white selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto max-w-7xl px-6 py-12 pb-32">
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        Khám phá <span className="text-cyan-400 uppercase">Laptop AI</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                        {filteredLaptops.length} sản phẩm được tìm thấy
                    </p>
                </div>

                {/* --- THANH CÔNG CỤ --- */}
                <div className="flex flex-col lg:flex-row gap-5 mb-16">
                    {/* Ô tìm kiếm */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm laptop theo tên, hãng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e293b]/30 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-cyan-500/50 transition-all italic text-sm text-slate-300 placeholder:text-slate-600"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px] font-black tracking-widest">
                                XÓA
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Nút Bộ lọc (Dropdownt đã đổi sang Danh Mục) */}
                        <div className="relative z-30">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="bg-[#1e293b]/30 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all group min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Filter size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span>Bộ lọc</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Menu Lọc (Dropdown) */}
                            {showFilterMenu && (
                                <div className="absolute top-full mt-3 right-0 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-full min-w-[220px] shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest p-2">Lọc theo Danh mục</h4>

                                    <button
                                        onClick={() => { setSelectedCategory('Tất cả'); setShowFilterMenu(false); }}
                                        className={`w-full text-left p-2.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === 'Tất cả' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-white/5'}`}
                                    >
                                        Tất cả danh mục
                                    </button>

                                    {categories.map(cat => {
                                        const catId = (cat.MaDM || cat.MaDanhMuc || cat.TenDM)?.toString();
                                        return (
                                            <button
                                                key={catId}
                                                onClick={() => { setSelectedCategory(catId); setShowFilterMenu(false); }}
                                                className={`w-full text-left p-2.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === catId ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-white/5'}`}
                                            >
                                                {cat.TenDM || cat.TenDanhMuc}
                                            </button>
                                        )
                                    })}
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
                {currentLaptops.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {currentLaptops.map((laptop: any) => (
                                    <ProductCard key={laptop.MaSP || laptop.id} laptop={laptop} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {currentLaptops.map((laptop: any) => (
                                    <ProductListCard key={laptop.MaSP || laptop.id} laptop={laptop} />
                                ))}
                            </div>
                        )}

                        {/* --- THANH PHÂN TRANG (PAGINATION) --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-10">
                                <button
                                    onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1e293b]/50 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                ><ChevronLeft size={20} /></button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (totalPages > 5 && (page < currentPage - 1 || page > currentPage + 1) && page !== 1 && page !== totalPages) {
                                        if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-2 text-slate-500">...</span>;
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={page} onClick={() => paginate(page)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-black transition-all ${currentPage === page ? 'bg-cyan-500 text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-[#1e293b]/50 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/50'}`}
                                        >{page}</button>
                                    );
                                })}

                                <button
                                    onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1e293b]/50 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                ><ChevronRight size={20} /></button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Trạng thái không tìm thấy thực thể */
                    <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-slate-900/10">
                        <Search size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-500 italic">AI không tìm thấy thực thể "{searchTerm}"</h3>
                        <p className="text-slate-600 text-sm mt-2 font-medium uppercase tracking-widest">Thử một từ khóa hoặc bộ lọc khác xem sao bro!</p>
                        <button
                            onClick={() => { setSearchTerm(""); setSelectedCategory('Tất cả'); }}
                            className="mt-8 text-cyan-400 font-black border border-cyan-400/30 px-6 py-2.5 rounded-xl hover:bg-cyan-400/10 transition-all text-[11px] uppercase tracking-widest"
                        >
                            Reset tìm kiếm & lọc
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

// --- HÀM BÓC TÁCH ẢNH JSON TỰ ĐỘNG ---
const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
        const img = Array.isArray(parsed) ? parsed[0] : parsed;
        let cleanImg = img.replace(/[\[\]"]/g, '');
        return cleanImg.startsWith('http') || cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
    } catch {
        return "/laptop-demo.png";
    }
};

// --- SUB-COMPONENT: PRODUCTLISTCARD ---
function ProductListCard({ laptop }: { laptop: any }) {
    // Render điểm ảo cho ngầu
    const mockAiScore = 90 + ((laptop.MaSP || 0) % 10);

    return (
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center hover:border-cyan-500/50 transition-all group shadow-lg">
            {/* Thumbnail có tích hợp parseImage */}
            <div className="w-full md:w-[220px] aspect-[4/3] rounded-xl overflow-hidden bg-white/5 shrink-0 p-2 flex items-center justify-center">
                <img
                    src={parseImage(laptop.HinhAnh)}
                    alt={laptop.TenSP}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
                />
            </div>

            {/* Thông tin chữ & Specs */}
            <div className="flex-grow space-y-3 w-full">
                <p className="text-cyan-500 text-[10px] font-black uppercase tracking-widest">{laptop.TenDanhMuc || laptop.TenDM || "LAPTOP"}</p>
                <h3 className="text-white text-xl font-black truncate tracking-tight leading-tight">{laptop.TenSP}</h3>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-slate-600"} />)}
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 text-[9px] font-black tracking-widest px-3 py-1 rounded-full border border-cyan-500/30">
                        <Sparkles size={10} /> AI Score: {mockAiScore}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    {laptop.CPU && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Cpu size={14} className="text-cyan-500/70 shrink-0" />
                            <span className="truncate">CPU: {laptop.CPU}</span>
                        </div>
                    )}
                    {laptop.VGA && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <Zap size={14} className="text-cyan-500/70 shrink-0" />
                            <span className="truncate">GPU: {laptop.VGA}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Giá & Hành động */}
            <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center md:items-end gap-3 md:border-l border-white/5 md:pl-10 shrink-0">
                <div className="text-left md:text-right">
                    <span className="text-cyan-400 text-2xl font-black tracking-tighter">
                        {new Intl.NumberFormat('vi-VN').format(laptop.GiaBan || 0)}đ
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