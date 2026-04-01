"use client";
import { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    cartItems: any[];
    subtotal: number;
    onSuccess: (maDH: number) => void;
}

export default function CheckoutModal({ isOpen, onClose, user, cartItems, subtotal, onSuccess }: CheckoutModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // --- LỚP BẢO VỆ 1: HONEYPOT VALUE (BẪY BOT) ---
    const [honeypot, setHoneypot] = useState('');

    const [formData, setFormData] = useState({
        hoTen: user?.HoTen || '',
        email: user?.Email || '',
        soDienThoai: user?.SoDienThoai || '',
        diaChi: '',
        thanhPho: '',
        phuongThucTT: 'COD'
    });

    if (!isOpen) return null;

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- LỚP BẢO VỆ 2: CHẶN DOUBLE CLICK ---
        // Nếu đang xử lý rồi thì không cho chạy tiếp
        if (isProcessing) return;

        // --- KIỂM TRA BẪY BOT ---
        // Nếu ô honeypot có dữ liệu -> Chắc chắn là Bot đang điền form tự động
        if (honeypot !== '') {
            console.warn("AI detected a bot activity!");
            return; // Im lặng thoát ra, không cho gửi dữ liệu
        }

        // Kiểm tra sơ bộ địa chỉ (Tránh spam địa chỉ quá ngắn)
        if (formData.diaChi.trim().length < 10) {
            return alert("Địa chỉ giao hàng quá ngắn, vui lòng ghi rõ ràng hơn bro ơi!");
        }

        setIsProcessing(true); // Khóa nút ngay lập tức

        try {
            const res = await fetch(`http://localhost:5000/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maTK: user.MaTK,
                    tongTien: subtotal,
                    phuongThucTT: formData.phuongThucTT === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
                    items: cartItems,
                    diaChi: formData.diaChi // Gửi địa chỉ để Backend chấm điểm rủi ro
                })
            });

            const result = await res.json();

            // Check xem Backend có đánh dấu đơn này là Spam không
            if (result.isSpam) {
                alert(`⚠️ Cảnh báo: ${result.message}`);
                onClose();
                return;
            }

            if (result.success) {
                onSuccess(result.maDH);
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (err) {
            alert("Lỗi kết nối server!");
        } finally {
            // Chỉ mở khóa nút nếu có lỗi xảy ra, nếu thành công trang sẽ tự chuyển
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-[#111827] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

                <div className="p-8 pb-4 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight italic">Thông tin thanh toán</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleConfirmOrder} className="p-8 pt-0 space-y-6 overflow-y-auto flex-grow custom-scrollbar">

                    {/* --- Ô NHẬP TÀNG HÌNH (HONEYPOT) --- */}
                    {/* Người dùng thật không bao giờ thấy ô này, Bot sẽ tự điền vào */}
                    <input
                        type="text"
                        name="ai_verification_field"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                    />

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Họ và tên <span className="text-red-500">*</span></label>
                        <input
                            type="text" required value={formData.hoTen}
                            onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email" required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <input
                                type="tel" required value={formData.soDienThoai}
                                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="0123456789"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                        <input
                            type="text" required value={formData.diaChi}
                            onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="123 Đường ABC, Phường XYZ"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Thành phố <span className="text-red-500">*</span></label>
                        <select
                            required value={formData.thanhPho}
                            onChange={(e) => setFormData({ ...formData, thanhPho: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#111827]">Chọn thành phố</option>
                            <option value="Hà Nội" className="bg-[#111827]">Hà Nội</option>
                            <option value="Hồ Chí Minh" className="bg-[#111827]">Hồ Chí Minh</option>
                            <option value="Đà Nẵng" className="bg-[#111827]">Đà Nẵng</option>
                        </select>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phương thức thanh toán</label>

                        <label className={`block p-5 rounded-2xl border cursor-pointer transition-all ${formData.phuongThucTT === 'COD' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-900/30 border-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <input type="radio" checked={formData.phuongThucTT === 'COD'} onChange={() => setFormData({ ...formData, phuongThucTT: 'COD' })} className="accent-cyan-400 w-4 h-4" />
                                <div>
                                    <p className="text-sm font-bold text-white">Thanh toán khi nhận hàng (COD)</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                </div>
                            </div>
                        </label>

                        <label className={`block p-5 rounded-2xl border cursor-pointer transition-all ${formData.phuongThucTT === 'BANK' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-900/30 border-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <input type="radio" checked={formData.phuongThucTT === 'BANK'} onChange={() => setFormData({ ...formData, phuongThucTT: 'BANK' })} className="accent-cyan-400 w-4 h-4" />
                                <div>
                                    <p className="text-sm font-bold text-white">Chuyển khoản ngân hàng</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Chuyển khoản qua ngân hàng hoặc ví điện tử</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </form>

                <div className="p-8 pt-6 border-t border-white/5 bg-slate-950/20">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-bold text-white italic tracking-tight uppercase">Tổng thanh toán</span>
                        <span className="text-2xl font-black text-cyan-400 tracking-tighter">
                            {new Intl.NumberFormat('vi-VN').format(subtotal)}đ
                        </span>
                    </div>
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black shadow-[0_10px_40px_-10px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                        {isProcessing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}
                    </button>
                </div>
            </div>
        </div>
    );
}