"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Cpu, Zap, Monitor, HardDrive, ShieldCheck, ChevronLeft,
    Star, ShoppingCart, Heart, Share2, MessageSquare, Info,
    Battery, Weight, Check, Sparkles
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function ProductDetail() {
    const { id } = useParams();
    const [item, setItem] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState(0); // State cho gallery ảnh
    const [activeTab, setActiveTab] = useState('specs');

    useEffect(() => {
        fetch(`http://localhost:5000/api/laptops/${id}`)
            .then(res => res.json())
            .then(data => setItem(data))
            .catch(err => console.error(err));
    }, [id]);

    if (!item) return (
        <div className="min-h-screen bg-[#080d17] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin text-cyan-400"><Sparkles size={40} /></div>
                <p className="text-cyan-400 font-bold italic tracking-widest">🤖 AI ĐANG KHỞI TẠO DỮ LIỆU...</p>
            </div>
        </div>
    );

    // Xử lý mảng ảnh: Nếu DB chỉ có 1 ảnh, ta tạo mảng giả lập để Gallery hoạt động giống code 1
    const images = [
        item.HinhAnh ? (item.HinhAnh.startsWith('http') ? item.HinhAnh : `/${item.HinhAnh}`) : "/laptop-demo.png",
        "/laptop-demo.png", // Ảnh dự phòng 1
        "/laptop-demo.png", // Ảnh dự phòng 2
    ];

    return (
        <main className="min-h-screen bg-[#080d17] text-slate-300 selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto px-6 py-10 pb-40 ">
                {/* Header Back Button */}
                <Link href="/" className="flex items-center text-slate-500 hover:text-cyan-400 mb-8 transition-all w-fit group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-widest ml-2">Quay lại danh sách</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Cột 1: Gallery (Bê nguyên logic chọn ảnh từ code 1) */}
                    <div className="lg:sticky lg:top-28 h-fit space-y-6">
                        <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden aspect-square flex items-center justify-center p-8 group shadow-2xl">
                            <img
                                src={images[selectedImage]}
                                alt={item.TenSP}
                                className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 right-6 bg-cyan-500/20 backdrop-blur-md text-cyan-400 text-[10px] font-black px-4 py-2 rounded-full border border-cyan-500/30 z-20">
                                <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" /> AI VERIFIED
                            </div>
                        </div>

                        {/* Thumbnail list từ code 1 */}
                        <div className="flex gap-4">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-1 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-cyan-500 ring-4 ring-cyan-500/10' : 'border-white/5 opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>
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

                        {/* AI Performance Card (Giao diện chuyên nghiệp hơn) */}
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

                        <div className="mb-8">
                            <h2 className="text-5xl font-black text-cyan-400 tracking-tighter mb-1">
                                {new Intl.NumberFormat('vi-VN').format(item.GiaBan)}đ
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Giá đã bao gồm VAT</p>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-8 italic border-l-2 border-cyan-500/30 pl-4">
                            {item.MoTa || "Siêu phẩm laptop tích hợp chip AI mạnh mẽ, hiệu năng đỉnh cao cho công việc chuyên nghiệp."}
                        </p>

                        <div className="flex gap-4 mb-10">
                            <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] active:scale-95">
                                <ShoppingCart size={20} /> THÊM VÀO GIỎ HÀNG
                            </button>
                            <button className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-red-500 transition-all"><Heart size={20} /></button>
                        </div>

                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <QuickSpec icon={<Cpu size={16} />} label="CPU" value={item.CPU} />
                            <QuickSpec icon={<Zap size={16} />} label="GPU" value={item.VGA} />
                            <QuickSpec icon={<HardDrive size={16} />} label="RAM" value={item.RAM} />
                            <QuickSpec icon={<Monitor size={16} />} label="Display" value={item.ManHinh} />
                        </div>
                    </div>
                </div>

                {/* Tabs Section nâng cấp từ code 1 */}
                <div className="mt-12 rounded-3xl border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden">
                    <div className="flex border-b border-white/10 text-sm font-semibold">
                        <TabItem active={activeTab === 'specs'} onClick={() => setActiveTab('specs')} icon={<Info size={16} />} label="Thông số kỹ thuật" />
                        <TabItem active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon={<Check size={16} />} label="Tính năng" />
                        <TabItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={16} />} label="AI Insights" />
                        <TabItem
                            active={activeTab === 'reviews'}
                            onClick={() => setActiveTab('reviews')}
                            icon={<MessageSquare size={16} />}
                            label="Đánh giá"
                        />
                    </div>

                    <div className="p-10">
                        {activeTab === 'specs' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                                <DetailRow icon={<Cpu size={16} />} label="Vi xử lý (CPU)" value={item.CPU} />
                                <DetailRow icon={<Zap size={16} />} label="Đồ họa (GPU)" value={item.VGA} />
                                <DetailRow icon={<HardDrive size={16} />} label="Bộ nhớ (RAM)" value={item.RAM} />
                                <DetailRow icon={<Monitor size={16} />} label="Màn hình" value={item.ManHinh} />
                                <DetailRow icon={<Battery size={16} />} label="Pin" value="99.9Wh" />
                                <DetailRow icon={<Weight size={16} />} label="Trọng lượng" value={`${item.TrongLuong || '2.1'}kg`} />
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


function QuickSpec({ icon, label, value }: any) {
    return (
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:border-cyan-500/30 transition-all group">
            <div className="text-cyan-500/60 bg-cyan-500/5 p-2 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-200 truncate">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function AIStat({ label, score }: any) {
    return (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-cyan-400 mb-1">{score}</div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
        </div>
    );
}

function TabItem({ active, onClick, icon, label }: any) {
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

function DetailRow({ icon, label, value }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {icon}
            </div>

            <div>
                <p className="text-base text-slate-400">{label}</p>
                <p className="text-xl font-semibold text-white">{value || 'Chưa cập nhật'}</p>
            </div>
        </div>
    );
}
