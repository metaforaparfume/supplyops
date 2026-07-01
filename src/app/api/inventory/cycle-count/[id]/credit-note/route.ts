import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const sessionId = Number(params.id)

  const claimLetter = await prisma.claimLetter.findUnique({
    where: { sessionId },
    include: { creditNote: true, session: { include: { stockItem: true } } },
  })
  if (!claimLetter) return NextResponse.json({ error: "Claim letter not found" }, { status: 404 })
  if (claimLetter.creditNote) return NextResponse.json({ error: "Credit note already exists" }, { status: 409 })

  const cnNumber = `CN-${String(sessionId).padStart(4, "0")}-${Date.now().toString(36).toUpperCase()}`
  const amount = body.amount || claimLetter.qtyMissing * 100000 // dummy pricing

  const creditNote = await prisma.creditNote.create({
    data: {
      claimLetterId: claimLetter.id,
      cnNumber,
      amount,
      status: "Draft",
    },
  })

  return NextResponse.json(creditNote)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const sessionId = Number(params.id)

  const claimLetter = await prisma.claimLetter.findUnique({
    where: { sessionId },
    include: { creditNote: true },
  })
  if (!claimLetter?.creditNote) return NextResponse.json({ error: "Credit note not found" }, { status: 404 })

  const updated = await prisma.creditNote.update({
    where: { id: claimLetter.creditNote.id },
    data: {
      status: body.status,
      postedAt: body.status === "Posted" ? new Date() : undefined,
    },
  })

  if (body.status === "Posted") {
    await prisma.cycleCountSession.update({
      where: { id: sessionId },
      data: { claimStatus: "Closed" },
    })
  }

  return NextResponse.json(updated)
}
