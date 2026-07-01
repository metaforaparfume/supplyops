import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const items = await prisma.stockItem.findMany({
    include: { movements: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { stockItemId, type, qtyChange, notes } = body
  const userId = Number((session.user as any).id)

  const item = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  const qtyBefore = item.qtySystem
  const qtyAfter = qtyBefore + qtyChange

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        stockItemId,
        type,
        qtyChange,
        qtyBefore,
        qtyAfter,
        notes,
        userId,
      },
    }),
    prisma.stockItem.update({
      where: { id: stockItemId },
      data: { qtySystem: qtyAfter },
    }),
  ])

  await prisma.activityLog.create({
    data: {
      activityType: type === "scrap" ? "inventory_scrap" : "inventory_adjust",
      referenceId: stockItemId,
      referenceType: "StockItem",
      description: `${item.name} ${type === "scrap" ? "scrapped" : "adjusted"} (${qtyChange >= 0 ? "+" : ""}${qtyChange} ${item.unit})`,
      userId,
    },
  })

  return NextResponse.json(movement)
}
