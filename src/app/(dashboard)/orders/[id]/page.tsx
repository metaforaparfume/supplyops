"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import ProcessTracker from "@/components/processtracker"
import { STATUS_COLORS } from "@/lib/orderstages"

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

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <ProcessTracker
          currentStage={order.status}
          customsStatus={order.customsStatus}
          lspStatus={order.lspStatus}
          deliveryStatus={order.deliveryStatus}
        />

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPO Ref</span>
                <span className="text-sm font-medium">{order.cpoRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">WBS Ref</span>
                <span className="text-sm font-medium">{order.wbsRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Officer</span>
                <span className="text-sm font-medium">{order.user?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sub-statuses</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Customs</span>
                <Badge variant={order.customsStatus === "Cleared" ? "default" : "secondary"}>{order.customsStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">LSP</span>
                <Badge variant={order.lspStatus === "Delivered" ? "default" : "secondary"}>{order.lspStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Delivery</span>
                <Badge variant={order.deliveryStatus === "Completed" ? "default" : "secondary"}>{order.deliveryStatus}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
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
