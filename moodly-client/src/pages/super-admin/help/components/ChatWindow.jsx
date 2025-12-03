import React, { useEffect, useRef } from "react";
import { Send, Clock, MoreVertical, Phone, Video } from "lucide-react";

const ChatWindow = ({
    selectedUser,
    messages,
    loadingChat,
    inputText,
    setInputText,
    onSend,
    currentAdminId,
}) => {
    const messagesEndRef = useRef(null);

    // Auto Scroll ke bawah saat pesan baru masuk
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loadingChat, selectedUser]);

    // Helper Format Waktu
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!selectedUser) return null;

    return (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full relative">
            {/* Header Chat */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={
                                selectedUser.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    selectedUser.name
                                )}&background=random`
                            }
                            className="w-10 h-10 rounded-full border border-gray-100 shadow-sm"
                            alt="Avatar"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                            {selectedUser.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                Customer
                            </span>
                            <span className="text-xs text-gray-400">
                                • {selectedUser.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    {/* Tombol Dummy untuk Action */}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <Phone size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <Video size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {loadingChat ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00D1FF] rounded-full animate-spin"></div>
                        <p className="text-sm">Memuat riwayat percakapan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm">
                            Belum ada riwayat pesan dengan customer ini.
                        </p>
                        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                            Mulai percakapan sekarang
                        </span>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isAdmin = msg.sender_id === currentAdminId;
                        // Cek apakah pesan sebelumnya dari pengirim yang sama (untuk grouping UI)
                        const isSameSender =
                            idx > 0 &&
                            messages[idx - 1].sender_id === msg.sender_id;

                        return (
                            <div
                                key={idx}
                                className={`flex flex-col ${
                                    isAdmin ? "items-end" : "items-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[70%] px-5 py-3 text-sm relative shadow-sm transition-all ${
                                        isAdmin
                                            ? "bg-gradient-to-br from-[#00D1FF] to-[#00ACD1] text-white rounded-2xl rounded-tr-sm"
                                            : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-sm"
                                    } ${msg.isOptimistic ? "opacity-70" : ""}`}
                                >
                                    <p className="leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </p>
                                </div>
                                <span
                                    className={`text-[10px] mt-1 px-1 ${
                                        isAdmin
                                            ? "text-gray-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {formatTime(msg.created_at)}
                                    {msg.isOptimistic && " • Mengirim..."}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Chat */}
            <div className="p-5 bg-white border-t border-gray-200 z-20">
                <form
                    onSubmit={onSend}
                    className="flex items-center gap-3 relative"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ketik balasan Anda untuk customer..."
                        className="flex-1 pl-6 pr-14 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 focus:border-[#00D1FF] focus:bg-white transition-all text-sm shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-[#00D1FF] hover:bg-[#00bde6] text-white rounded-full shadow-md shadow-cyan-200/50 transition-all disabled:bg-gray-300 disabled:shadow-none active:scale-95 flex items-center justify-center"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
