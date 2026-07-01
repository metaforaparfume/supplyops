import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const userId = Number((session.user as any).id)

  const results = []
  for (const item of body.items) {
    const stockItem = await prisma.stockItem.findUnique({ where: { id: item.id } })
    if (!stockItem) continue

    const diff = item.qtyPhysical - stockItem.qtySystem
    const movement = await prisma.stockMovement.create({
      data: {
        stockItemId: item.id,
        type: "reconciliation",
        qtyChange: diff,
        qtyBefore: stockItem.qtySystem,
        qtyAfter: item.qtyPhysical,
        notes: item.notes || "Cycle count reconciliation",
        userId,
      },
    })

    await prisma.stockItem.update({
      where: { id: item.id },
      data: { qtySystem: item.qtyPhysical, qtyPhysical: item.qtyPhysical, lastCountDate: new Date() },
    })

    await prisma.activityLog.create({
      data: {
        activityType: "inventory_reconcile",
        referenceId: item.id,
        referenceType: "StockItem",
        description: `${stockItem.name} reconciled (${stockItem.qtySystem} → ${item.qtyPhysical})`,
        userId,
      },
    })

    results.push(movement)
  }

  return NextResponse.json(results)
}
