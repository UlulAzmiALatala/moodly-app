import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// --- Import Provider ---
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        {/* BrowserRouter di level teratas */}
        <BrowserRouter>
            {/* AuthProvider untuk Login/User Data */}
            <AuthProvider>
                {/* ToastProvider untuk Notifikasi Pop-up */}
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
