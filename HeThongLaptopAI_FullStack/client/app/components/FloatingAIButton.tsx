"use client";
import { useState, useEffect, useRef } from 'react';

export default function FloatingAIButton() {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState([{ r: 'ai', t: 'Chào bro! Tìm laptop gì nhắn mình nhé.' }]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const send = async () => {
        if (!msg.trim() || loading) return;

        const userMsg = msg;
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null
        // Cập nhật tin nhắn của User vào giao diện
        setChat(prev => [...prev, { r: 'u', t: userMsg }]);
        setMsg("");
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/chat/ask', { // THÊM /ask VÀO ĐÂY
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    maTK: user?.MaTK || null // Đừng quên gửi MaTK để lưu vào bảng NhatKyChat
                })
            });
            const data = await res.json();
            setChat(prev => [...prev, { r: 'ai', t: data.reply }]);
        } catch (err) {
            setChat(prev => [...prev, { r: 'ai', t: 'Vệ tinh mất kết nối, thử lại sau nhé bro!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[999]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            {open && (
                <div className="mb-4 w-80 h-[450px] bg-[#0f172a]/95 border border-cyan-500/20 rounded-3xl p-5 flex flex-col shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="border-b border-white/5 pb-3 mb-3">
                        <p className="text-cyan-400 font-black italic tracking-tighter text-lg">ChatBox Lama</p>
                    </div>

                    <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                        {chat.map((c, i) => (
                            <div key={i} className={`flex ${c.r === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${c.r === 'ai'
                                        ? 'bg-white/5 text-slate-200 border border-white/5 whitespace-pre-wrap' // <--- THÊM whitespace-pre-wrap
                                        : 'bg-cyan-500 text-[#0f172a] font-bold whitespace-pre-wrap' // <--- THÊM whitespace-pre-wrap
                                    }`}>
                                    {c.t}
                                </div>
                            </div>
                        ))}
                        {loading && <p className="text-cyan-400/50 text-[10px] italic animate-pulse">AI đang phân tích dữ liệu...</p>}
                        <div ref={scrollRef} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <input
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && send()}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 text-xs outline-none focus:border-cyan-500/50 transition-all text-white"
                            placeholder="Hỏi về cấu hình, giá cả..."
                        />
                        <button
                            onClick={send}
                            disabled={loading}
                            className="bg-cyan-500 p-3 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        >
                            🚀
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-500 hover:rotate-12 ${open ? 'bg-slate-800 rotate-90' : 'bg-cyan-500'
                    }`}
            >
                {open ? '❌' : '🤖'}
            </button>
        </div>
    );
}