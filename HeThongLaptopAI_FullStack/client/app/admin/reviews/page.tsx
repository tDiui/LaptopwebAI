"use client";
import { useEffect, useState, useMemo } from 'react';
import {
    MessageSquare, Clock, CheckCircle2, Star, Search,
    ThumbsUp, Reply, Trash2, Check, X, Send, ChevronLeft, ChevronRight
} from 'lucide-react';

// Hàm bóc tách ảnh (Đã nâng cấp để sửa lỗi hiển thị)
const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
        const img = Array.isArray(parsed) ? parsed[0] : parsed;
        let cleanImg = img.replace(/[\[\]"]/g, '');
        // Thêm localhost:5000 nếu là ảnh upload local
        if (cleanImg.startsWith('/uploads')) return `http://localhost:5000${cleanImg}`;
        if (cleanImg.startsWith('http')) return cleanImg;
        return `/${cleanImg}`;
    } catch {
        return "/laptop-demo.png";
    }
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // State Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // State Phản hồi
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const fetchReviews = () => {
        fetch('http://localhost:5000/api/admin/reviews')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReviews(data);
                setIsLoading(false);
            })
            .catch(err => console.error("Lỗi fetch:", err));
    };

    useEffect(() => { fetchReviews(); }, []);

    // Reset về trang 1 khi tìm kiếm hoặc lọc
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    // --- CÁC HÀM XỬ LÝ (ACTION) ---
    const updateStatus = async (id: number, status: boolean) => {
        try {
            await fetch(`http://localhost:5000/api/admin/reviews/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThai: status })
            });
            fetchReviews();
        } catch (error) { console.error("Lỗi cập nhật:", error); }
    };

    const deleteReview = async (id: number) => {
        if (!confirm("Xác nhận xóa vĩnh viễn đánh giá này?")) return;
        try {
            await fetch(`http://localhost:5000/api/admin/reviews/${id}`, { method: 'DELETE' });
            fetchReviews();
        } catch (error) { console.error("Lỗi xóa:", error); }
    };

    const submitReply = async (id: number) => {
        if (!replyContent.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
        try {
            await fetch(`http://localhost:5000/api/admin/reviews/${id}/reply`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phanHoi: replyContent })
            });
            setReplyingId(null);
            setReplyContent("");
            fetchReviews();
        } catch (error) { console.error("Lỗi gửi phản hồi:", error); }
    };

    // --- TÍNH TOÁN DỮ LIỆU ---
    const stats = useMemo(() => {
        const total = reviews.length;
        const pending = reviews.filter(r => !r.TrangThai).length;
        const approved = reviews.filter(r => r.TrangThai).length;
        const avgRating = total > 0 ? (reviews.reduce((acc, curr) => acc + curr.SoSao, 0) / total).toFixed(1) : 0;
        return { total, pending, approved, avgRating };
    }, [reviews]);

    const filteredReviews = reviews.filter(rev => {
        const matchSearch = rev.NoiDung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.HoTen?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" ? true : statusFilter === "approved" ? rev.TrangThai : !rev.TrangThai;
        return matchSearch && matchStatus;
    });

    // Cắt mảng để phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-[#0B1121] text-slate-300 p-6 font-sans selection:bg-cyan-500/30">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Quản lý đánh giá</h1>
                <p className="text-sm text-slate-400">Duyệt và quản lý đánh giá sản phẩm từ khách hàng</p>
            </div>

            {/* THỐNG KÊ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <MessageSquare className="text-cyan-400 mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                    <div className="text-xs text-slate-400">Tổng đánh giá</div>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <Clock className="text-yellow-400 mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">{stats.pending}</div>
                    <div className="text-xs text-slate-400">Chờ duyệt</div>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <CheckCircle2 className="text-green-400 mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">{stats.approved}</div>
                    <div className="text-xs text-slate-400">Đã duyệt</div>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <Star className="text-cyan-400 mb-4" size={24} />
                    <div className="text-3xl font-bold text-white mb-1">{stats.avgRating}</div>
                    <div className="text-xs text-slate-400">Đánh giá TB</div>
                </div>
            </div>

            {/* THANH TÌM KIẾM */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, sản phẩm, nội dung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1E293B] border border-slate-700/50 text-white text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#1E293B] border border-slate-700/50 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="pending">Chờ duyệt</option>
                </select>
            </div>

            {/* DANH SÁCH ĐÁNH GIÁ */}
            {isLoading ? (
                <div className="text-center py-10 text-cyan-500 animate-pulse font-bold">Đang tải dữ liệu...</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {currentItems.map((rev) => (
                        <div key={rev.MaDG} className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-5 flex flex-col md:flex-row gap-6 transition-all hover:border-slate-600">

                            {/* Ảnh Sản Phẩm */}
                            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 border border-white/5">
                                <img src={parseImage(rev.HinhAnh)} alt="Product" className="max-w-full max-h-full object-contain" />
                            </div>

                            {/* Nội dung */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                                                {(rev.HoTen || "U")[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white text-sm">{rev.HoTen || "Người dùng ẩn danh"}</span>
                                            <span className="text-[10px] text-teal-400 border border-teal-400/30 bg-teal-400/10 px-2 py-0.5 rounded-full">Đã mua hàng</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <div className="flex text-cyan-400 gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < rev.SoSao ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                            <span>{new Date(rev.NgayDang).toISOString().split('T')[0]}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span className="line-clamp-1">{rev.TenSP}</span>
                                        </div>
                                    </div>

                                    {rev.TrangThai ? (
                                        <span className="text-xs text-green-400 border border-green-400/30 bg-green-400/10 px-3 py-1 rounded-full">Đã duyệt</span>
                                    ) : (
                                        <span className="text-xs text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-1 rounded-full">Từ chối / Chờ duyệt</span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-bold text-white text-base mb-1">Đánh giá sản phẩm</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed">{rev.NoiDung}</p>
                                </div>

                                {/* Hiển thị Phản hồi Admin nếu đã có */}
                                {rev.PhanHoiAdmin && replyingId !== rev.MaDG && (
                                    <div className="bg-[#0f172a]/50 border border-cyan-500/20 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between text-cyan-400 text-xs font-bold mb-2">
                                            <div className="flex items-center gap-2"><Reply size={14} /> Phản hồi từ Admin</div>
                                            <button onClick={() => { setReplyingId(rev.MaDG); setReplyContent(rev.PhanHoiAdmin); }} className="text-slate-500 hover:text-cyan-400">Sửa</button>
                                        </div>
                                        <p className="text-sm text-slate-300">{rev.PhanHoiAdmin}</p>
                                    </div>
                                )}

                                {/* Khung nhập Phản hồi (Toggle) */}
                                {replyingId === rev.MaDG && (
                                    <div className="mb-4 mt-2 bg-[#0f172a] p-3 rounded-xl border border-cyan-500/30">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Nhập nội dung phản hồi khách hàng..."
                                            className="w-full bg-transparent text-sm text-white focus:outline-none resize-none"
                                            rows={2}
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setReplyingId(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Hủy</button>
                                            <button onClick={() => submitReply(rev.MaDG)} className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1.5">
                                                <Send size={14} /> Gửi
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Buttons Action */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <ThumbsUp size={14} /> 0 hữu ích
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!rev.TrangThai ? (
                                            <button onClick={() => updateStatus(rev.MaDG, true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold transition-all">
                                                <Check size={14} /> Duyệt
                                            </button>
                                        ) : (
                                            <button onClick={() => updateStatus(rev.MaDG, false)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-all">
                                                <X size={14} /> Từ chối
                                            </button>
                                        )}

                                        <button
                                            onClick={() => { setReplyingId(rev.MaDG); setReplyContent(rev.PhanHoiAdmin || ""); }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <Reply size={14} /> Phản hồi
                                        </button>

                                        <button onClick={() => deleteReview(rev.MaDG)} className="flex items-center justify-center w-8 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                    {filteredReviews.length === 0 && (
                        <div className="text-center py-20 bg-[#1E293B] border border-slate-700/50 rounded-2xl">
                            <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">Không tìm thấy đánh giá nào!</p>
                        </div>
                    )}

                    {/* UI PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E293B] border border-slate-700/50 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                                ? 'bg-cyan-500 text-slate-900'
                                                : 'bg-[#1E293B] border border-slate-700/50 text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E293B] border border-slate-700/50 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}