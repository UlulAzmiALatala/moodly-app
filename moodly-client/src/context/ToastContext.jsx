import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Fungsi untuk memunculkan toast
    const addToast = useCallback(
        (message, type = "success", duration = 3000) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type }]);

            // Auto remove
            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        []
    );

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Ikon berdasarkan tipe
    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />; // Ganti AlertCircle jadi XCircle biar beda
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    // Warna border kiri berdasarkan tipe
    const getBorderColor = (type) => {
        switch (type) {
            case "success":
                return "border-l-4 border-green-500";
            case "error":
                return "border-l-4 border-red-500";
            case "warning":
                return "border-l-4 border-yellow-500";
            default:
                return "border-l-4 border-blue-500";
        }
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Render Toast Container di Portal (Body) agar selalu di atas */}
            {createPortal(
                <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                                transition={{ duration: 0.3, type: "spring" }}
                                className={`pointer-events-auto flex items-center gap-3 p-4 bg-white rounded-lg shadow-lg border border-gray-100 ${getBorderColor(
                                    toast.type
                                )}`}
                            >
                                <div className="shrink-0">
                                    {getIcon(toast.type)}
                                </div>
                                <p className="text-sm font-medium text-gray-700 flex-1 leading-snug">
                                    {toast.message}
                                </p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
