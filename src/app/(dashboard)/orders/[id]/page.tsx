"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-500",
  Clarified: "bg-blue-500",
  "PO Released": "bg-yellow-500",
  "In Delivery": "bg-orange-500",
  Closed: "bg-green-500",
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`)
    if (res.ok) setOrder(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function updateStatus(status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Status updated to ${status}`)
      loadOrder()
    } else {
      toast.error("Failed to update status")
    }
  }

  async function generatePO() {
    const res = await fetch(`/api/orders/${id}/po`, { method: "POST" })
    if (res.ok) {
      toast.success("Purchase Order generated")
      loadOrder()
    } else {
      toast.error("Failed to generate PO")
    }
  }

  if (loading) return <Skeleton className="h-64" />
  if (!order) return <p>Order not found</p>

  const boq = typeof order.boqDetails === "string" ? JSON.parse(order.boqDetails) : order.boqDetails

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.cpoRef}</h1>
          <p className="text-gray-500">{order.wbsRef}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status] + " text-sm px-3 py-1"}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Customs</CardTitle></CardHeader>
          <CardContent><Badge variant={order.customsStatus === "Cleared" ? "default" : "secondary"}>{order.customsStatus}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">LSP</CardTitle></CardHeader>
          <CardContent><Badge variant={order.lspStatus === "Delivered" ? "default" : "secondary"}>{order.lspStatus}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Delivery</CardTitle></CardHeader>
          <CardContent><Badge variant={order.deliveryStatus === "Completed" ? "default" : "secondary"}>{order.deliveryStatus}</Badge></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Bill of Quantity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boq.map((item: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.pos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Release Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.pos.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.poNumber}</TableCell>
                    <TableCell><Badge>{po.status}</Badge></TableCell>
                    <TableCell>{po.releaseDate ? new Date(po.releaseDate).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {order.status === "Draft" && (
          <Button onClick={() => updateStatus("Clarified")}>Mark as Clarified</Button>
        )}
        {order.status === "Clarified" && (
          <Button onClick={generatePO}>Generate PO</Button>
        )}
        {order.status === "PO Released" && (
          <Button onClick={() => updateStatus("In Delivery")}>Mark In Delivery</Button>
        )}
        {order.status === "In Delivery" && (
          <Button onClick={() => updateStatus("Closed")}>Close Order</Button>
        )}
        <Button variant="outline" onClick={() => router.push("/orders")}>Back</Button>
      </div>
    </div>
  )
}
