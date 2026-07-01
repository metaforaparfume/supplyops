"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import CycleCountPanel from "@/components/cycle-count-panel"

export default function CycleCountPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stockItemId, setStockItemId] = useState("")
  const [notes, setNotes] = useState("")
  const [creating, setCreating] = useState(false)
  const [expandedSession, setExpandedSession] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  function fetchSessions() {
    fetch("/api/inventory/cycle-count")
      .then((r) => r.json())
      .then(setSessions)
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/inventory/cycle-count").then((r) => r.json()),
      fetch("/api/inventory").then((r) => r.json()),
    ]).then(([sess, inv]) => {
      setSessions(sess)
      setItems(inv)
    }).finally(() => setLoading(false))
  }, [])

  async function startSession() {
    if (!stockItemId) return toast.error("Pilih item")
    setCreating(true)
    const res = await fetch("/api/inventory/cycle-count", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockItemId: Number(stockItemId), notes }),
    })
    if (res.ok) {
      toast.success("Cycle count started")
      setStockItemId("")
      setNotes("")
      fetchSessions()
    } else {
      const err = await res.json()
      toast.error(err.error || "Gagal")
    }
    setCreating(false)
  }

  if (loading) return <Skeleton className="h-64" />

  const activeSessions = sessions.filter((s) => s.status === "In Progress")
  const completedSessions = sessions.filter((s) => s.status !== "In Progress")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cycle Count</h1>
      </div>

      {/* Start New Session */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Cycle Count</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <Select value={stockItemId} onValueChange={(v) => v && setStockItemId(v)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item: any) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name} ({item.warehouse}) — {item.qtySystem} {item.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              className="w-64"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <Button onClick={startSession} disabled={creating}>
            {creating ? "Starting..." : "Start Count"}
          </Button>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">In Progress ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No active cycle counts</p>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  onRefresh={fetchSessions}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No completed cycle counts</p>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  onRefresh={fetchSessions}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SessionCard({
  session,
  isExpanded,
  onToggle,
  onRefresh,
}: {
  session: any
  isExpanded: boolean
  onToggle: () => void
  onRefresh: () => void
}) {
  const variance = session.finalVariance
  const roundCount = session.rounds.length

  return (
    <Card className={session.status === "In Progress" ? "border-blue-200" : variance !== 0 ? "border-orange-200" : "border-green-200"}>
      <CardHeader className="cursor-pointer py-3" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{session.stockItem.name}</CardTitle>
            <Badge variant="outline">{session.stockItem.warehouse}</Badge>
            <Badge className={session.status === "In Progress" ? "bg-blue-500" : variance !== 0 ? "bg-orange-500" : "bg-green-500"}>
              {session.status === "In Progress" ? "In Progress" : variance !== 0 ? `Variance: ${variance}` : "Completed"}
            </Badge>
            {session.claimStatus && (
              <Badge variant="secondary">{session.claimStatus}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Rounds: {roundCount}/3</span>
            <span>{session.initiator.name}</span>
            <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t pt-4">
          <CycleCountPanel session={session} onRefresh={onRefresh} />
        </CardContent>
      )}
    </Card>
  )
}
