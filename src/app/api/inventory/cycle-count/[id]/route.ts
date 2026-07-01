import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cycleSession = await prisma.cycleCountSession.findUnique({
    where: { id: Number(params.id) },
    include: {
      stockItem: true,
      initiator: { select: { id: true, name: true } },
      rounds: { include: { countedBy: { select: { name: true } } }, orderBy: { roundNumber: "asc" } },
      claimLetter: { include: { approvedBy: { select: { name: true } }, creditNote: true } },
    },
  })

  if (!cycleSession) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return NextResponse.json(cycleSession)
}
