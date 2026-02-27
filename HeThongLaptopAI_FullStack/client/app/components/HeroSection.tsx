export default function HeroSection() {
    return (
        <section className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold">Powered by AI</span>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    Trợ lý <span className="text-cyan-400">AI</span> <br /> Tìm Laptop hoàn hảo
                </h1>
                <p className="text-slate-400 max-w-md">Khám phá hiệu năng thực tế qua hệ thống Benchmark thông minh.</p>
                <div className="flex gap-4 justify-center md:justify-start">
                    <button className="px-8 py-3 bg-cyan-500 rounded-lg font-bold">Khám phá ngay</button>
                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-lg font-bold">Xem demo</button>
                </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
                <img src="/laptop-hero.png" className="rounded-3xl shadow-2xl border border-white/10" alt="Hero" />
            </div>
        </section>
    );
}