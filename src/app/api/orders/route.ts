import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true } }, pos: true, callOffs: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const order = await prisma.order.create({
    data: {
      cpoRef: body.cpoRef,
      wbsRef: body.wbsRef,
      boqDetails: body.boqDetails,
      status: "Draft",
      userId: Number((session.user as any).id),
    },
  })

  await prisma.activityLog.create({
    data: {
      activityType: "order_created",
      referenceId: order.id,
      referenceType: "Order",
      description: `Order ${order.cpoRef} created`,
      userId: Number((session.user as any).id),
    },
  })

  return NextResponse.json(order)
}
