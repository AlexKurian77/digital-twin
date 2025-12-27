"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Policy Simulator", icon: "🔬" },
    { href: "/solutions", label: "Solutions", icon: "💡" },
    { href: "/health-impact", label: "Health Impact", icon: "❤️" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Urban CO₂ Digital Twin
              </h1>
              <p className="text-sm text-slate-400">Environmental Health Dashboard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
