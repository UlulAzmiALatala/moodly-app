import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthAdminLayout() {
    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-6">
            <Outlet />
        </div>
    );
}
