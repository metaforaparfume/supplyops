import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orderId = Number(params.id)
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const poCount = await prisma.purchaseOrder.count()
  const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(3, "0")}`

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      orderId,
      status: "Draft",
    },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PO Released" },
  })

  await prisma.activityLog.create({
    data: {
      activityType: "po_created",
      referenceId: po.id,
      referenceType: "PurchaseOrder",
      description: `${poNumber} generated for ${order.cpoRef}`,
      userId: Number((session.user as any).id),
    },
  })

  return NextResponse.json(po)
}
