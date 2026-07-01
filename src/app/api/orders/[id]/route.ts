import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: { user: { select: { name: true } }, pos: true, callOffs: true },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const order = await prisma.order.update({
    where: { id: Number(params.id) },
    data: body,
  })

  if (body.status) {
    await prisma.activityLog.create({
      data: {
        activityType: "order_status",
        referenceId: order.id,
        referenceType: "Order",
        description: `Order ${order.cpoRef} status changed to ${body.status}`,
        userId: Number((session.user as any).id),
      },
    })
  }

  return NextResponse.json(order)
}
