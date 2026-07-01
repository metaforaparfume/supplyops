export type OrderStage =
  | "Draft"
  | "Clarified"
  | "PO Released"
  | "In Delivery"
  | "Closed"

export type CustomsStatus = "Pending" | "Cleared"
export type LspStatus = "Pending" | "In Transit" | "Delivered"
export type DeliveryStatus = "Pending" | "Partial" | "In Progress" | "Completed"

export interface OrderStageInfo {
  key: OrderStage
  label: string
  color: string
  icon: string
  description: string
}

export const ORDER_STAGES: OrderStage[] = [
  "Draft",
  "Clarified",
  "PO Released",
  "In Delivery",
  "Closed",
]

export const STAGE_INFO: Record<OrderStage, OrderStageInfo> = {
  Draft: {
    key: "Draft",
    label: "Draft",
    color: "bg-gray-500",
    icon: "📋",
    description: "Order baru, belum diproses",
  },
  Clarified: {
    key: "Clarified",
    label: "Clarified",
    color: "bg-blue-500",
    icon: "🔍",
    description: "Order diklarifikasi, siap PO",
  },
  "PO Released": {
    key: "PO Released",
    label: "PO Released",
    color: "bg-yellow-500",
    icon: "📄",
    description: "Purchase Order sudah terbit",
  },
  "In Delivery": {
    key: "In Delivery",
    label: "In Delivery",
    color: "bg-orange-500",
    icon: "🚚",
    description: "Barang dalam pengiriman",
  },
  Closed: {
    key: "Closed",
    label: "Closed",
    color: "bg-green-500",
    icon: "✅",
    description: "Order selesai",
  },
}

export const CUSTOMS_STATUSES: CustomsStatus[] = ["Pending", "Cleared"]
export const LSP_STATUSES: LspStatus[] = ["Pending", "In Transit", "Delivered"]
export const DELIVERY_STATUSES: DeliveryStatus[] = ["Pending", "Partial", "In Progress", "Completed"]

export const SUBS_STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  Cleared: "Cleared",
  "In Transit": "In Transit",
  Delivered: "Delivered",
  Partial: "Partial",
  "In Progress": "In Progress",
  Completed: "Completed",
}

export function getStageIndex(stage: OrderStage): number {
  return ORDER_STAGES.indexOf(stage)
}

export function isStageCompleted(current: OrderStage, target: OrderStage): boolean {
  return getStageIndex(current) > getStageIndex(target)
}

export function isStageCurrent(current: OrderStage, target: OrderStage): boolean {
  return current === target
}

export function isStagePending(current: OrderStage, target: OrderStage): boolean {
  return getStageIndex(current) < getStageIndex(target)
}

export function getNextStage(current: OrderStage): OrderStage | null {
  const idx = getStageIndex(current)
  if (idx < ORDER_STAGES.length - 1) return ORDER_STAGES[idx + 1]
  return null
}

export function getPrevStage(current: OrderStage): OrderStage | null {
  const idx = getStageIndex(current)
  if (idx > 0) return ORDER_STAGES[idx - 1]
  return null
}

export function canTransition(from: OrderStage, to: OrderStage): boolean {
  return getStageIndex(to) === getStageIndex(from) + 1
}

export const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-500",
  Clarified: "bg-blue-500",
  "PO Released": "bg-yellow-500",
  "In Delivery": "bg-orange-500",
  Closed: "bg-green-500",
}