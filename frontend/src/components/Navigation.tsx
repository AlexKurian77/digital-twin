"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Microscope, Lightbulb, Heart, Globe } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Policy Simulator", icon: <Microscope className="w-5 h-5" /> },
    { href: "/solutions", label: "Solutions", icon: <Lightbulb className="w-5 h-5" /> },
    { href: "/health-impact", label: "Health Impact", icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <Globe className="w-8 h-8 text-blue-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                Urban CO₂ Digital Twin
              </h1>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                Environmental Health Dashboard
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-full border border-slate-800/50 backdrop-blur-sm">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${isActive
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                >
                  <span className={isActive ? "text-blue-400" : ""}>{link.icon}</span>
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
