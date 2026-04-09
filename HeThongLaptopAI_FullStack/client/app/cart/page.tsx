"use client";
import { useEffect, useState } from 'react';
import {
    Trash2, Plus, Minus, ArrowRight,
    ShoppingCart, Sparkles, Loader2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Để chuyển hướng sau khi mua
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CartPage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // --- 1. LẤY THÔNG TIN USER & GIỎ HÀNG ---
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchCart(userData.MaTK);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCart = async (maTK: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cart/${maTK}`);
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (err) {
            console.error("Lỗi tải giỏ hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. CẬP NHẬT SỐ LƯỢNG (DB) ---
    const updateQuantity = async (maSP: number, newQty: number) => {
        if (newQty < 1 || !user) return;
        try {
            await fetch(`http://localhost:5000/api/cart/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.MaTK, maSP, soLuong: newQty })
            });
            setCartItems(prev => prev.map(item =>
                item.MaSP === maSP ? { ...item, SoLuong: newQty } : item
            ));
        } catch (err) {
            alert("Lỗi cập nhật!");
        }
    };

    // --- 3. XÓA 1 SẢN PHẨM (DB) ---
    const removeItem = async (maSP: number) => {
        if (!user || !confirm("Xóa máy này khỏi giỏ hàng nhé bro?")) return;
        try {
            await fetch(`http://localhost:5000/api/cart/remove`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.MaTK, maSP })
            });
            setCartItems(prev => prev.filter(item => item.MaSP !== maSP));
        } catch (err) {
            alert("Lỗi khi xóa!");
        }
    };
    // --- 5. XỬ LÝ ẢNH JSON ---
    const parseImage = (imgData: string) => {
        try {
            if (!imgData) return "/laptop-demo.png";
            // Parse nếu là chuỗi JSON, nếu không thì giữ nguyên
            let parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
            // Nếu là mảng, lấy cái đầu tiên
            const img = Array.isArray(parsed) ? parsed[0] : parsed;
            // Xóa các ký tự thừa như dấu ngoặc, dấu nháy
            let cleanImg = img.replace(/[\[\]"]/g, '');
            // Kiểm tra xem có cần thêm dấu gạch chéo ở đầu không
            return cleanImg.startsWith('http') || cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
        } catch (e) {
            return "/laptop-demo.png"; // Trả về ảnh mặc định nếu lỗi parse
        }
    };
    // --- 4. LOGIC THANH TOÁN (CHECKOUT - TRANSACTION) ---
    const handleCheckout = async () => {
        if (cartItems.length === 0) return alert("Giỏ hàng trống bro ơi!");
        if (!user) return alert("Vui lòng đăng nhập để thanh toán!");

        if (!confirm("Xác nhận đặt hàng và thanh toán đơn hàng này?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maTK: user.MaTK,
                    tongTien: subtotal,
                    // Chú ý: Backend của bro đang đợi "phuongThucTT" chứ không phải "phuongThuc"
                    phuongThucTT: 'Tiền mặt (COD)',
                    // CHỖ QUAN TRỌNG NHẤT: Gửi danh sách sản phẩm đi
                    items: cartItems
                })
            });

            const result = await res.json();

            if (result.success) {
                alert(`🚀 Đặt hàng thành công! Mã đơn hàng của bro là #${result.maDH}`);
                setCartItems([]);
                router.push('/');
            } else {
                // Nếu Backend báo lỗi, nó sẽ hiện ở đây
                alert("Lỗi từ hệ thống: " + result.error);
            }
        } catch (err) {
            alert("Hệ thống bận, vui lòng thử lại sau!");
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.GiaBan * item.SoLuong), 0);

    if (loading) return (
        <div className="min-h-screen bg-[#080d17] flex items-center justify-center text-cyan-400">
            <Loader2 className="animate-spin mr-2" /> Đang truy xuất dữ liệu từ Neural Network...
        </div>
    );

    return (
        <main
            className="min-h-screen bg-[#080d17] text-slate-300 flex flex-col"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
            <Navbar />

            <div className="container mx-auto max-w-7xl px-6 py-12 flex-grow">
                {!user ? (
                    <div className="text-center py-32">
                        <h2 className="text-3xl font-bold text-white mb-6">Bro cần đăng nhập để xem giỏ hàng!</h2>
                        <Link href="/login" className="bg-cyan-500 text-black px-10 py-4 rounded-2xl font-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            ĐĂNG NHẬP NGAY
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">Giỏ hàng của {user.HoTen}</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                    {cartItems.length} "vũ khí" AI trong danh sách
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.MaSP} className="bg-[#1e293b]/20 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex gap-8 items-center group hover:border-cyan-500/30 transition-all">
                                            <div className="w-32 h-32 bg-slate-950/50 rounded-2xl p-4 shrink-0 flex items-center justify-center">
                                                {/* Sử dụng hàm parseImage để lấy link ảnh chuẩn */}
                                                <img
                                                    src={parseImage(item.HinhAnh)}
                                                    className="max-h-full object-contain rounded-3xl w-64 shadow-2xl"
                                                    alt={item.TenSP}
                                                />
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <h3 className="text-xl font-bold text-white uppercase">{item.TenSP}</h3>
                                                    <button onClick={() => removeItem(item.MaSP)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Thiết bị đã được AI kiểm định</p>

                                                <div className="flex justify-between items-center mt-6">
                                                    <div className="flex items-center bg-slate-950/50 rounded-xl p-1 border border-white/5">
                                                        <button onClick={() => updateQuantity(item.MaSP, item.SoLuong - 1)} className="p-2 hover:text-white"><Minus size={14} /></button>
                                                        <span className="px-4 font-bold text-white">{item.SoLuong}</span>
                                                        <button onClick={() => updateQuantity(item.MaSP, item.SoLuong + 1)} className="p-2 hover:text-white"><Plus size={14} /></button>
                                                    </div>
                                                    <span className="text-2xl font-black text-cyan-400">
                                                        {new Intl.NumberFormat('vi-VN').format(item.GiaBan * item.SoLuong)}đ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 border border-dashed border-white/10 rounded-[3rem] bg-slate-900/10">
                                        <ShoppingCart size={48} className="mx-auto opacity-20 mb-4" />
                                        <p className="text-slate-500 font-bold uppercase italic">Hệ thống đang trống, hãy nạp dữ liệu ngay!</p>
                                        <Link href="/products" className="inline-block mt-6 text-cyan-400 border border-cyan-400/30 px-6 py-2 rounded-xl">Tiếp tục mua sắm</Link>
                                    </div>
                                )}
                            </div>

                            {/* Cột Tổng kết & Nút Thanh Toán */}
                            <div className="bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 h-fit lg:sticky lg:top-28 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white uppercase italic mb-6">Tóm tắt đơn hàng</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-400 font-bold"><span>Tạm tính</span><span>{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span></div>
                                    <div className="flex justify-between text-green-500 font-bold"><span>Vận chuyển</span><span>MIỄN PHÍ</span></div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <span className="font-bold text-white text-lg">TỔNG CỘNG</span>
                                        <span className="text-3xl font-black text-cyan-400 tracking-tighter">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => router.push('/checkout')} // Chỉ chuyển trang, không gọi API ở đây
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    TIẾN HÀNH ĐẶT HÀNG
                                </button>
                                <p className="text-[10px] text-slate-600 text-center mt-4 uppercase font-bold tracking-tighter">Giao dịch được bảo mật bởi AI Encryption</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}