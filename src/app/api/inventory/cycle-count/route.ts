import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await prisma.cycleCountSession.findMany({
    include: {
      stockItem: true,
      initiator: { select: { id: true, name: true } },
      rounds: { include: { countedBy: { select: { name: true } } }, orderBy: { roundNumber: "asc" } },
      claimLetter: { include: { approvedBy: { select: { name: true } }, creditNote: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { stockItemId, notes } = body
  const userId = Number((session.user as any).id)

  const stockItem = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
  if (!stockItem) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  const activeSession = await prisma.cycleCountSession.findFirst({
    where: { stockItemId, status: "In Progress" },
  })
  if (activeSession) {
    return NextResponse.json({ error: "Item already has an active cycle count session" }, { status: 409 })
  }

  const cycleSession = await prisma.cycleCountSession.create({
    data: {
      stockItemId,
      warehouse: stockItem.warehouse,
      initiatorId: userId,
      notes,
    },
  })

  await prisma.activityLog.create({
    data: {
      activityType: "cycle_count_started",
      referenceId: cycleSession.id,
      referenceType: "CycleCountSession",
      description: `Cycle count started for ${stockItem.name} (${stockItem.warehouse})`,
      userId,
    },
  })

  return NextResponse.json(cycleSession)
}
