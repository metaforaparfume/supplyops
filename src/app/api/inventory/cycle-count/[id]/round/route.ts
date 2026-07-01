import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { qtyPhysical, notes } = body
  const userId = Number((session.user as any).id)
  const sessionId = Number(params.id)

  const cycleSession = await prisma.cycleCountSession.findUnique({
    where: { id: sessionId },
    include: { rounds: { orderBy: { roundNumber: "desc" }, take: 1 }, stockItem: true },
  })

  if (!cycleSession) return NextResponse.json({ error: "Session not found" }, { status: 404 })
  if (cycleSession.status !== "In Progress") {
    return NextResponse.json({ error: "Session is already completed" }, { status: 400 })
  }

  const prevRound = cycleSession.rounds[0]
  const roundNumber = prevRound ? prevRound.roundNumber + 1 : 1
  const qtySystem = roundNumber === 1 ? cycleSession.stockItem.qtySystem : prevRound!.qtySystem
  const variance = qtyPhysical - qtySystem

  const round = await prisma.cycleCountRound.create({
    data: {
      sessionId,
      roundNumber,
      qtySystem,
      qtyPhysical,
      variance,
      countedById: userId,
      notes,
    },
  })

  // Auto-decide next action based on variance
  const isEndOfCounting = roundNumber === 3 || variance === 0
  let newStatus = "In Progress"
  let activityType = "cycle_count_round"
  let activityDesc = `Round ${roundNumber} for ${cycleSession.stockItem.name}: sys=${qtySystem}, phys=${qtyPhysical}, variance=${variance}`

  if (isEndOfCounting) {
    if (variance === 0) {
      await prisma.stockItem.update({
        where: { id: cycleSession.stockItemId },
        data: { qtySystem: qtyPhysical, qtyPhysical, lastCountDate: new Date() },
      })
      newStatus = "Completed"
      activityType = "cycle_count_completed"
      activityDesc = `Round ${roundNumber} variance = 0. Cycle count completed for ${cycleSession.stockItem.name}`
    } else {
      newStatus = "Completed"
      activityType = "cycle_count_variance"
      activityDesc = `Round ${roundNumber} variance = ${variance}. Final variance detected, needs adjustment`
    }
  }

  if (isEndOfCounting) {
    await prisma.cycleCountSession.update({
      where: { id: sessionId },
      data: { status: newStatus, finalVariance: variance === 0 ? 0 : variance },
    })
  }

  await prisma.activityLog.create({
    data: { activityType, referenceId: sessionId, referenceType: "CycleCountSession", description: activityDesc, userId },
  })

  return NextResponse.json({
    round,
    status: newStatus,
    needsClaim: variance !== 0 && roundNumber >= 3,
  })
}
