import React from "react";
import { Search, MessageSquare } from "lucide-react";

const Sidebar = ({
    conversations,
    selectedUser,
    onSelectUser,
    searchTerm,
    setSearchTerm,
    loading,
}) => {
    // Helper Format Waktu
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return date.toLocaleDateString([], { day: "numeric", month: "short" });
    };

    const filteredConversations = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-1/3 min-w-[300px] border-r border-gray-200 flex flex-col bg-white h-full">
            {/* Header Sidebar */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-[#00D1FF]" />
                    </div>
                    Inbox Bantuan
                </h2>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Cari customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm group-hover:border-gray-300"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-gray-600 transition-colors" />
                </div>
            </div>

            {/* List User */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm animate-pulse">
                        Memuat percakapan...
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-gray-300" />
                        </div>
                        {searchTerm
                            ? "Customer tidak ditemukan."
                            : "Belum ada pesan masuk."}
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectUser(conv)}
                            className={`p-4 flex items-center gap-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${
                                selectedUser?.id === conv.id
                                    ? "bg-cyan-50/30 border-l-4 border-l-[#00D1FF]"
                                    : "border-l-4 border-l-transparent"
                            }`}
                        >
                            <div className="relative shrink-0">
                                <img
                                    src={
                                        conv.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            conv.name
                                        )}&background=random`
                                    }
                                    alt={conv.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                {/* Indikator unread bisa ditambahkan logika di sini */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3
                                        className={`text-sm truncate ${
                                            selectedUser?.id === conv.id
                                                ? "font-bold text-gray-900"
                                                : "font-semibold text-gray-700"
                                        }`}
                                    >
                                        {conv.name}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 font-medium">
                                        {formatTime(conv.last_time)}
                                    </span>
                                </div>
                                <p
                                    className={`text-xs truncate ${
                                        selectedUser?.id === conv.id
                                            ? "text-cyan-700 font-medium"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {conv.last_message || (
                                        <span className="italic">
                                            Lampiran Gambar/File
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
