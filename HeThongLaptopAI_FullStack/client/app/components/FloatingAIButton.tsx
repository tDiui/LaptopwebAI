"use client";
import { useState } from 'react';

export default function FloatingAIButton() {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState([{ r: 'ai', t: 'Chào bro! Tìm laptop gì nhắn mình nhé.' }]);

    const send = async () => {
        if (!msg) return;
        setChat([...chat, { r: 'u', t: msg }]);
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        setChat(prev => [...prev, { r: 'ai', t: data.reply }]);
        setMsg("");
    };

    return (
        <div className="fixed bottom-8 right-8 z-[999]">
            {open && (
                <div className="mb-4 w-72 h-96 bg-[#1e293b]/95 border border-white/10 rounded-2xl p-4 flex flex-col shadow-2xl backdrop-blur-xl">
                    <div className="flex-1 overflow-auto text-xs space-y-3">
                        {chat.map((c, i) => (
                            <div key={i} className={c.r === 'ai' ? 'text-cyan-400' : 'text-right'}>
                                <p className="inline-block bg-white/5 p-2 rounded-lg">{c.t}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <input value={msg} onChange={e => setMsg(e.target.value)} className="bg-white/5 border border-white/10 rounded-md p-2 flex-1 text-xs outline-none" placeholder="VD: i7, Dell..." />
                        <button onClick={send} className="bg-cyan-500 p-2 rounded-md">🚀</button>
                    </div>
                </div>
            )}
            <button onClick={() => setOpen(!open)} className="w-14 h-14 bg-cyan-500 rounded-full shadow-lg text-2xl hover:scale-110 transition-transform">🤖</button>
        </div>
    );
}