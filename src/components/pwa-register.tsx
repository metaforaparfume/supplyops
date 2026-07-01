"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("SupplyOps: update ready — reload to activate")
            }
          })
        })
      } catch {
        console.warn("SupplyOps: SW registration failed")
      }
    }

    register()

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload()
    })
  }, [])

  return null
}
