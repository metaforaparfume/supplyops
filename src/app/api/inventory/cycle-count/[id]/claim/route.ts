import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { description } = body
  const userId = Number((session.user as any).id)
  const sessionId = Number(params.id)

  const cycleSession = await prisma.cycleCountSession.findUnique({
    where: { id: sessionId },
    include: { stockItem: true },
  })
  if (!cycleSession) return NextResponse.json({ error: "Session not found" }, { status: 404 })
  if (cycleSession.claimStatus) return NextResponse.json({ error: "Claim already exists" }, { status: 409 })

  const claimLetter = await prisma.claimLetter.create({
    data: {
      sessionId,
      description: description || `Stock variance for ${cycleSession.stockItem.name}`,
      qtyMissing: Math.abs(cycleSession.finalVariance),
      status: "Draft",
    },
  })

  await prisma.cycleCountSession.update({
    where: { id: sessionId },
    data: { claimStatus: "Draft" },
  })

  await prisma.activityLog.create({
    data: {
      activityType: "claim_letter_created",
      referenceId: claimLetter.id,
      referenceType: "ClaimLetter",
      description: `Claim letter for ${cycleSession.stockItem.name}: ${Math.abs(cycleSession.finalVariance)} ${cycleSession.stockItem.unit} missing`,
      userId,
    },
  })

  return NextResponse.json(claimLetter)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const sessionId = Number(params.id)

  const claimLetter = await prisma.claimLetter.findUnique({ where: { sessionId } })
  if (!claimLetter) return NextResponse.json({ error: "Claim letter not found" }, { status: 404 })

  // If submitting, update stock (adjust system qty to match physical)
  if (body.status === "Submitted") {
    const cycleSession = await prisma.cycleCountSession.findUnique({
      where: { id: sessionId },
      include: { stockItem: true },
    })
    if (!cycleSession) return NextResponse.json({ error: "Session not found" }, { status: 404 })

    await prisma.stockItem.update({
      where: { id: cycleSession.stockItemId },
      data: {
        qtySystem: cycleSession.stockItem.qtySystem - Math.abs(cycleSession.finalVariance),
        lastCountDate: new Date(),
      },
    })

    await prisma.stockMovement.create({
      data: {
        stockItemId: cycleSession.stockItemId,
        type: "cycle_count_adjustment",
        qtyChange: -Math.abs(cycleSession.finalVariance),
        qtyBefore: cycleSession.stockItem.qtySystem,
        qtyAfter: cycleSession.stockItem.qtySystem - Math.abs(cycleSession.finalVariance),
        notes: `Adjustment from claim letter: ${claimLetter.description}`,
        userId: Number((session.user as any).id),
      },
    })
  }

  const updated = await prisma.claimLetter.update({
    where: { id: claimLetter.id },
    data: {
      status: body.status,
      submittedAt: body.status === "Submitted" ? new Date() : undefined,
      approvedAt: body.status === "Approved" ? new Date() : undefined,
      approvedById: body.status === "Approved" ? Number((session.user as any).id) : undefined,
    },
  })

  if (body.status === "Approved") {
    await prisma.cycleCountSession.update({
      where: { id: sessionId },
      data: { claimStatus: "Approved" },
    })
  }

  return NextResponse.json(updated)
}
