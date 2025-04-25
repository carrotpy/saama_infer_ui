"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutTemplate,
    BrainCog,
    BarChart3,
    HomeIcon,
    Cable
} from "lucide-react"; // Icon set

const navItems = [
    {
        label: "Home",
        href: "/",
        icon: HomeIcon,
    },

    {
        label: "Map Variables",
        href: "/mapping",
        icon: LayoutTemplate,
    },
    {
        label: "Scenarios Sheet",
        href: "/scenario",
        icon: Cable,
    },
    {
        label: "Run Model",
        href: "/run_model",
        icon: BrainCog,
    },
    {
        label: "Predictions",
        href: "/results",
        icon: BarChart3,
    },
];

export const SidebarNav = () => {
    const pathname = usePathname();

    return (
        <aside className="w-45 bg-gray-100 p-3 border-r min-h-screen">
            <nav className="space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-700 hover:bg-white"
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};