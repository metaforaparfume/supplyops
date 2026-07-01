import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("password123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@supplyops.com" },
    update: {},
    create: {
      name: "Budi Manager",
      email: "admin@supplyops.com",
      password,
      role: "Admin/Manager",
    },
  })

  const officer = await prisma.user.upsert({
    where: { email: "officer@supplyops.com" },
    update: {},
    create: {
      name: "Siti Officer",
      email: "officer@supplyops.com",
      password,
      role: "Supply Officer",
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: "warehouse@supplyops.com" },
    update: {},
    create: {
      name: "Agus Warehouse",
      email: "warehouse@supplyops.com",
      password,
      role: "Warehouse Staff",
    },
  })

  const order1 = await prisma.order.create({
    data: {
      cpoRef: "CPO-2024-001",
      wbsRef: "WBS-PROJ-A-001",
      boqDetails: [
        { item: "Steel Pipe 6m", qty: 100, unit: "pcs" },
        { item: "Flange DN100", qty: 50, unit: "pcs" },
        { item: "Valve Gate 2in", qty: 25, unit: "pcs" },
      ],
      status: "PO Released",
      customsStatus: "Cleared",
      lspStatus: "In Transit",
      deliveryStatus: "Partial",
      userId: officer.id,
    },
  })

  const order2 = await prisma.order.create({
    data: {
      cpoRef: "CPO-2024-002",
      wbsRef: "WBS-PROJ-B-002",
      boqDetails: [
        { item: "Cable Tray 3m", qty: 200, unit: "pcs" },
        { item: "Cable 50mm", qty: 500, unit: "meter" },
        { item: "Connector Set", qty: 80, unit: "set" },
      ],
      status: "Clarified",
      customsStatus: "Pending",
      lspStatus: "Pending",
      deliveryStatus: "Pending",
      userId: officer.id,
    },
  })

  const order3 = await prisma.order.create({
    data: {
      cpoRef: "CPO-2024-003",
      wbsRef: "WBS-PROJ-C-003",
      boqDetails: [
        { item: "Safety Helmet", qty: 300, unit: "pcs" },
        { item: "Safety Gloves", qty: 500, unit: "pair" },
        { item: "Safety Harness", qty: 50, unit: "pcs" },
      ],
      status: "Draft",
      customsStatus: "Pending",
      lspStatus: "Pending",
      deliveryStatus: "Pending",
      userId: officer.id,
    },
  })

  const order4 = await prisma.order.create({
    data: {
      cpoRef: "CPO-2024-004",
      wbsRef: "WBS-PROJ-A-004",
      boqDetails: [
        { item: "Pump Centrifugal", qty: 10, unit: "unit" },
        { item: "Motor 10HP", qty: 10, unit: "unit" },
      ],
      status: "In Delivery",
      customsStatus: "Cleared",
      lspStatus: "Delivered",
      deliveryStatus: "In Progress",
      userId: officer.id,
    },
  })

  const order5 = await prisma.order.create({
    data: {
      cpoRef: "CPO-2024-005",
      wbsRef: "WBS-PROJ-B-005",
      boqDetails: [
        { item: "Electrical Panel", qty: 15, unit: "unit" },
        { item: "Breaker 100A", qty: 45, unit: "pcs" },
      ],
      status: "Closed",
      customsStatus: "Cleared",
      lspStatus: "Delivered",
      deliveryStatus: "Completed",
      userId: officer.id,
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2024-001",
      orderId: order1.id,
      status: "Released",
      releaseDate: new Date("2024-06-01"),
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2024-004",
      orderId: order4.id,
      status: "Released",
      releaseDate: new Date("2024-06-15"),
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2024-005",
      orderId: order5.id,
      status: "Closed",
      releaseDate: new Date("2024-05-20"),
    },
  })

  const whItems = [
    { name: "Steel Pipe 6m", warehouse: "Warehouse A", qtySystem: 250, qtyPhysical: 240, unit: "pcs", minStock: 50 },
    { name: "Flange DN100", warehouse: "Warehouse A", qtySystem: 120, qtyPhysical: 118, unit: "pcs", minStock: 30 },
    { name: "Valve Gate 2in", warehouse: "Warehouse A", qtySystem: 45, qtyPhysical: 45, unit: "pcs", minStock: 15 },
    { name: "Cable Tray 3m", warehouse: "Warehouse B", qtySystem: 180, qtyPhysical: 175, unit: "pcs", minStock: 40 },
    { name: "Cable 50mm", warehouse: "Warehouse B", qtySystem: 1200, qtyPhysical: 1180, unit: "meter", minStock: 200 },
    { name: "Connector Set", warehouse: "Warehouse B", qtySystem: 60, qtyPhysical: 62, unit: "set", minStock: 20 },
    { name: "Safety Helmet", warehouse: "Warehouse C", qtySystem: 500, qtyPhysical: 490, unit: "pcs", minStock: 100 },
    { name: "Safety Gloves", warehouse: "Warehouse C", qtySystem: 800, qtyPhysical: 790, unit: "pair", minStock: 200 },
    { name: "Safety Harness", warehouse: "Warehouse C", qtySystem: 30, qtyPhysical: 28, unit: "pcs", minStock: 20 },
    { name: "Pump Centrifugal", warehouse: "Warehouse A", qtySystem: 8, qtyPhysical: 8, unit: "unit", minStock: 5 },
    { name: "Electrical Panel", warehouse: "Warehouse B", qtySystem: 12, qtyPhysical: 10, unit: "unit", minStock: 5 },
    { name: "Motor 10HP", warehouse: "Warehouse A", qtySystem: 6, qtyPhysical: 6, unit: "unit", minStock: 3 },
  ]

  for (const item of whItems) {
    await prisma.stockItem.create({ data: item })
  }

  await prisma.stockMovement.create({
    data: {
      stockItemId: 1,
      type: "reconciliation",
      qtyChange: -10,
      qtyBefore: 250,
      qtyAfter: 240,
      notes: "Cycle count adjustment",
      userId: staff.id,
    },
  })

  await prisma.stockMovement.create({
    data: {
      stockItemId: 11,
      type: "scrap",
      qtyChange: -2,
      qtyBefore: 12,
      qtyAfter: 10,
      notes: "Damaged panel - write off",
      userId: staff.id,
    },
  })

  await prisma.activityLog.createMany({
    data: [
      { activityType: "order_created", referenceId: order1.id, referenceType: "Order", description: "Order CPO-2024-001 created", userId: officer.id },
      { activityType: "order_created", referenceId: order2.id, referenceType: "Order", description: "Order CPO-2024-002 created", userId: officer.id },
      { activityType: "order_created", referenceId: order3.id, referenceType: "Order", description: "Order CPO-2024-003 created", userId: officer.id },
      { activityType: "order_status", referenceId: order1.id, referenceType: "Order", description: "Order CPO-2024-001 status changed to PO Released", userId: officer.id },
      { activityType: "po_created", referenceId: 1, referenceType: "PurchaseOrder", description: "PO-2024-001 generated for CPO-2024-001", userId: officer.id },
      { activityType: "inventory_adjust", referenceId: 1, referenceType: "StockItem", description: "Steel Pipe 6m reconciled (-10 pcs)", userId: staff.id },
      { activityType: "inventory_scrap", referenceId: 11, referenceType: "StockItem", description: "Electrical Panel scrapped (-2 unit)", userId: staff.id },
    ],
  })

  console.log("Seed data created successfully!")
  console.log("Users:")
  console.log("  admin@supplyops.com / password123 (Admin/Manager)")
  console.log("  officer@supplyops.com / password123 (Supply Officer)")
  console.log("  warehouse@supplyops.com / password123 (Warehouse Staff)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
