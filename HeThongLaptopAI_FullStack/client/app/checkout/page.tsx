"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, CreditCard, Truck, MapPin,
    User, Phone, ChevronLeft, Loader2, CheckCircle2
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

    // State cho Form thông tin
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
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Điền sẵn tên từ tài khoản
            setFormData(prev => ({ ...prev, hoTen: userData.HoTen || '', soDienThoai: userData.SoDienThoai || '' }));
            fetchCart(userData.MaTK);
        } else {
            router.push('/login');
        }
    }, []);

    const fetchCart = async (maTK: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cart/${maTK}`);
            const data = await res.json();
            if (data.length === 0) router.push('/cart'); // Giỏ trống thì về lại giỏ hàng
            setCartItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.GiaBan * item.SoLuong), 0);

    // --- LOGIC XỬ LÝ ĐẶT HÀNG ---
    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.diaChi || !formData.soDienThoai) {
            return alert("Vui lòng nhập đầy đủ địa chỉ và số điện thoại bro ơi!");
        }

        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maTK: user.MaTK,
                    tongTien: subtotal,
                    phuongThucTT: formData.phuongThucTT,
                    items: cartItems // Gửi kèm danh sách để Backend lưu ChiTietDonHang
                })
            });

            const result = await res.json();
            if (result.success) {
                alert(`🎉 Đặt hàng thành công! Mã đơn của bro là #${result.maDH}`);
                router.push('/'); // Về trang chủ
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#080d17] flex items-center justify-center text-cyan-400 font-bold italic">AI ĐANG QUÉT DỮ LIỆU THANH TOÁN...</div>;

    return (
        <main className="min-h-screen bg-[#080d17] text-slate-300 flex flex-col" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <Navbar />

            <div className="container mx-auto max-w-6xl px-6 py-12 flex-grow">
                <Link href="/cart" className="flex items-center text-slate-500 hover:text-cyan-400 mb-8 transition-all w-fit group">
                    <ChevronLeft size={18} /> <span className="text-xs font-bold uppercase tracking-widest ml-1">Quay lại giỏ hàng</span>
                </Link>

                <h1 className="text-4xl font-black text-white mb-10 tracking-tighter italic">Xác nhận thanh toán</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* CỘT 1: THÔNG TIN GIAO HÀNG */}
                    <form onSubmit={handleConfirmOrder} className="space-y-8">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <MapPin size={20} /> <h2 className="text-xl font-bold uppercase tracking-tight">Địa chỉ nhận hàng</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Họ tên người nhận</label>
                                    <input
                                        type="text" required
                                        value={formData.hoTen}
                                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Số điện thoại</label>
                                    <input
                                        type="tel" required
                                        value={formData.soDienThoai}
                                        onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Địa chỉ chi tiết</label>
                                <textarea
                                    rows={3} required
                                    value={formData.diaChi}
                                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                                    placeholder="Số nhà, tên đường, phường/xã..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <CreditCard size={20} /> <h2 className="text-xl font-bold uppercase tracking-tight">Phương thức thanh toán</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {['Tiền mặt (COD)', 'Chuyển khoản ngân hàng', 'Ví điện tử MoMo'].map((pt) => (
                                    <label key={pt} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.phuongThucTT === pt ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/30 border-white/5 text-slate-500'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="pttt" className="hidden" checked={formData.phuongThucTT === pt} onChange={() => setFormData({ ...formData, phuongThucTT: pt })} />
                                            <span className="font-bold text-sm">{pt}</span>
                                        </div>
                                        {formData.phuongThucTT === pt && <CheckCircle2 size={18} className="text-cyan-400" />}
                                    </label>
                                ))}
                            </div>
                        </section>
                    </form>

                    {/* CỘT 2: TỔNG KẾT ĐƠN HÀNG */}
                    <div className="bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 h-fit lg:sticky lg:top-28 shadow-2xl space-y-8">
                        <h2 className="text-2xl font-bold text-white uppercase italic">Đơn hàng của bro</h2>

                        <div className="max-h-60 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.MaSP} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-950 rounded-lg p-1 shrink-0">
                                        <img src={item.HinhAnh || '/laptop-demo.png'} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-bold text-white uppercase truncate w-40">{item.TenSP}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">SL: {item.SoLuong}</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">
                                        {new Intl.NumberFormat('vi-VN').format(item.GiaBan * item.SoLuong)}đ
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-500 uppercase">Tạm tính</span>
                                <span className="text-white">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-500 uppercase">Giao hàng</span>
                                <span className="text-green-500 italic">MIỄN PHÍ</span>
                            </div>
                            <div className="pt-4 flex justify-between items-end">
                                <span className="text-lg font-bold text-white uppercase tracking-tighter">Tổng thanh toán</span>
                                <span className="text-3xl font-black text-cyan-400 tracking-tighter">
                                    {new Intl.NumberFormat('vi-VN').format(subtotal)}đ
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={isProcessing}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                            XÁC NHẬN ĐẶT HÀNG
                        </button>
                    </div>
                </div>
            </div>

        </main>
    );
}