"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function AdjustmentPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [stockItemId, setStockItemId] = useState("")
  const [type, setType] = useState("adjustment")
  const [qtyChange, setQtyChange] = useState(0)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setItems)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stockItemId) return toast.error("Please select an item")
    if (qtyChange === 0) return toast.error("Qty change cannot be 0")

    setLoading(true)
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockItemId: Number(stockItemId),
        type,
        qtyChange: type === "scrap" ? -Math.abs(qtyChange) : qtyChange,
        notes,
      }),
    })

    if (res.ok) {
      toast.success(`${type === "scrap" ? "Scrap" : "Adjustment"} recorded`)
      router.push("/inventory")
    } else {
      toast.error("Failed to record movement")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Stock Adjustment / Scrap</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Movement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={stockItemId} onValueChange={(v) => v && setStockItemId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name} ({item.warehouse}) - {item.qtySystem} {item.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="scrap">Scrap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{type === "scrap" ? "Qty to Scrap" : "Qty Change"}</Label>
              <Input
                type="number"
                value={qtyChange || ""}
                onChange={(e) => setQtyChange(Number(e.target.value))}
                placeholder={type === "scrap" ? "Enter quantity to scrap" : "Use positive for addition, negative for reduction"}
                required
              />
              {type === "scrap" && <p className="text-xs text-gray-500">Quantity will be recorded as negative (reduction)</p>}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for adjustment/scrap" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Submit"}
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
