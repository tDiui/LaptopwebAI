"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, CreditCard, Truck, MapPin,
    User, Phone, ChevronLeft, Loader2, CheckCircle2, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        hoTen: '',
        soDienThoai: '',
        diaChi: '',
        ghiChu: '',
        phuongThucTT: 'Tiền mặt (COD)'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // KIỂM TRA: Nếu MaTK không tồn tại hoặc bằng 213 (ID cũ lỗi), nhắc người dùng đăng nhập lại
                if (!userData.MaTK || userData.MaTK === 213) {
                    console.warn("Phát hiện ID cũ hoặc lỗi, yêu cầu đăng nhập lại");
                }

                setUser(userData);
                setFormData(prev => ({
                    ...prev,
                    hoTen: userData.HoTen || '',
                    soDienThoai: userData.SoDienThoai || ''
                }));
                fetchCart(userData.MaTK);
            } catch (e) {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    }, []);

    const fetchCart = async (maTK: number) => {
        try {
            // SỬ DỤNG DẤU HUYỀN (BACKTICK) ĐỂ TRUYỀN BIẾN
            const res = await fetch(`http://localhost:5000/api/cart/${maTK}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length === 0) {
                router.push('/cart');
            }
            setCartItems(data);
        } catch (err) {
            console.error("Lỗi lấy giỏ hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.GiaBan * item.SoLuong), 0);

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.MaTK) return alert("Lỗi xác thực người dùng, vui lòng đăng nhập lại!");
        if (!formData.diaChi || !formData.soDienThoai) return alert("Nhập đủ địa chỉ và số điện thoại nhé bro!");

        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maTK: user.MaTK, // Đảm bảo gửi MaTK thực tế (ví dụ: 1)
                    tongTien: subtotal,
                    phuongThucTT: formData.phuongThucTT,
                    diaChi: formData.diaChi,
                    soDienThoai: formData.soDienThoai,
                    ghiChu: formData.ghiChu,
                    items: cartItems // Gửi danh sách sản phẩm để lưu vào ChiTietDonHang
                })
            });

            const result = await res.json();
            if (result.success) {
                setOrderId(result.maDH);
                if (formData.phuongThucTT === 'Tiền mặt (COD)') {
                    alert("🎉 Đặt hàng thành công! Đang chuyển hướng về hồ sơ...");
                    router.push('/profile');
                } else {
                    setShowQRModal(true);
                }
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (err) {
            alert("Không kết nối được với Server Backend!");
        } finally {
            setIsProcessing(false);
        }
    };

    const parseImage = (imgData: string) => {
        if (!imgData) return "/laptop-demo.png";
        try {
            let parsed = typeof imgData === 'string' && imgData.startsWith('[') ? JSON.parse(imgData)[0] : imgData;
            let cleanImg = parsed.replace(/[\[\]"]/g, '');
            return cleanImg.startsWith('http') ? cleanImg : `http://localhost:5000/${cleanImg.replace(/^\//, '')}`;
        } catch (e) {
            return "/laptop-demo.png";
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#080d17] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <p className="text-cyan-400 font-black tracking-widest uppercase text-xs">AI đang quét dữ liệu thanh toán...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#080d17] text-slate-300 flex flex-col selection:bg-cyan-500/30">
            <Navbar />

            <div className="container mx-auto max-w-6xl px-6 py-12 flex-grow">
                <Link href="/cart" className="flex items-center text-slate-500 hover:text-cyan-400 mb-8 transition-all w-fit group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">Quay lại giỏ hàng</span>
                </Link>

                <h1 className="text-5xl font-black text-white mb-12 tracking-tighter italic uppercase underline decoration-cyan-500/20 underline-offset-8">Xác nhận thanh toán</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* CỘT 1: THÔNG TIN GIAO HÀNG */}
                    <div className="space-y-10">
                        <section className="space-y-8 bg-slate-900/20 p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <MapPin size={22} /> <h2 className="text-xl font-black uppercase tracking-tight italic">Địa chỉ nhận hàng</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Họ tên người nhận</label>
                                    <input
                                        type="text" required value={formData.hoTen}
                                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:border-cyan-500/50 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Số điện thoại</label>
                                    <input
                                        type="tel" required value={formData.soDienThoai}
                                        onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:border-cyan-500/50 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Địa chỉ chi tiết</label>
                                <textarea
                                    rows={3} required value={formData.diaChi}
                                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                                    placeholder="Số nhà, tên đường, quận/huyện..."
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:border-cyan-500/50 outline-none transition-all resize-none text-sm"
                                ></textarea>
                            </div>
                        </section>

                        <section className="space-y-8 bg-slate-900/20 p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <CreditCard size={22} /> <h2 className="text-xl font-black uppercase tracking-tight italic">Phương thức thanh toán</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {['Tiền mặt (COD)', 'Chuyển khoản ngân hàng', 'Ví điện tử MoMo'].map((pt) => (
                                    <label key={pt} className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${formData.phuongThucTT === pt ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'bg-slate-950/30 border-white/5 text-slate-500'}`}>
                                        <div className="flex items-center gap-4">
                                            <input type="radio" name="pttt" className="hidden" checked={formData.phuongThucTT === pt} onChange={() => setFormData({ ...formData, phuongThucTT: pt })} />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.phuongThucTT === pt ? 'border-cyan-500' : 'border-slate-700'}`}>
                                                {formData.phuongThucTT === pt && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>}
                                            </div>
                                            <span className="font-black text-xs uppercase tracking-widest">{pt}</span>
                                        </div>
                                        {formData.phuongThucTT === pt && <CheckCircle2 size={18} className="text-cyan-400" />}
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* CỘT 2: TỔNG KẾT ĐƠN HÀNG */}
                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 h-fit lg:sticky lg:top-28 shadow-2xl space-y-10">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Đơn hàng của bro</h2>

                        <div className="max-h-80 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.MaSP} className="flex items-center gap-6 group">
                                    <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] p-3 shrink-0 border border-white/5 flex items-center justify-center">
                                        <img src={parseImage(item.HinhAnh)} className="max-h-full object-contain group-hover:scale-110 transition-transform" alt={item.TenSP} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-black text-white uppercase truncate w-48">{item.TenSP}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Số lượng: {item.SoLuong}</p>
                                    </div>
                                    <span className="text-sm font-black text-slate-300 tracking-tighter">
                                        {new Intl.NumberFormat('vi-VN').format(item.GiaBan * item.SoLuong)}₫
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-500">Tạm tính</span>
                                <span className="text-white">{new Intl.NumberFormat('vi-VN').format(subtotal)}₫</span>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-500">Giao hàng AI</span>
                                <span className="text-cyan-400 italic">MIỄN PHÍ</span>
                            </div>
                            <div className="pt-6 flex justify-between items-end border-t border-white/5">
                                <span className="text-sm font-black text-white uppercase tracking-widest">Tổng cộng</span>
                                <span className="text-4xl font-black text-cyan-400 tracking-tighter">
                                    {new Intl.NumberFormat('vi-VN').format(subtotal)}₫
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={isProcessing}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-6 rounded-2xl font-black shadow-[0_15px_40px_-10px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            Xác nhận đặt hàng ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL QUÉT MÃ QR --- */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0b1121] border border-white/10 w-full max-w-md rounded-[3rem] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(34,211,238,0.1)]">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Quét mã thanh toán</h2>
                            <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống đơn hàng #{orderId}</p>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                            <img
                                // SỬA: Dùng subtotal thay vì formData.tongTien
                                src={`https://img.vietqr.io/image/bidv-6505131693-compact.png?amount=${subtotal}&addInfo=THANH TOAN DON HANG ${orderId}`}
                                alt="QR Payment"
                                className="w-64 h-64 object-contain"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-left">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Số tiền cần chuyển</p>
                                <p className="text-3xl font-black text-cyan-400 tracking-tighter">{new Intl.NumberFormat('vi-VN').format(subtotal)}₫</p>
                            </div>

                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                                ⚠️ Vui lòng giữ nguyên nội dung chuyển khoản <br /> để hệ thống AI tự động xác nhận
                            </p>

                            <button
                                onClick={() => {
                                    alert("Hệ thống đang kiểm tra giao dịch, bro có thể xem trạng thái ở Hồ sơ!");
                                    router.push('/profile');
                                }}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-xl font-black transition-all uppercase text-[10px] tracking-widest"
                            >
                                Tôi đã thanh toán thành công
                            </button>

                            <button onClick={() => setShowQRModal(false)} className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-colors">
                                Hủy giao dịch
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </main>
    );
}