"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Users, MessageSquareText, Swords, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

// --- HÀM BÓC TÁCH ẢNH ---
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

export default function BenchmarkCommunityPage() {
    const router = useRouter();
    const [laptops, setLaptops] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // THÊM STATE ĐỂ LƯU KẾT QUẢ CHẤM ĐIỂM TỪ AI GEMMA
    const [aiData, setAiData] = useState<Record<number, { score: number, review: string, status: 'idle' | 'loading' | 'done' }>>({});

    useEffect(() => {
        // ĐÃ FIX LỖI BẰNG CÁCH THÊM /laptops/ VÀO ĐƯỜNG DẪN
        fetch('http://localhost:5000/api/laptops/benchmark-data')
            .then(res => {
                if (!res.ok) throw new Error("Sai đường dẫn API");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setLaptops(data);
                    // Khởi tạo state AI mặc định cho tất cả máy
                    const initialAiState: any = {};
                    data.forEach(lap => {
                        initialAiState[lap.MaSP] = { score: 0, review: "", status: 'idle' };
                    });
                    setAiData(initialAiState);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi fetch:", err);
                setIsLoading(false);
            });
    }, []);

    // HÀM GỌI GEMMA 4 ĐÁNH GIÁ (Chỉ gọi khi user bấm nút)
    const handleGetAIVerdict = async (laptop: any) => {
        if (expandedId === laptop.MaSP) {
            setExpandedId(null);
            return;
        }
        setExpandedId(laptop.MaSP);

        // Nếu AI đã chấm máy này rồi thì không cần gọi lại API
        if (aiData[laptop.MaSP]?.status === 'done') return;

        // Cập nhật trạng thái đang tải
        setAiData(prev => ({ ...prev, [laptop.MaSP]: { ...prev[laptop.MaSP], status: 'loading' } }));

        try {
            const res = await fetch('http://localhost:5000/api/laptops/ai-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenSP: laptop.TenSP,
                    cpu: laptop.CPU,
                    ram: laptop.RAM,
                    vga: laptop.VGA,
                    giaBan: laptop.GiaBan
                })
            });
            const data = await res.json();

            setAiData(prev => ({
                ...prev,
                [laptop.MaSP]: { score: data.score || 60, review: data.review || "Chưa thể đánh giá", status: 'done' }
            }));
        } catch (error) {
            setAiData(prev => ({
                ...prev,
                [laptop.MaSP]: { score: 0, review: "Lỗi kết nối vệ tinh AI.", status: 'done' }
            }));
        }
    };

    return (
        <main className="min-h-screen bg-[#080d17] text-white selection:bg-cyan-500/30 pb-32">
            <Navbar />

            <div className="container mx-auto max-w-5xl px-6 py-12 pt-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest mb-6">
                        <Swords size={14} /> AI vs Community
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
                        Đánh Giá <span className="text-cyan-400">Đa Chiều</span>
                    </h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-cyan-500 animate-pulse font-bold tracking-widest uppercase">
                        Đang kết nối Database...
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {laptops.map((laptop) => {
                            const ai = aiData[laptop.MaSP] || { score: 0, review: "", status: 'idle' };
                            const communityScore = laptop.UserScore > 0 ? Math.round(laptop.UserScore) : 50;
                            const delta = communityScore - ai.score;

                            // Phân tích màu sắc viền dựa trên kết quả đối chiếu
                            let verdictColor = "text-slate-400 border-slate-400/30 bg-slate-500/10";
                            if (ai.status === 'done') {
                                if (laptop.TotalReviews === 0) verdictColor = "text-slate-400 border-slate-400/30 bg-slate-500/10";
                                else if (delta > 7) verdictColor = "text-green-400 border-green-400/30 bg-green-500/10"; // Hidden Gem
                                else if (delta < -10) verdictColor = "text-red-400 border-red-400/30 bg-red-500/10"; // Overrated
                                else verdictColor = "text-cyan-400 border-cyan-400/30 bg-cyan-500/10"; // Đồng thuận
                            }

                            return (
                                <div key={laptop.MaSP} className="bg-[#1e293b]/30 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl transition-all hover:border-white/20">
                                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[280px_1fr_160px] gap-8 items-center">
                                        <div className="bg-white rounded-2xl h-52 p-4 flex items-center justify-center shadow-inner overflow-hidden w-full">
                                            <img
                                                src={parseImage(laptop.HinhAnh)}
                                                alt={laptop.TenSP}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>

                                        <div className="w-full flex flex-col gap-5 overflow-hidden">
                                            <div className="w-full">
                                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{laptop.HangSX || "LAPTOP"}</p>
                                                <h3 className="text-2xl font-black text-white leading-snug line-clamp-2 break-words">{laptop.TenSP}</h3>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {/* CỘT AI SCORE HIỂN THỊ ĐỘNG */}
                                                <div className="bg-[#0b1121]/50 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                                                    <BrainCircuit className={ai.status === 'done' ? "text-cyan-400" : "text-slate-500 animate-pulse"} size={28} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">AI Score</span>
                                                        <span className={`text-2xl font-black ${ai.status === 'done' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                            {ai.status === 'done' ? ai.score : (ai.status === 'loading' ? '...' : '?')}
                                                        </span>
                                                        <span className="text-[9px] text-cyan-500/50 mt-0.5 opacity-80 uppercase tracking-wider">Hệ thống đo</span>
                                                    </div>
                                                </div>

                                                {/* CỘT USER SCORE */}
                                                <div className="bg-[#0b1121]/50 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 relative">
                                                    <Users className="text-purple-400" size={28} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">User Score</span>
                                                        <span className="text-2xl font-black text-purple-400">{communityScore}</span>
                                                        <span className="text-[9px] text-purple-400/60 mt-0.5 opacity-80 uppercase tracking-wider">
                                                            ({laptop.TotalReviews || 0} lượt đánh giá)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full flex lg:justify-end">
                                            <button
                                                onClick={() => handleGetAIVerdict(laptop)}
                                                className="w-full bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 text-white border border-white/10 px-4 py-4 rounded-xl text-xs font-black transition-all flex justify-center items-center gap-2 uppercase tracking-widest"
                                            >
                                                {expandedId === laptop.MaSP ? 'Đóng Lại' : '🤖 Gọi AI Phân Tích'}
                                                {expandedId === laptop.MaSP ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`grid transition-all duration-500 ease-in-out ${expandedId === laptop.MaSP ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 mt-2">
                                                <div className={`p-5 rounded-2xl border flex gap-4 items-start ${verdictColor}`}>
                                                    <MessageSquareText size={24} className="shrink-0 mt-1" />
                                                    <div className="w-full">
                                                        <h4 className="font-black uppercase tracking-widest text-xs mb-3">Kết quả AI đối chiếu</h4>

                                                        {/* HIỆN LOADING HOẶC NỘI DUNG TỪ GEMMA */}
                                                        {ai.status === 'loading' ? (
                                                            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                                                                <Loader2 className="animate-spin" size={16} /> AI đang đọc thông số phần cứng...
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3 text-sm font-medium leading-relaxed opacity-90">
                                                                <p><span className="text-cyan-400 font-bold uppercase text-[10px] tracking-widest border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 rounded mr-2">Gemma Nhận Xét</span> {ai.review}</p>

                                                                {laptop.TotalReviews > 0 && (
                                                                    <p>
                                                                        <span className="text-purple-400 font-bold uppercase text-[10px] tracking-widest border border-purple-400/20 bg-purple-500/10 px-2 py-1 rounded mr-2">Phân Tích So Sánh</span>
                                                                        {delta > 7 ? "Hidden Gem (Bảo vật ẩn): Máy hoạt động thực tế ổn định và được cộng đồng yêu thích hơn cả thông số lý thuyết."
                                                                            : delta < -10 ? "Cảnh báo Overrated: Cấu hình mạnh nhưng người dùng thực tế không đánh giá cao, có thể do nhiệt độ hoặc lỗi vặt."
                                                                                : "Đồng thuận tuyệt đối: Hiệu năng phần cứng đúng với những gì cộng đồng mong đợi."}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-6 pt-6 border-t border-current/20 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                                                            <span className="text-xs font-bold opacity-80">Bạn đã trải nghiệm máy này?</span>
                                                            <div className="flex gap-2 w-full sm:w-auto">
                                                                <button
                                                                    onClick={() => router.push(`/product/${laptop.MaSP}`)}
                                                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-current/10 hover:bg-current/20 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
                                                                >
                                                                    Viết Đánh Giá Ngay 🚀
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}