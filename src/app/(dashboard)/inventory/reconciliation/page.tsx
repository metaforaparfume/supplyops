"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

export default function ReconciliationPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [physicalQtys, setPhysicalQtys] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        setItems(data)
        const qtys: Record<number, number> = {}
        data.forEach((item: any) => { qtys[item.id] = item.qtyPhysical })
        setPhysicalQtys(qtys)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const changedItems = items
      .filter((item) => physicalQtys[item.id] !== item.qtyPhysical)
      .map((item) => ({
        id: item.id,
        qtyPhysical: physicalQtys[item.id],
        notes: notes || undefined,
      }))

    if (changedItems.length === 0) {
      toast.info("No changes to reconcile")
      setLoading(false)
      return
    }

    const res = await fetch("/api/inventory/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: changedItems }),
    })

    if (res.ok) {
      toast.success(`${changedItems.length} item(s) reconciled`)
      router.push("/inventory")
    } else {
      toast.error("Reconciliation failed")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cycle Count Reconciliation</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Update Physical Counts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>System Qty</TableHead>
                  <TableHead>Physical Qty</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const diff = physicalQtys[item.id] - item.qtySystem
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>{item.qtySystem}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={physicalQtys[item.id] ?? ""}
                          onChange={(e) => setPhysicalQtys({ ...physicalQtys, [item.id]: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell className={diff !== 0 ? "font-bold text-orange-500" : "text-green-500"}>
                        {diff !== 0 ? `${diff > 0 ? "+" : ""}${diff}` : "OK"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="space-y-2">
              <Label>Notes (for all changes)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reconciliation notes" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Reconciliation"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
