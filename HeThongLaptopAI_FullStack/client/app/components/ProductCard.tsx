"use client";
import { Star, Cpu, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ laptop }: { laptop: any }) {
  return (
    <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 hover:border-cyan-500/50 transition-all group flex flex-col h-full">
      {/* Thumbnail & AI Badge */}
      <div className="relative mb-5 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950/50">
        <img 
          src={laptop.HinhAnh ? (laptop.HinhAnh.startsWith('http') ? laptop.HinhAnh : `/${laptop.HinhAnh}`) : "/laptop-demo.png"} 
          alt={laptop.TenSP} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-cyan-500/20 backdrop-blur-md text-cyan-400 text-[9px] font-black px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-lg tracking-widest">
          AI Score: {laptop.aiScore || 95}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-grow space-y-3">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{laptop.HangSX || "Apple"}</p>
        <h3 className="text-white text-lg font-black truncate tracking-tight uppercase leading-tight">{laptop.TenSP}</h3>
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "fill-cyan-500 text-cyan-500" : "text-slate-700"} />
          ))}
          <span className="text-slate-600 text-[10px] font-bold ml-1">(0)</span>
        </div>

        {/* Specs Box */}
        <div className="py-4 space-y-2.5 border-t border-white/5 mt-4">
          <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-bold">
            <Cpu size={14} className="text-cyan-500/70" /> 
            <span className="truncate">CPU: {laptop.CPU || "Apple M3 Max"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-bold">
            <Zap size={14} className="text-cyan-500/70" /> 
            <span className="truncate">GPU: {laptop.VGA || "M3 Max GPU"}</span>
          </div>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-5 mt-auto">
        <span className="text-cyan-400 text-lg font-black tracking-tighter">
          {new Intl.NumberFormat('vi-VN').format(laptop.GiaBan || 89990000)}đ
        </span>
        <Link href={`/product/${laptop.MaSP || laptop.id}`}>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-1 group/btn">
            XEM CHI TIẾT <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}