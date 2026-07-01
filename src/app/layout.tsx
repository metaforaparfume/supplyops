import type { Metadata } from "next"
import "./globals.css"
import PWARegister from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "SupplyOps - Supply Chain Operations",
  description: "Supply Chain Operations Management System",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#1e293b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "SupplyOps",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </head>
      <body className="antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
