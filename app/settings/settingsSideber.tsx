"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "プロフィール", href: "/settings/profile" },
  { label: "位置情報", href: "/settings/location" },
  { label: "アカウント", href: "/settings" },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[280px] bg-gray-50 border-r border-gray-200 p-6 space-y-6">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                active
                  ? "text-orange-600 font-medium bg-orange-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.label}</span>
              {!active && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
