"use client";
import { useEffect, useState } from 'react';
import {
    Search, Filter, Grid, List, Cpu, Zap, Star,
    ChevronDown, ChevronRight, ChevronLeft, X,
    Sparkles, Scale, Trash2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

export default function ProductsPage() {
    // --- 1. QUẢN LÝ STATE ---
    const [allLaptops, setAllLaptops] = useState<any[]>([]);
    const [filteredLaptops, setFilteredLaptops] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

    // --- STATE SO SÁNH (COMPARE) ---
    const [compareList, setCompareList] = useState<any[]>([]);

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // --- 2. GỌI API & KHỞI TẠO ---
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

        // Lấy danh sách Danh mục
        fetch('http://localhost:5000/api/admin/categories')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setCategories(data) : setCategories([]))
            .catch(err => console.error("Lỗi fetch categories:", err));

        // Lấy danh sách so sánh từ localStorage
        const savedCompare = localStorage.getItem('compareList');
        if (savedCompare) setCompareList(JSON.parse(savedCompare));
    }, []);

    // --- 3. LOGIC LỌC TỔNG HỢP ---
    useEffect(() => {
        const results = allLaptops.filter(laptop => {
            const matchesSearch = (laptop.TenSP || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (laptop.HangSX || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCat = selectedCategory === 'Tất cả' ||
                laptop.MaDM?.toString() === selectedCategory ||
                laptop.TenDanhMuc === selectedCategory ||
                laptop.TenDM === selectedCategory;

            return matchesSearch && matchesCat;
        });

        setFilteredLaptops(results);
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, allLaptops]);

    // --- 4. LOGIC SO SÁNH ---
    const toggleCompare = (laptop: any) => {
        const isExist = compareList.find(item => item.MaSP === laptop.MaSP);
        let newList;
        if (isExist) {
            newList = compareList.filter(item => item.MaSP !== laptop.MaSP);
        } else {
            if (compareList.length >= 4) return alert("Chỉ so sánh tối đa 4 máy!");
            newList = [...compareList, laptop];
        }
        setCompareList(newList);
        localStorage.setItem('compareList', JSON.stringify(newList));
    };

    const clearCompare = () => {
        setCompareList([]);
        localStorage.removeItem('compareList');
    };

    // --- 5. TOÁN HỌC PHÂN TRANG ---
    const totalPages = Math.ceil(filteredLaptops.length / itemsPerPage);
    const currentLaptops = filteredLaptops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-[#080d17] text-white selection:bg-cyan-500/30 font-sans">
            <Navbar />

            <div className="container mx-auto max-w-7xl px-6 py-12 pb-40">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        Khám phá <span className="text-cyan-400 uppercase">Laptop AI</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                        {filteredLaptops.length} sản phẩm được tìm thấy
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-5 mb-16">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm laptop theo tên, hãng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e293b]/30 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-cyan-500/50 transition-all text-sm text-slate-300"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Dropdown Danh Mục */}
                        <div className="relative z-30">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="bg-[#1e293b]/30 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all group min-w-[200px]"
                            >
                                <Filter size={18} className="text-cyan-400" />
                                <span>{selectedCategory === 'Tất cả' ? 'Danh Mục' : selectedCategory}</span>
                                <ChevronDown size={16} className={`ml-auto transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full mt-3 right-0 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-full min-w-[220px] shadow-2xl animate-in fade-in slide-in-from-top-2">
                                    <button onClick={() => { setSelectedCategory('Tất cả'); setShowFilterMenu(false); }} className="w-full text-left p-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/5">Tất cả</button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.MaDM}
                                            onClick={() => { setSelectedCategory(cat.MaDM.toString()); setShowFilterMenu(false); }}
                                            className="w-full text-left p-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/5"
                                        >
                                            {cat.TenDM}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Mode */}
                        <div className="bg-[#1e293b]/30 border border-white/10 rounded-2xl p-1.5 flex gap-1">
                            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}><Grid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}><List size={18} /></button>
                        </div>
                    </div>
                </div>

                {/* Danh sách Sản phẩm */}
                {currentLaptops.length > 0 ? (
                    <>
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
                            {currentLaptops.map((laptop: any) => (
                                <div key={laptop.MaSP} className="relative">
                                    {viewMode === 'grid' ? (
                                        <ProductCard laptop={laptop} onCompare={() => toggleCompare(laptop)} isComparing={!!compareList.find(i => i.MaSP === laptop.MaSP)} />
                                    ) : (
                                        <ProductListCard laptop={laptop} onCompare={() => toggleCompare(laptop)} isComparing={!!compareList.find(i => i.MaSP === laptop.MaSP)} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-20">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 disabled:opacity-20"><ChevronLeft /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i} onClick={() => paginate(i + 1)}
                                        className={`w-12 h-12 rounded-full font-black text-xs ${currentPage === i + 1 ? 'bg-cyan-500 text-slate-900' : 'bg-white/5'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 disabled:opacity-20"><ChevronRight /></button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-40 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-500">AI không tìm thấy thực thể nào!</h3>
                    </div>
                )}
            </div>

            {/* --- THANH SO SÁNH STICKY (COMPARE BAR) --- */}
            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0f172a]/80 backdrop-blur-2xl border-t border-cyan-500/30 p-6 animate-in slide-in-from-bottom-full duration-500">
                    <div className="container mx-auto max-w-7xl flex items-center justify-between gap-8">
                        <div className="hidden lg:block shrink-0">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <Scale size={24} />
                                <div>
                                    <p className="font-black text-sm uppercase">So sánh Laptop</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{compareList.length}/4 sản phẩm</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            {compareList.map(item => (
                                <div key={item.MaSP} className="relative min-w-[120px] lg:min-w-[180px] bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-3 group">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                                        <img src={parseImage(item.HinhAnh)} className="w-10 h-10 object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white truncate uppercase">{item.TenSP}</p>
                                        <p className="text-[9px] text-cyan-400 font-bold">{new Intl.NumberFormat('vi-VN').format(item.GiaBan)}đ</p>
                                    </div>
                                    <button
                                        onClick={() => toggleCompare(item)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    ><X size={10} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <button onClick={clearCompare} className="text-slate-500 hover:text-white transition-colors"><Trash2 size={20} /></button>
                            <Link href="/compare">
                                <button className="bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                                    So sánh ngay <ArrowRight size={16} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// --- HELPER PARSE ẢNH ---
const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
        const img = Array.isArray(parsed) ? parsed[0] : parsed;
        let cleanImg = img.replace(/[\[\]"]/g, '');
        return cleanImg.startsWith('http') ? cleanImg : `/${cleanImg}`;
    } catch { return "/laptop-demo.png"; }
};

// --- SUB-COMPONENT: PRODUCTLISTCARD ---
function ProductListCard({ laptop, onCompare, isComparing }: { laptop: any, onCompare: () => void, isComparing: boolean }) {
    const mockAiScore = 90 + ((laptop.MaSP || 0) % 10);

    return (
        <div className={`bg-[#1e293b]/40 backdrop-blur-xl border rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center hover:bg-[#1e293b]/60 transition-all group ${isComparing ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/10'}`}>
            <div className="w-full md:w-[200px] aspect-video rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center p-4">
                <img src={parseImage(laptop.HinhAnh)} alt={laptop.TenSP} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                    <p className="text-cyan-500 text-[9px] font-black uppercase tracking-widest">{laptop.TenDM || "PREMIUM"}</p>
                    <div className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 text-[8px] font-black px-2 py-0.5 rounded-full border border-cyan-500/20">
                        <Sparkles size={8} /> AI: {mockAiScore}
                    </div>
                </div>
                <h3 className="text-white text-lg font-black tracking-tight">{laptop.TenSP}</h3>
                <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                        <Cpu size={14} className="text-cyan-500/50" /> {laptop.CPU || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                        <Zap size={14} className="text-cyan-500/50" /> {laptop.VGA || "N/A"}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-4 md:pl-10 md:border-l border-white/5">
                <div className="text-right">
                    <p className="text-cyan-400 text-2xl font-black tracking-tighter">{new Intl.NumberFormat('vi-VN').format(laptop.GiaBan)}đ</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCompare}
                        className={`p-3 rounded-xl border transition-all ${isComparing ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-white/10 text-slate-400 hover:border-cyan-500/50'}`}
                    >
                        <Scale size={18} />
                    </button>
                    <Link href={`/product/${laptop.MaSP}`}>
                        <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Chi tiết</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}