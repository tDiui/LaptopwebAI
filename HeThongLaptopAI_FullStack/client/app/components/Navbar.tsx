export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-black text-cyan-400 tracking-tighter">
          LAPTOP <span className="text-white">AI</span>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
          <a href="#" className="hover:text-cyan-400 transition-colors">Sản phẩm</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">So sánh</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Benchmark</a>
        </div>

        {/* Nút Đăng nhập */}
        <button className="bg-cyan-500 hover:bg-cyan-400 text-[#0b1121] px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Đăng nhập
        </button>
      </div>
    </nav>
  );
}