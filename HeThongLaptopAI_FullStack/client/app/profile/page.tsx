"use client";
import { useEffect, useState } from 'react';
import {
    User, Mail, Phone, MapPin, Shield, Clock, Save,
    Heart, Package, Settings, LogOut, Camera, ChevronRight, ShoppingBag, Trash2, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function UserProfile() {
    const [user, setUser] = useState<any>(null);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'favorites' | 'orders' | 'settings'>('favorites');
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!savedUser.MaTK) {
            window.location.href = '/login';
            return;
        }

        try {
            setLoading(true);
            // Gọi đồng thời cả 3 API để đảm bảo dữ liệu đồng bộ
            // SỬA LẠI ĐOẠN NÀY TRONG FILE page.tsx
            const [profileRes, favRes, orderRes] = await Promise.all([
                // Dòng 28: Phải dùng dấu huyền ` và gọi savedUser.MaTK
                fetch(`http://localhost:5000/api/auth/profile/${savedUser.MaTK}`),

                // Dòng 29: Tương tự, dùng dấu huyền `
                fetch(`http://localhost:5000/api/laptops/favorites/${savedUser.MaTK}`),

                // Dòng 30: Chỗ đang báo lỗi đỏ -> Sửa MaTK thành savedUser.MaTK
                fetch(`http://localhost:5000/api/laptops/orders/${savedUser.MaTK}`)
            ]);

            const profileData = await profileRes.json();
            const favData = await favRes.json();
            const orderData = await orderRes.json();

            setUser(profileData);
            setFavorites(Array.isArray(favData) ? favData : []);
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (err) {
            console.error("Lỗi tải dữ liệu hồ sơ:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };
    // --- DÁN ĐOẠN NÀY VÀO DƯỚI handleLogout (Khoảng dòng 54 trong ảnh) ---
    const handleUnfavorite = async (maSP: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/laptops/toggle-favorite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.MaTK, maSP })
            });

            if (res.ok) {
                // Xóa máy đó khỏi danh sách đang hiển thị để giao diện cập nhật ngay
                setFavorites(prev => prev.filter(item => item.MaSP !== maSP));
            }
        } catch (err) {
            console.error("Lỗi xóa yêu thích:", err);
        }
    };
    // --- CHẶN LỖI NULL: Nếu chưa có user thì hiện loading, không render tiếp ---
    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-cyan-400 font-black tracking-widest uppercase text-xs">Đang đồng bộ thực thể AI...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0b1121] text-slate-300 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <Link href="/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 mb-10 transition-all">
                    <ChevronRight size={14} className="rotate-180" /> Quay lại cửa hàng
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* CỘT 1: SIDEBAR (Thông tin User) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

                            <div className="w-28 h-28 bg-cyan-500/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-cyan-500/30 relative">
                                <User size={48} className="text-cyan-400" />
                                <button className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full text-slate-950 border-4 border-[#0b1121] hover:scale-110 transition-transform">
                                    <Camera size={14} />
                                </button>
                            </div>

                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{user?.HoTen}</h2>
                            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">
                                {user?.VaiTro || 'Thành viên'}
                            </p>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
                                <SidebarInfo icon={<Mail size={14} />} text={user?.Email} />
                                <SidebarInfo icon={<Phone size={14} />} text={user?.SoDienThoai || "Chưa cập nhật"} />
                                <SidebarInfo icon={<MapPin size={14} />} text={user?.DiaChi || "TP. Hồ Chí Minh, VN"} />
                            </div>

                            <button onClick={handleLogout} className="w-full mt-10 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                <LogOut size={14} /> Đăng xuất tài khoản
                            </button>
                        </div>
                    </aside>

                    {/* CỘT 2: CONTENT AREA (Tabs & Data) */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* Thanh Tab Switcher */}
                        <div className="flex flex-wrap gap-4 p-2 bg-slate-950/40 border border-white/5 rounded-3xl w-fit">
                            <TabButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} icon={<Heart size={16} />} label="Yêu thích" count={favorites.length} />
                            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={16} />} label="Đơn hàng" count={orders.length} />
                            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Cài đặt" />
                        </div>

                        {/* Nội dung thay đổi theo Tab */}
                        <div className="min-h-[500px]">
                            {activeTab === 'favorites' && (
                                <section className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Sản phẩm yêu thích</h3>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {favorites.map(sp => <FavoriteCard key={sp.MaSP} sp={sp} onUnfavorite={handleUnfavorite} />)}

                                        </div>
                                    ) : (
                                        <EmptyState icon={<Heart size={48} />} text="Chưa có sản phẩm yêu thích nào" />
                                    )}
                                </section>
                            )}

                            {activeTab === 'orders' && (
                                <section className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Lịch sử đơn hàng</h3>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.map(order => <OrderRow key={order.MaDH} order={order} />)}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<ShoppingBag size={48} />} text="Bạn chưa thực hiện đơn hàng nào" />
                                    )}
                                </section>
                            )}

                            {activeTab === 'settings' && (
                                <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold text-white mb-10 flex items-center uppercase italic">
                                        <Shield className="mr-3 text-cyan-400" size={24} /> Thiết lập tài khoản
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ProfileInput icon={<User size={18} />} label="Họ và Tên" value={user?.HoTen} />
                                        <ProfileInput icon={<Mail size={18} />} label="Email hệ thống" value={user?.Email} disabled />
                                        <ProfileInput icon={<Phone size={18} />} label="Số điện thoại" value={user?.SoDienThoai} />
                                        <ProfileInput icon={<MapPin size={18} />} label="Địa chỉ mặc định" value={user?.DiaChi} isFullWidth />
                                    </div>
                                    <button className="mt-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2 transition-all">
                                        <Save size={18} /> Cập nhật hồ sơ AI
                                    </button>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- CÁC SUB-COMPONENTS HỖ TRỢ ---

function SidebarInfo({ icon, text }: any) {
    return (
        <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="text-cyan-500">{icon}</span>
            <span className="truncate">{text}</span>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, count }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'
                }`}
        >
            {icon} {label}
            {count !== undefined && <span className={`px-2 py-0.5 rounded-lg text-[9px] ${active ? 'bg-black/20' : 'bg-white/10'}`}>{count}</span>}
        </button>
    );
}

function FavoriteCard({ sp, onUnfavorite }: any) {
    // Hàm xử lý ảnh chuẩn cho DB của bro
    const parseImage = (imgData: any) => {
        if (!imgData) return "/laptop-demo.png";
        try {
            // Nếu là chuỗi JSON ["anh.jpg"] thì lấy phần tử đầu
            let parsed = typeof imgData === 'string' && imgData.startsWith('[')
                ? JSON.parse(imgData)[0]
                : imgData;

            // Xóa bỏ các ký tự dư thừa nếu có
            let cleanImg = parsed.replace(/[\[\]"]/g, '');

            // Nếu là link online thì giữ nguyên, nếu là file local thì thêm port 5000
            return cleanImg.startsWith('http') ? cleanImg : `http://localhost:5000/${cleanImg.replace(/^\//, '')}`;
        } catch {
            return "/laptop-demo.png";
        }
    };

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 flex flex-col group hover:border-cyan-500/30 transition-all">
            <div className="aspect-video bg-white/5 rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-4">
                <img
                    src={parseImage(sp.HinhAnh)}
                    className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    alt={sp.TenSP}
                    // Nếu lỗi ảnh thì dùng ảnh mặc định
                    onError={(e: any) => e.target.src = "/laptop-demo.png"}
                />
            </div>
            <h4 className="text-white font-black text-lg truncate uppercase">{sp.TenSP}</h4>
            <div className="flex justify-between items-center mt-2 mb-6">
                <span className="text-cyan-400 font-black text-xl tracking-tighter">
                    {new Intl.NumberFormat('vi-VN').format(sp.GiaBan)}₫
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-lg font-bold tracking-widest uppercase">AI: 98</span>
            </div>
            <div className="flex gap-2">
                {/* FIX: Đã thêm onClick gọi hàm xóa */}
                <button
                    onClick={() => onUnfavorite(sp.MaSP)}
                    className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors"
                >
                    Xóa
                </button>
                <Link href={`/product/${sp.MaSP}`} className="flex-[2]">
                    <button className="w-full bg-cyan-500 text-slate-950 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-400 transition-all">Chi tiết</button>
                </Link>
            </div>
        </div>
    );
}

function OrderRow({ order }: any) {
    return (
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400"><Package size={20} /></div>
                <div>
                    <h4 className="text-white font-black text-sm uppercase">Đơn hàng #{order.MaDH}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(order.NgayDat).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-cyan-400 font-black text-lg tracking-tighter">{new Intl.NumberFormat('vi-VN').format(order.TongTien)}₫</p>
                <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">{order.TrangThai}</span>
            </div>
        </div>
    );
}

function EmptyState({ icon, text }: any) {
    return (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-slate-900/20">
            <div className="text-slate-800 mb-4">{icon}</div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic">{text}</p>
        </div>
    );
}

function ProfileInput({ icon, label, value, disabled = false, isFullWidth = false }: any) {
    return (
        <div className={`space-y-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
                <input
                    type="text" defaultValue={value} disabled={disabled}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    );
}