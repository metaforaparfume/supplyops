"use client"

import { SessionProvider } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import { Toaster } from "sonner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </SessionProvider>
  )
}
