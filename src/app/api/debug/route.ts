import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function GET() {
  const info: Record<string, unknown> = {
    node: process.version,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set (prefix: " + process.env.NEXTAUTH_URL.substring(0, 20) + "...)" : "missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "missing",
      DATABASE_URL: process.env.DATABASE_URL ? "set (prefix: " + process.env.DATABASE_URL.substring(0, 50) + "...)" : "missing",
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, password: true },
    })
    info.users = users.map((u) => ({ id: u.id, email: u.email, role: u.role }))
    info.userCount = users.length

    if (users.length > 0) {
      const match = await bcrypt.compare("password123", users[0].password)
      info.passwordMatch = match
    }
  } catch (e) {
    info.error = e instanceof Error ? e.message : String(e)
    info.errorStack = e instanceof Error ? e.stack : undefined
  }

  return NextResponse.json(info)
}