"use client";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube, Send } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#0b1121] border-t border-white/5 pt-16 pb-8 text-slate-400">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Cột 1: Thông tin thương hiệu */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500 rounded-lg text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                <Mail size={20} /> {/* Thay bằng icon Logo của bro */}
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">AI <span className="text-cyan-400">LAPTOP</span></span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Nền tảng tìm kiếm và so sánh laptop được hỗ trợ bởi AI, giúp bạn tìm được chiếc laptop hoàn hảo nhất.
                        </p>
                        <div className="space-y-3 text-sm">
                            <ContactItem icon={<MapPin size={16} />} text="123 Nguyễn Huệ, Q1, TP.HCM" />
                            <ContactItem icon={<Phone size={16} />} text="+84 123 456 789" />
                            <ContactItem icon={<Mail size={16} />} text="contact@ailaptop.com" />
                        </div>
                    </div>

                    {/* Cột 2: Liên kết nhanh */}
                    <FooterColumn title="Liên kết nhanh">
                        <FooterLink href="/">Trang chủ</FooterLink>
                        <FooterLink href="/products">Sản phẩm</FooterLink>
                        <FooterLink href="/compare">So sánh</FooterLink>
                        <FooterLink href="/benchmark">Benchmark</FooterLink>
                        <FooterLink href="/about">Về chúng tôi</FooterLink>
                    </FooterColumn>

                    {/* Cột 3: Danh mục */}
                    <FooterColumn title="Danh mục">
                        <FooterLink href="#">Laptop Gaming</FooterLink>
                        <FooterLink href="#">Laptop Creator</FooterLink>
                        <FooterLink href="#">Laptop Business</FooterLink>
                        <FooterLink href="#">Ultrabook</FooterLink>
                        <FooterLink href="#">Workstation</FooterLink>
                    </FooterColumn>

                    {/* Cột 4: Đăng ký nhận tin & Social */}
                    <div className="space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">Đăng ký nhận tin</h3>
                        <p className="text-xs text-slate-500">Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt.</p>

                        {/* Input Glassmorphism */}
                        <div className="relative flex items-center">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                            <button className="absolute right-1 p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                <Send size={16} />
                            </button>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Theo dõi chúng tôi</h3>
                            <div className="flex gap-4">
                                <SocialIcon icon={<Facebook size={18} />} />
                                <SocialIcon icon={<Twitter size={18} />} />
                                <SocialIcon icon={<Instagram size={18} />} />
                                <SocialIcon icon={<Linkedin size={18} />} />
                                <SocialIcon icon={<Youtube size={18} />} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    <p>© 2024 AI Laptop. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Chính sách bảo mật</Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Điều khoản sử dụng</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper Components
function ContactItem({ icon, text }: any) {
    return (
        <div className="flex items-center gap-3 group cursor-default">
            <div className="text-cyan-400 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="group-hover:text-slate-300 transition-colors">{text}</span>
        </div>
    );
}

function FooterColumn({ title, children }: any) {
    return (
        <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">{title}</h3>
            <div className="flex flex-col space-y-3 text-sm">
                {children}
            </div>
        </div>
    );
}

function FooterLink({ href, children }: any) {
    return (
        <Link href={href} className="hover:text-cyan-400 transition-colors w-fit">
            {children}
        </Link>
    );
}

function SocialIcon({ icon }: any) {
    return (
        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:bg-cyan-500/5">
            {icon}
        </button>
    );
}