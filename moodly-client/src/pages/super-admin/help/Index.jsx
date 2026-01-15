import React, { useState, useEffect } from "react";
import apiClient from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Import Komponen Pecahan
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import EmptyState from "./components/EmptyState";

window.Pusher = Pusher;

// --- Inisialisasi Echo (Global) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key",
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient
                    .post("/api/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

export default function SuperAdminHelpChatPage() {
    const { user: adminUser } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingList, setLoadingList] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);

    // 1. Load Inbox
    const loadConversations = async () => {
        try {
            const response = await apiClient.get(
                "/api/admin/help/conversations"
            );
            setConversations(response.data);
        } catch (error) {
            console.error("Gagal load inbox:", error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadConversations();
        // Polling fallback (opsional jika websocket putus)
        const interval = setInterval(loadConversations, 60000);
        return () => clearInterval(interval);
    }, []);

    // 2. Load Chat & Realtime Listener
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            setLoadingChat(true);
            try {
                const response = await apiClient.get(
                    `/api/admin/help/messages/${selectedUser.id}`
                );
                setMessages(response.data);
            } catch (error) {
                console.error("Gagal load pesan:", error);
            } finally {
                setLoadingChat(false);
            }
        };
        fetchMessages();

        // Subscribe ke Channel User yang sedang dibuka
        const channelName = `help.user.${selectedUser.id}`;
        const channel = echo.private(channelName);

        channel.listen(".NewHelpMessage", (e) => {
            // Update Chat Window jika pesan dari customer
            if (e.message.sender_id !== adminUser.id) {
                setMessages((prev) => [...prev, e.message]);
            }
            // Update List Sidebar (agar naik ke atas dan snippet berubah)
            updateConversationSnippet(selectedUser.id, e.message.message);
        });

        return () => {
            echo.leave(channelName);
        };
    }, [selectedUser]);

    // 3. Update Snippet Sidebar
    const updateConversationSnippet = (userId, text) => {
        setConversations((prev) => {
            const updated = prev.map((conv) => {
                if (conv.id === userId) {
                    return {
                        ...conv,
                        last_message: text,
                        last_time: new Date().toISOString(),
                    };
                }
                return conv;
            });
            return updated.sort(
                (a, b) => new Date(b.last_time) - new Date(a.last_time)
            );
        });
    };

    // 4. Kirim Pesan
    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser) return;

        const text = inputText;
        setInputText("");

        // Optimistic Update
        const tempId = Date.now();
        const newMsg = {
            id: tempId,
            user_id: selectedUser.id,
            sender_id: adminUser.id,
            message: text,
            created_at: new Date().toISOString(),
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, newMsg]);
        updateConversationSnippet(selectedUser.id, text);

        try {
            const response = await apiClient.post(
                `/api/admin/help/reply/${selectedUser.id}`,
                { message: text }
            );
            // Replace optimistic msg with real data
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? response.data : m))
            );
        } catch (error) {
            console.error("Gagal kirim:", error);
            alert("Gagal mengirim pesan.");
        }
    };

    return (
        // Container Utama: Layout Modern dengan bayangan dan rounded corners
        <div className="h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-xl border border-gray-200 flex overflow-hidden ring-1 ring-gray-100 m-4">
            <Sidebar
                conversations={conversations}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loading={loadingList}
            />

            {selectedUser ? (
                <ChatWindow
                    selectedUser={selectedUser}
                    messages={messages}
                    loadingChat={loadingChat}
                    inputText={inputText}
                    setInputText={setInputText}
                    onSend={handleSend}
                    currentAdminId={adminUser.id}
                />
            ) : (
                <EmptyState />
            )}
        </div>
    );
}
