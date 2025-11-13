import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const { data } = await apiClient.get("/api/user");
            setUser(data);
        } catch (e) {
            // Abaikan error 401
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    // --- FUNGSI LOGIN UMUM (INTERNAL) ---
    const performLogin = async (credentials) => {
        try {
            await apiClient.get("/sanctum/csrf-cookie");
            await apiClient.post("/api/login", credentials);
        } catch (e) {
            if (e.response && e.response.status === 422) {
                throw e.response.data.errors;
            } else {
                throw new Error(
                    e.response?.data?.message ||
                        "Login gagal, silakan coba lagi."
                );
            }
        }
    };

    const logout = async () => {
        try {
            await apiClient.post("/api/logout");
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            setUser(null);
        }
    };

    // --- Login khusus Customer ---
    const loginCustomer = async (credentials) => {
        await performLogin(credentials);
        const { data: loggedInUser } = await apiClient.get("/api/user");
        if (loggedInUser.role !== "customer") {
            await logout();
            throw new Error(
                "Akun ini bukan akun customer. Silakan login di halaman yang sesuai."
            );
        }
        setUser(loggedInUser);
    };

    // --- Login khusus Konselor ---
    const loginCounselor = async (credentials) => {
        await performLogin(credentials);
        const { data: loggedInUser } = await apiClient.get("/api/user");
        if (loggedInUser.role !== "konselor") {
            await logout();
            throw new Error("Akun ini bukan akun konselor.");
        }
        setUser(loggedInUser);
    };

    // --- Login khusus Admin ---
    const loginAdmin = async (credentials) => {
        await performLogin(credentials);
        const { data: loggedInUser } = await apiClient.get("/api/user");
        if (
            loggedInUser.role !== "admin" &&
            loggedInUser.role !== "super-admin"
        ) {
            await logout();
            throw new Error("Akun ini bukan akun admin.");
        }
        setUser(loggedInUser);
    };

    // (Fungsi registerCustomer dan registerCounselor tidak berubah)
    const registerCustomer = async (data) => {
        try {
            await apiClient.get("/sanctum/csrf-cookie");
            await apiClient.post("/api/register", data);
            await getUser();
        } catch (e) {
            if (e.response && e.response.status === 422) {
                throw e.response.data.errors;
            }
            throw e;
        }
    };
    const registerCounselor = async (data) => {
        try {
            await apiClient.get("/sanctum/csrf-cookie");
            await apiClient.post("/api/register-counselor", data);
            await getUser();
        } catch (e) {
            if (e.response && e.response.status === 422) {
                throw e.response.data.errors;
            }
            throw e;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                // --- PERBAIKAN: Tambahkan 'getUser' di sini ---
                getUser,
                // --- AKHIR PERBAIKAN ---
                login: loginCustomer,
                loginCustomer,
                loginCounselor,
                loginAdmin,
                registerCustomer,
                registerCounselor,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
