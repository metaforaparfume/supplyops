"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Round {
  id: number
  roundNumber: number
  qtySystem: number
  qtyPhysical: number
  variance: number
  countedBy: { name: string }
  notes: string | null
  createdAt: string
}

interface ClaimLetter {
  id: number
  description: string
  qtyMissing: number
  status: string
  submittedAt: string | null
  approvedAt: string | null
  approvedBy: { name: string } | null
  creditNote: CreditNote | null
}

interface CreditNote {
  id: number
  cnNumber: string
  amount: number
  status: string
  postedAt: string | null
}

interface Session {
  id: number
  stockItem: { id: number; name: string; warehouse: string; unit: string }
  initiator: { id: number; name: string }
  status: string
  finalVariance: number
  claimStatus: string | null
  notes: string | null
  rounds: Round[]
  claimLetter: ClaimLetter | null
  createdAt: string
}

interface CycleCountPanelProps {
  session: Session
  onRefresh: () => void
}

export default function CycleCountPanel({ session, onRefresh }: CycleCountPanelProps) {
  const [qtyPhysical, setQtyPhysical] = useState("")
  const [roundNotes, setRoundNotes] = useState("")
  const [claimDesc, setClaimDesc] = useState("")
  const [cnAmount, setCnAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const lastRound = session.rounds[session.rounds.length - 1]
  const roundCount = session.rounds.length
  const hasVariance = session.finalVariance !== 0

  async function submitRound() {
    if (!qtyPhysical) return toast.error("Masukkan physical count")
    setLoading(true)

    const res = await fetch(`/api/inventory/cycle-count/${session.id}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qtyPhysical: Number(qtyPhysical), notes: roundNotes }),
    })

    if (res.ok) {
      toast.success("Round recorded")
      setQtyPhysical("")
      setRoundNotes("")
      onRefresh()
    } else {
      const err = await res.json()
      toast.error(err.error || "Failed")
    }
    setLoading(false)
  }

  async function createClaimLetter() {
    setLoading(true)
    const res = await fetch(`/api/inventory/cycle-count/${session.id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: claimDesc || `Variance ${Math.abs(session.finalVariance)} ${session.stockItem.unit}` }),
    })

    if (res.ok) {
      toast.success("Claim letter created")
      onRefresh()
    } else {
      const err = await res.json()
      toast.error(err.error || "Failed")
    }
    setLoading(false)
  }

  async function updateClaimStatus(status: string) {
    setLoading(true)
    const res = await fetch(`/api/inventory/cycle-count/${session.id}/claim`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(`Claim ${status}`)
      onRefresh()
    } else {
      const err = await res.json()
      toast.error(err.error || "Failed")
    }
    setLoading(false)
  }

  async function createCreditNote() {
    setLoading(true)
    const amount = cnAmount ? Number(cnAmount) : undefined
    const res = await fetch(`/api/inventory/cycle-count/${session.id}/credit-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })

    if (res.ok) {
      toast.success("Credit note created")
      onRefresh()
    } else {
      const err = await res.json()
      toast.error(err.error || "Failed")
    }
    setLoading(false)
  }

  async function updateCreditNoteStatus(status: string) {
    setLoading(true)
    const res = await fetch(`/api/inventory/cycle-count/${session.id}/credit-note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(`Credit note ${status}`)
      onRefresh()
    } else {
      const err = await res.json()
      toast.error(err.error || "Failed")
    }
    setLoading(false)
  }

  const isFirstUnfinished = roundCount === 0
  const isRecount = roundCount === 1 && hasVariance
  const countingDone = roundCount >= 3 || (roundCount > 0 && lastRound?.variance === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{session.stockItem.name}</h3>
          <p className="text-sm text-muted-foreground">{session.stockItem.warehouse} • {session.stockItem.unit}</p>
        </div>
        <Badge className={session.status === "Completed" ? "bg-green-500" : "bg-blue-500"}>
          {session.status === "Completed" ? (hasVariance ? "Variance Found" : "Completed ✓") : "In Progress"}
        </Badge>
      </div>

      {/* Counting Phase — Warehouse Provider Lane (SLDM/DWM) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Warehouse Provider</Badge>
            <CardTitle className="text-base">Counting Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Round indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((rn) => {
              const round = session.rounds.find((r) => r.roundNumber === rn)
              const isActive = roundCount === rn - 1
              const isDone = !!round
              const hasV = round ? round.variance !== 0 : false
              return (
                <div key={rn} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      isDone
                        ? hasV
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                        : isActive
                          ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span>{isDone ? (hasV ? "!" : "✓") : isActive ? "●" : rn}</span>
                    <span>{rn === 1 ? "First Count" : rn === 2 ? "Recount" : "Final Count"}</span>
                  </div>
                  {rn < 3 && (
                    <div className={`h-px w-6 ${roundCount > rn ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Previous rounds summary */}
          {session.rounds.map((r) => (
            <div key={r.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Round {r.roundNumber}</span>
                <Badge variant={r.variance !== 0 ? "secondary" : "default"} className={r.variance !== 0 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                  Variance: {r.variance > 0 ? "+" : ""}{r.variance}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>System: <strong>{r.qtySystem}</strong></div>
                <div>Physical: <strong>{r.qtyPhysical}</strong></div>
                <div>By: <strong>{r.countedBy.name}</strong></div>
              </div>
              {r.notes && <p className="mt-1 text-xs text-muted-foreground">Note: {r.notes}</p>}
            </div>
          ))}

          {/* Input for new round */}
          {!countingDone && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">
                {isFirstUnfinished ? "Enter First Count Physical Qty" :
                 isRecount ? "Enter Recount Physical Qty" :
                 "Enter Final Count Physical Qty"}
              </Label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  className="w-40"
                  value={qtyPhysical}
                  onChange={(e) => setQtyPhysical(e.target.value)}
                  placeholder="Physical count"
                />
                <Input
                  className="flex-1"
                  value={roundNotes}
                  onChange={(e) => setRoundNotes(e.target.value)}
                  placeholder="Notes (optional)"
                />
                <Button onClick={submitRound} disabled={loading}>
                  {loading ? "Saving..." : "Submit Count"}
                </Button>
              </div>
              {lastRound && lastRound.variance !== 0 && roundCount < 3 && (
                <p className="text-xs text-orange-600">
                  Variance detected ({lastRound.variance > 0 ? "+" : ""}{lastRound.variance}). Proceed to next round.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supply LDM Lane — shown only if variance exists at end */}
      {countingDone && hasVariance && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Supply LDM</Badge>
              <CardTitle className="text-base">Resolution Phase</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: System Adjustment */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">✓</div>
              <div className="flex-1">
                <p className="text-sm font-medium">System Adjustment (WMS/SAP)</p>
                <p className="text-xs text-muted-foreground">
                  Adjusted by {Math.abs(session.finalVariance)} {session.stockItem.unit}
                  {session.claimLetter?.status === "Submitted" || session.claimLetter?.status === "Approved" ? " — Done" : " — Pending"}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700">Automatic</Badge>
            </div>

            {/* Step 2: Claim Letter */}
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                session.claimLetter
                  ? session.claimLetter.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {session.claimLetter?.status === "Approved" ? "✓" : session.claimLetter ? "●" : "2"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Claim Letter</p>
                  {session.claimLetter && (
                    <Badge variant="outline">{session.claimLetter.status}</Badge>
                  )}
                </div>

                {!session.claimLetter ? (
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={claimDesc}
                      onChange={(e) => setClaimDesc(e.target.value)}
                      placeholder="Describe discrepancy..."
                    />
                    <Button size="sm" onClick={createClaimLetter} disabled={loading}>
                      Create Claim
                    </Button>
                  </div>
                ) : session.claimLetter.status === "Draft" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateClaimStatus("Submitted")} disabled={loading}>
                      Submit to Manager
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateClaimStatus("Approved")} disabled={loading}>
                      Approve (Demo)
                    </Button>
                  </div>
                ) : session.claimLetter.status === "Submitted" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateClaimStatus("Approved")} disabled={loading}>
                      Approve Claim
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-green-600">Approved by {session.claimLetter.approvedBy?.name || "Manager"}</p>
                )}
              </div>
            </div>

            {/* Step 3: Credit Note */}
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                session.claimLetter?.creditNote
                  ? session.claimLetter.creditNote.status === "Posted"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {session.claimLetter?.creditNote?.status === "Posted" ? "✓" : session.claimLetter?.creditNote ? "●" : "3"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Credit Note</p>
                  {session.claimLetter?.creditNote && (
                    <Badge variant="outline">{session.claimLetter.creditNote.status}</Badge>
                  )}
                </div>

                {session.claimLetter?.status === "Approved" && !session.claimLetter.creditNote ? (
                  <div className="flex gap-2">
                    <Input
                      className="w-40"
                      value={cnAmount}
                      onChange={(e) => setCnAmount(e.target.value)}
                      placeholder="Amount (optional)"
                    />
                    <Button size="sm" onClick={createCreditNote} disabled={loading}>
                      Create Credit Note
                    </Button>
                  </div>
                ) : session.claimLetter?.creditNote?.status === "Draft" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateCreditNoteStatus("Posted")} disabled={loading}>
                      Post Credit Note
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateCreditNoteStatus("Submitted to AP")} disabled={loading}>
                      Submit to AP PtP
                    </Button>
                  </div>
                ) : session.claimLetter?.creditNote?.status === "Submitted to AP" ? (
                  <p className="text-xs text-blue-600">Credit note submitted to AP PtP</p>
                ) : session.claimLetter?.creditNote?.status === "Posted" ? (
                  <div className="space-y-1">
                    <p className="text-xs text-green-600">Credit note posted</p>
                    <Button size="sm" variant="outline" onClick={() => updateCreditNoteStatus("Submitted to AP")} disabled={loading}>
                      Submit to AP PtP
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Step 4: AP PtP (final step) */}
            {session.claimLetter?.creditNote?.status === "Submitted to AP" && (
              <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">✓</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Process End — Submitted to AP PtP</p>
                  <p className="text-xs text-green-600">Credit note {session.claimLetter.creditNote.cnNumber} sent to Accounts Payable</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed with no variance */}
      {countingDone && !hasVariance && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-200 text-lg font-bold text-green-700">✓</div>
              <div>
                <p className="font-semibold text-green-800">Process Complete</p>
                <p className="text-sm text-green-600">
                  All counts match. Stock updated to {lastRound?.qtyPhysical} {session.stockItem.unit}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
