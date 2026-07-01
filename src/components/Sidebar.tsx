"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📋" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/inventory/cycle-count", label: "Cycle Count", icon: "🔄" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full w-60 flex-col bg-slate-900 text-white">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold">SupplyOps</h1>
        <p className="text-xs text-slate-400 mt-1">{session?.user?.name}</p>
        <p className="text-xs text-slate-500">{session?.user && (session.user as any).role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      </div>
    </div>
  )
}
