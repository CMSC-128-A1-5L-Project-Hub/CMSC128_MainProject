import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";
import Sidebar from "../components/Sidebar";
import UbleLoader from "@/pages/shared/LoadingPage";

export default function ManagerLayout() {
    const location = useLocation();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: async () => (await api.get("/me")).data,
    });

    if (isLoading) return <UbleLoader />;

    return (
        <div className="relative flex h-screen overflow-hidden bg-[#F6F2F4] font-sans">
        <Sidebar
            role={profile?.role}
            profile={{
                fullName: `${profile?.fname ?? ""} ${profile?.lname ?? ""}`.trim(),
                shortName: profile?.fname ?? "",
                email: profile?.email ?? "",
            }}
        />
        <AnimatePresence mode="wait">
            <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col flex-1 overflow-hidden w-full min-w-0"
            >
            {isLoading ? <UbleLoader /> : <Outlet />}
            </motion.div>
        </AnimatePresence>
        </div>
    );
}