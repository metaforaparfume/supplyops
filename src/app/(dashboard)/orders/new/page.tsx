"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function NewOrderPage() {
  const router = useRouter()
  const [cpoRef, setCpoRef] = useState("")
  const [wbsRef, setWbsRef] = useState("")
  const [items, setItems] = useState([{ item: "", qty: 0, unit: "pcs" }])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  function addItem() {
    setItems([...items, { item: "", qty: 0, unit: "pcs" }])
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: string, value: any) {
    const updated = [...items]
    ;(updated[i] as any)[field] = value
    setItems(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpoRef,
        wbsRef,
        boqDetails: items.filter((i) => i.item),
        notes: notes || undefined,
      }),
    })

    if (res.ok) {
      toast.success("Order created successfully")
      router.push("/orders")
    } else {
      toast.error("Failed to create order")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Order</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpoRef">CPO/ESTA Reference</Label>
                <Input id="cpoRef" value={cpoRef} onChange={(e) => setCpoRef(e.target.value)} required placeholder="CPO-2024-XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wbsRef">WBS Reference</Label>
                <Input id="wbsRef" value={wbsRef} onChange={(e) => setWbsRef(e.target.value)} required placeholder="WBS-PROJ-X-XXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bill of Quantity (BoQ)</Label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Item name"
                      value={item.item}
                      onChange={(e) => updateItem(i, "item", e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.qty || ""}
                      onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                    />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(i)}>
                      X
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + Add Item
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
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
