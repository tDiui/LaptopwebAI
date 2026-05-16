"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
    Cpu, Zap, Monitor, HardDrive, ShieldCheck, ChevronLeft,
    Star, ShoppingCart, Heart, MessageSquare, Info,
    Weight, Check, Sparkles, Minus, Plus, Loader2, Send
} from 'lucide-react';

type Laptop = {
    MaSP: number;
    TenSP: string;
    GiaBan: number;
    HinhAnh?: string | string[];
    CPU?: string;
    RAM?: string;
    O_Cung?: string;
    VGA?: string;
    ManHinh?: string;
    TrongLuong?: number;
    MoTa?: string;
    SoLuongTon?: number;
    TrangThai?: boolean;
};

export default function ProductDetail(): JSX.Element {
    const { id } = useParams() as { id?: string };
    const router = useRouter();
    const [item, setItem] = useState<Laptop | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('specs');
    const [similarProducts, setSimilarProducts] = useState<Laptop[]>([]);
    // States cơ bản
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingFav, setIsCheckingFav] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // States Đánh giá
    const [reviews, setReviews] = useState<any[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Load Data
    useEffect(() => {
        if (!id) return;

        // Load thông tin Laptop
        fetch(`http://localhost:5000/api/laptops/${id}`)
            .then(res => res.json())
            .then((data: Laptop) => setItem(data))
            .catch(err => {
                console.error(err);
                setItem(null);
            });

        // Load Đánh giá (chỉ lấy bài đã duyệt)
        fetch(`http://localhost:5000/api/laptops/${id}/reviews`)
            .then(res => res.json())
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(err => console.error("Lỗi fetch reviews:", err));

    }, [id]);

    // 2. Hook fetch sản phẩm tương tự (TÁCH RIÊNG RA ĐÂY)
    useEffect(() => {
        if (!id) return;
        // Lấy máy tương tự dựa trên ID máy hiện tại
        fetch(`http://localhost:5000/api/laptops/similar/${id}`)
            .then(res => res.json())
            .then(data => setSimilarProducts(Array.isArray(data) ? data : []))
            .catch(err => console.error("Lỗi fetch máy tương tự:", err));
    }, [id]);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser || !item) return;

            const user = JSON.parse(storedUser);
            try {
                const res = await fetch(`http://localhost:5000/api/laptops/favorites/${user.MaTK}`);
                const favs = await res.json();
                if (Array.isArray(favs)) {
                    const found = favs.some((fav: any) => fav.MaSP === item.MaSP);
                    setIsFavorite(found);
                }
            } catch (err) {
                console.error("Lỗi check yêu thích:", err);
            }
        };

        checkFavoriteStatus();
    }, [item]);

    // Handle Actions
    const handleToggleFavorite = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("Đăng nhập để thả tim cho siêu phẩm này bro nhé!");
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (!item || isCheckingFav) return;

        setIsCheckingFav(true);
        try {
            const res = await fetch(`http://localhost:5000/api/laptops/toggle-favorite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.MaTK, maSP: item.MaSP })
            });

            const data = await res.json();
            if (res.ok) setIsFavorite(data.action === 'added');
        } catch (err) {
            alert("Lỗi kết nối rồi bro!");
        } finally {
            setIsCheckingFav(false);
        }
    };

    const handleAddToCart = async () => {
        const storedUser = typeof window !== "undefined" ? localStorage.getItem('user') : null;
        if (!storedUser) {
            alert("Bạn cần đăng nhập để mua hàng nhé!");
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (!item) return;

        setIsAdding(true);
        try {
            const res = await fetch(`http://localhost:5000/api/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.MaTK, maSP: item.MaSP, soLuong: quantity })
            });

            if (res.ok) {
                alert(`🚀 Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            } else {
                const errorData = await res.json();
                alert("Lỗi: " + (errorData.error || 'Unknown error'));
            }
        } catch (err) {
            alert("Không kết nối được với Server!");
        } finally {
            setIsAdding(false);
        }
    };

    // HANDLE SUBMIT REVIEW
    const handleSubmitReview = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("Bro cần đăng nhập để viết đánh giá nhé!");
            router.push('/login');
            return;
        }
        if (!newComment.trim()) {
            alert("Bro quên nhập nội dung đánh giá kìa!");
            return;
        }

        const user = JSON.parse(storedUser);
        setIsSubmittingReview(true);

        try {
            const res = await fetch(`http://localhost:5000/api/laptops/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MaTK: user.MaTK,
                    MaSP: item?.MaSP,
                    SoSao: newRating,
                    NoiDung: newComment
                })
            });

            if (res.ok) {
                alert("Cảm ơn bro! Đánh giá đã được gửi và đang chờ Admin duyệt.");
                setNewComment("");
                setNewRating(5);
            } else {
                alert("Có lỗi xảy ra khi gửi đánh giá.");
            }
        } catch (error) {
            alert("Lỗi máy chủ!");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!item) return (
        <div className="min-h-screen bg-[#080d17] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin text-cyan-400"><Loader2 size={40} /></div>
                <p className="text-cyan-400 font-bold italic tracking-widest">🤖 AI ĐANG KHỞI TẠO DỮ LIỆU...</p>
            </div>
        </div>
    );

    // Xử lý ảnh
    let images: string[] = [];
    if (item.HinhAnh) {
        try {
            if (typeof item.HinhAnh === 'string') {
                const parsed = JSON.parse(item.HinhAnh);
                images = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? [parsed] : [item.HinhAnh]);
            } else if (Array.isArray(item.HinhAnh)) {
                images = item.HinhAnh;
            } else {
                images = [String(item.HinhAnh)];
            }
        } catch {
            images = Array.isArray(item.HinhAnh) ? item.HinhAnh : [String(item.HinhAnh)];
        }
    }

    if (images.length === 0) images = ["/laptop-demo.png"];
    images = images.map(img => img.startsWith('http') || img.startsWith('/') ? img : `/${img}`);

    const currentImageIndex = selectedImage >= images.length ? 0 : selectedImage;

    return (
        <main className="min-h-screen bg-[#080d17] text-slate-300 selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto px-6 py-10 pb-40 ">
                <Link href="/" className="flex items-center text-slate-500 hover:text-cyan-400 mb-8 transition-all w-fit group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-widest ml-2">Quay lại danh sách</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* CỘT 1: ẢNH */}
                    <div className="lg:sticky lg:top-28 h-fit space-y-6">
                        <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden aspect-square flex items-center justify-center p-8 group shadow-2xl">
                            <img
                                src={images[currentImageIndex]}
                                alt={item.TenSP}
                                className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 right-6 bg-cyan-500/20 backdrop-blur-md text-cyan-400 text-[10px] font-black px-4 py-2 rounded-full border border-cyan-500/30 z-20">
                                <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" /> AI VERIFIED
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-1 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${currentImageIndex === index
                                            ? 'border-cyan-500 ring-4 ring-cyan-500/10'
                                            : 'border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`thumb-${index}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CỘT 2: THÔNG TIN CƠ BẢN */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />)}
                            </div>
                            <span className="text-slate-400 font-bold ml-2">4.9</span>
                            <span className="text-slate-500 text-xs">({reviews.length} đánh giá)</span>
                        </div>

                        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter leading-tight uppercase">{item.TenSP}</h1>

                        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-cyan-400 bg-cyan-500/10 p-3 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">AI Performance Score</p>
                                    <h4 className="text-2xl font-black text-white">98 <span className="text-xs font-medium text-slate-500 ml-1">Top-tier AI Power</span></h4>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center bg-slate-900/60 border border-white/10 rounded-2xl p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="w-12 text-center font-black text-xl text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                                {item.SoLuongTon ?? 0} sản phẩm có sẵn
                            </p>
                        </div>

                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || (item.SoLuongTon ?? 0) <= 0}
                                className={`flex-1 ${((item.SoLuongTon ?? 0) <= 0) ? 'bg-slate-700' : 'bg-cyan-500 hover:bg-cyan-400'} text-slate-950 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] active:scale-95 disabled:opacity-50`}
                            >
                                {isAdding ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                                {(item.SoLuongTon ?? 0) <= 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                            </button>

                            <button
                                onClick={handleToggleFavorite}
                                disabled={isCheckingFav}
                                className={`w-16 h-16 border rounded-2xl flex items-center justify-center transition-all active:scale-90
                                    ${isFavorite
                                        ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-red-400'
                                    }`}
                            >
                                <Heart
                                    size={20}
                                    fill={isFavorite ? "currentColor" : "none"}
                                    className={isCheckingFav ? "animate-pulse" : ""}
                                />
                            </button>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-5xl font-black text-cyan-400 tracking-tighter mb-1">
                                {new Intl.NumberFormat('vi-VN').format(item.GiaBan)}đ
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Giá đã bao gồm VAT</p>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-8 italic border-l-2 border-cyan-500/30 pl-4 whitespace-pre-line">
                            {item.MoTa || "Siêu phẩm laptop tích hợp chip AI mạnh mẽ, hiệu năng đỉnh cao cho công việc chuyên nghiệp."}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <QuickSpec icon={<Cpu size={16} />} label="CPU" value={item.CPU} />
                            <QuickSpec icon={<Zap size={16} />} label="GPU" value={item.VGA} />
                            <QuickSpec icon={<HardDrive size={16} />} label="RAM" value={item.RAM} />
                            <QuickSpec icon={<Monitor size={16} />} label="Display" value={item.ManHinh} />
                        </div>
                    </div>
                </div>

                {/* TABS NỘI DUNG */}
                <div className="mt-12 rounded-3xl border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden">
                    <div className="flex border-b border-white/10 text-sm font-semibold">
                        <TabItem active={activeTab === 'specs'} onClick={() => setActiveTab('specs')} icon={<Info size={16} />} label="Thông số kỹ thuật" />
                        <TabItem active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon={<Check size={16} />} label="Tính năng" />
                        <TabItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={16} />} label="AI Insights" />
                        <TabItem active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<MessageSquare size={16} />} label={`Đánh giá (${reviews.length})`} />
                    </div>

                    <div className="p-6 md:p-10">
                        {activeTab === 'specs' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                                <DetailRow icon={<Cpu size={16} />} label="Vi xử lý (CPU)" value={item.CPU} />
                                <DetailRow icon={<Zap size={16} />} label="Đồ họa (GPU)" value={item.VGA} />
                                <DetailRow icon={<HardDrive size={16} />} label="Bộ nhớ (RAM)" value={item.RAM} />
                                <DetailRow icon={<Monitor size={16} />} label="Màn hình" value={item.ManHinh} />
                                <DetailRow icon={<HardDrive size={16} />} label="Ổ cứng" value={item.O_Cung} />
                                <DetailRow icon={<Weight size={16} />} label="Trọng lượng" value={item.TrongLuong ? `${item.TrongLuong}kg` : 'Chưa cập nhật'} />
                            </div>
                        )}
                        {activeTab === 'features' && (
                            <div className="space-y-4">
                                {["Hệ thống tản nhiệt AI thông minh", "Màn hình chuẩn màu đồ họa", "Bàn phím RGB tích hợp"].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-white">
                                        <div className="text-cyan-400 bg-cyan-400/10 p-1.5 rounded-lg"><Check size={16} /></div>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <AIStat label="Neural Engine" score="99" />
                                    <AIStat label="Rendering AI" score="96" />
                                    <AIStat label="Model Training" score="94" />
                                    <AIStat label="Overall AI" score="98" />
                                </div>
                            </div>
                        )}

                        {/* TAB ĐÁNH GIÁ ĐÃ CẬP NHẬT */}
                        {activeTab === 'reviews' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                                {/* Form Viết đánh giá */}
                                <div className="lg:col-span-1 bg-slate-900/40 p-6 rounded-2xl border border-white/5 h-fit">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <MessageSquare size={18} className="text-cyan-400" /> Viết đánh giá của bạn
                                    </h3>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Chất lượng sản phẩm</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none">
                                                    <Star
                                                        size={24}
                                                        fill={star <= newRating ? "#eab308" : "none"}
                                                        className={star <= newRating ? "text-yellow-500" : "text-slate-600"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <textarea
                                            rows={4}
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                            className="w-full bg-[#0b1121] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview}
                                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Gửi Đánh Giá
                                    </button>
                                </div>

                                {/* Danh sách đánh giá đã duyệt */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-4">Đánh giá từ cộng đồng</h3>

                                    {reviews.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-slate-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên bóc tem em nó nhé!</p>
                                        </div>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.MaDG} className="bg-slate-800/30 p-5 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                                                            {rev.HoTen ? rev.HoTen[0].toUpperCase() : 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{rev.HoTen}</p>
                                                            <div className="flex text-yellow-500 mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={12} fill={i < rev.SoSao ? "currentColor" : "none"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(rev.NgayDang).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed pl-13">
                                                    {rev.NoiDung}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* --- PHẦN SẢN PHẨM TƯƠNG TỰ --- */}
            <section className="mt-32 space-y-12">
                <div className="space-y-3">
                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase underline decoration-cyan-500/20 underline-offset-8">
                        Sản phẩm tương tự
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
                        Khám phá các siêu phẩm khác cùng phân khúc AI
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {similarProducts.map((sp) => (
                        <Link href={`/product/${sp.MaSP}`} key={sp.MaSP} className="group">
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 hover:border-cyan-500/40 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col shadow-2xl">
                                {/* Image Container */}
                                <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-6 border border-white/5">
                                    <img
                                        src={parseImage(Array.isArray(sp.HinhAnh) ? sp.HinhAnh[0] : String(sp.HinhAnh))}
                                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                        alt={sp.TenSP}
                                    />
                                    <div className="absolute top-3 right-3 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-[9px] font-black px-2 py-1 rounded-lg">
                                        AI: 9{Math.floor(Math.random() * 5 + 4)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ultra Performance</p>
                                        <h3 className="text-base font-black text-white truncate uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                                            {sp.TenSP}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 text-yellow-500/80">
                                        {[1, 2, 3, 4].map(i => <Star key={i} size={10} fill="currentColor" />)}
                                        <Star size={10} className="text-slate-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Cpu size={12} className="text-cyan-500/50" /> {sp.CPU || "Intel Core i9"}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Zap size={12} className="text-cyan-500/50" /> {sp.VGA || "RTX 4070 8GB"}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 mt-auto">
                                        <p className="text-xl font-black text-cyan-400 tracking-tighter">
                                            {new Intl.NumberFormat('vi-VN').format(sp.GiaBan)}₫
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
            {/* --- HẾT PHẦN SẢN PHẨM TƯƠNG TỰ --- */}
        </main>
    );
}

// CÁC COMPONENT PHỤ TRỢ (Giữ nguyên)
type QuickSpecProps = { icon: JSX.Element; label: string; value?: string | number | null };
function QuickSpec({ icon, label, value }: QuickSpecProps): JSX.Element {
    return (
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:border-cyan-500/30 transition-all group">
            <div className="text-cyan-500/60 bg-cyan-500/5 p-2 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-200 truncate">{value ?? 'N/A'}</p>
            </div>
        </div>
    );
}

type AIStatProps = { label: string; score: string | number };
function AIStat({ label, score }: AIStatProps): JSX.Element {
    return (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-cyan-400 mb-1">{score}</div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
        </div>
    );
}

type TabItemProps = { active: boolean; onClick: () => void; icon: JSX.Element; label: string };
function TabItem({ active, onClick, icon, label }: TabItemProps): JSX.Element {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-4 transition
            ${active
                    ? 'bg-cyan-900/40 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
        >
            {icon} {label}
        </button>
    );
}

type DetailRowProps = { icon: JSX.Element; label: string; value?: string | number | null };
function DetailRow({ icon, label, value }: DetailRowProps): JSX.Element {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {icon}
            </div>
            <div>
                <p className="text-base text-slate-400">{label}</p>
                <p className="text-xl font-semibold text-white">{value ?? 'Chưa cập nhật'}</p>
            </div>
        </div>
    );
}

const parseImage = (imgData: any) => {
    if (!imgData) return "/laptop-demo.png";
    try {
        let parsed = typeof imgData === 'string' && imgData.startsWith('[')
            ? JSON.parse(imgData)[0]
            : imgData;
        let cleanImg = String(parsed).replace(/[\[\]"]/g, '');
        return cleanImg.startsWith('http') ? cleanImg : `/${cleanImg.replace(/^\//, '')}`;
    } catch {
        return "/laptop-demo.png";
    }
};