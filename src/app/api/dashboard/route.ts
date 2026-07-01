import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [orders, orderStatusCounts, stockItems, recentActivity, lowStockItems] = await Promise.all([
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
    prisma.activityLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }),
    prisma.stockItem.findMany({ where: { qtySystem: { lte: prisma.stockItem.fields.minStock } } }),
  ])

  const totalOrders = orderStatusCounts.reduce((acc, curr) => acc + curr._count, 0)
  const totalStockItems = stockItems.reduce((acc, curr) => acc + curr.qtySystem, 0)
  const discrepancyCount = stockItems.filter((i) => i.qtySystem !== i.qtyPhysical).length
  const agingItems = stockItems.filter((i) => i.qtySystem > i.minStock * 3)

  return NextResponse.json({
    orders,
    orderStatusCounts,
    stockItems,
    recentActivity,
    lowStockItems,
    totalOrders,
    totalStockItems,
    discrepancyCount,
    agingItems: agingItems.length,
  })
}
