"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-64" />

  const lowStock = items.filter((i) => i.qtySystem <= i.minStock)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Link href="/inventory/cycle-count">
            <Button variant="outline">Cycle Count (3-Round)</Button>
          </Link>
          <Link href="/inventory/reconciliation">
            <Button variant="outline">Quick Reconciliation</Button>
          </Link>
          <Link href="/inventory/adjustment">
            <Button variant="outline">Adjustment / Scrap</Button>
          </Link>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>System Qty</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell>{item.qtySystem}</TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>
                      <Progress value={(item.qtySystem / item.minStock) * 100} className="w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>System Qty</TableHead>
                <TableHead>Physical Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Last Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const diff = item.qtySystem - item.qtyPhysical
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell>{item.qtySystem}</TableCell>
                    <TableCell>{item.qtyPhysical}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      {diff !== 0 ? (
                        <Badge variant={Math.abs(diff) > 5 ? "destructive" : "secondary"}>
                          {diff > 0 ? "+" : ""}{diff}
                        </Badge>
                      ) : (
                        <span className="text-green-500">OK</span>
                      )}
                    </TableCell>
                    <TableCell>{item.lastCountDate ? new Date(item.lastCountDate).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
