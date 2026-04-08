export default function HeroSection() {
    return (
        <section className="container mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between">
            {/* CỘT TRÁI: NỘI DUNG */}
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left z-10 relative">
                <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Powered by AI</span>
                <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
                    Trợ lý <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">AI</span> <br /> Tìm Laptop hoàn hảo
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto lg:mx-0 text-lg">
                    Khám phá hiệu năng thực tế qua hệ thống Benchmark thông minh và nhận đề xuất chuẩn xác nhất.
                </p>
                <div className="flex gap-4 justify-center lg:justify-start pt-4">
                    <button className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1">
                        Khám phá ngay
                    </button>
                    <button className="px-8 py-3.5 bg-[#1e2330] hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all hover:-translate-y-1">
                        Xem demo
                    </button>
                </div>
            </div>

            {/* CỘT PHẢI: HÌNH ẢNH */}
            <div className="lg:w-1/2 mt-16 lg:mt-0 relative flex justify-center lg:justify-end">
                {/* Vầng hào quang (Glow) màu Cyan chiếu phía sau ảnh */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-cyan-500/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

                {/* Ảnh mạng siêu nét lấy từ Unsplash. 
                    Nếu bro muốn dùng ảnh của riêng mình, hãy tải ảnh đó về, đổi tên thành 'laptop-hero.png', 
                    bỏ vào thư mục 'public' của Frontend, rồi đổi src dưới đây thành src="/laptop-hero.png" nhé.
                */}
                <img
                    src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80"
                    className="relative z-10 w-full max-w-[600px] rounded-3xl shadow-2xl border border-white/10 object-cover hover:scale-[1.02] transition-transform duration-700"
                    alt="AI Laptop Hero"
                />
            </div>
        </section>
    );
}