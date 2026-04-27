"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
    Cpu, Zap, Monitor, HardDrive, ShieldCheck, ChevronLeft,
    Star, ShoppingCart, Heart, Share2, MessageSquare, Info,
    Battery, Weight, Check, Sparkles, Minus, Plus, Loader2
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
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingFav, setIsCheckingFav] = useState(false);

    // --- 1. THÊM STATE SỐ LƯỢNG ---
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:5000/api/laptops/${id}`)
            .then(res => res.json())
            .then((data: Laptop) => setItem(data))
            .catch(err => {
                console.error(err);
                setItem(null);
            });
    }, [id]);
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser || !item) return;

            const user = JSON.parse(storedUser);
            try {
                // Gọi API lấy danh sách yêu thích của User để check
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
    }, [item]); // Chạy lại khi thông tin máy (item) đã load xong

    // 2. Hàm xử lý khi bấm nút Trái tim
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
                body: JSON.stringify({
                    maTK: user.MaTK,
                    maSP: item.MaSP
                })
            });

            const data = await res.json();
            if (res.ok) {
                setIsFavorite(data.action === 'added');
                // Có thể thêm thông báo nhỏ (Toast) ở đây
            }
        } catch (err) {
            alert("Lỗi kết nối rồi bro!");
        } finally {
            setIsCheckingFav(false);
        }
    };
    // --- 2. LOGIC THÊM VÀO GIỎ HÀNG ---
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
                body: JSON.stringify({
                    maTK: user.MaTK,
                    maSP: item.MaSP,
                    soLuong: quantity
                })
            });

            if (res.ok) {
                alert(`🚀 Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            } else {
                const errorData = await res.json();
                alert("Lỗi: " + (errorData.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert("Không kết nối được với Server!");
        } finally {
            setIsAdding(false);
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

    // --- LOGIC XỬ LÝ ẢNH THÔNG MINH ---
    let images: string[] = [];
    if (item.HinhAnh) {
        try {
            // HinhAnh có thể là chuỗi JSON hoặc chuỗi đơn
            if (typeof item.HinhAnh === 'string') {
                const parsed = JSON.parse(item.HinhAnh);
                if (Array.isArray(parsed)) images = parsed;
                else if (typeof parsed === 'string') images = [parsed];
                else images = [item.HinhAnh];
            } else if (Array.isArray(item.HinhAnh)) {
                images = item.HinhAnh;
            } else {
                images = [String(item.HinhAnh)];
            }
        } catch {
            // Nếu không phải JSON, dùng trực tiếp
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
                    {/* Cột 1: Gallery */}
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

                        {/* Thumbnail list */}
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

                    {/* Cột 2: Thông tin & Actions */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />)}
                            </div>
                            <span className="text-slate-400 font-bold ml-2">4.9</span>
                            <span className="text-slate-500 text-xs">(245 đánh giá)</span>
                        </div>

                        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter leading-tight uppercase">{item.TenSP}</h1>

                        {/* AI Performance Card */}
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
                                {/* Nếu đã thích thì fill đỏ, chưa thì để rỗng */}
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

                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <QuickSpec icon={<Cpu size={16} />} label="CPU" value={item.CPU} />
                            <QuickSpec icon={<Zap size={16} />} label="GPU" value={item.VGA} />
                            <QuickSpec icon={<HardDrive size={16} />} label="RAM" value={item.RAM} />
                            <QuickSpec icon={<Monitor size={16} />} label="Display" value={item.ManHinh} />
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-12 rounded-3xl border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden">
                    <div className="flex border-b border-white/10 text-sm font-semibold">
                        <TabItem active={activeTab === 'specs'} onClick={() => setActiveTab('specs')} icon={<Info size={16} />} label="Thông số kỹ thuật" />
                        <TabItem active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon={<Check size={16} />} label="Tính năng" />
                        <TabItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={16} />} label="AI Insights" />
                        <TabItem active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<MessageSquare size={16} />} label="Đánh giá" />
                    </div>

                    <div className="p-10">
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
                                <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl flex gap-3 italic text-cyan-200">
                                    <Sparkles className="shrink-0" /> Gợi ý: Phù hợp cho Video Editing 8K và Machine Learning chuyên sâu.
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="text-center py-10">
                                <MessageSquare size={40} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-lg font-bold text-white mb-2">Chưa có đánh giá nào</h3>
                                <p className="text-slate-500">Hãy là người đầu tiên sở hữu và đánh giá siêu phẩm này nhé bro!</p>
                                <button className="mt-6 text-cyan-400 font-bold border border-cyan-400/30 px-6 py-2 rounded-xl hover:bg-cyan-400/10 transition-all">
                                    Viết đánh giá ngay
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

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