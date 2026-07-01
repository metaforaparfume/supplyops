"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  ORDER_STAGES,
  STAGE_INFO,
  isStageCompleted,
  isStageCurrent,
  type OrderStage,
} from "@/lib/orderstages"

interface ProcessTrackerProps {
  currentStage: OrderStage
  customsStatus?: string
  lspStatus?: string
  deliveryStatus?: string
  poNumber?: string
  poStatus?: string
  poReleaseDate?: string
  createdAt?: string
  createdBy?: string
  className?: string
}

export default function ProcessTracker({
  currentStage,
  customsStatus,
  lspStatus,
  deliveryStatus,
  poNumber,
  poStatus,
  poReleaseDate,
  createdAt,
  createdBy,
  className,
}: ProcessTrackerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([currentStage]))

  function toggleStage(stage: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(stage)) next.delete(stage)
      else next.add(stage)
      return next
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative">
        <div className="absolute left-[19px] top-2 h-[calc(100%-32px)] w-0.5 bg-border" />
        <div className="space-y-0">
          {ORDER_STAGES.map((stage, i) => {
            const info = STAGE_INFO[stage]
            const completed = isStageCompleted(currentStage, stage)
            const current = isStageCurrent(currentStage, stage)
            const pending = !completed && !current
            const isOpen = expanded.has(stage)

            return (
              <div key={stage} className="relative pb-2 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleStage(stage)}
                  className="flex w-full items-start gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  {/* Circle indicator */}
                  <div
                    className={cn(
                      "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      completed &&
                        "border-green-500 bg-green-500 text-white",
                      current &&
                        "border-blue-500 bg-blue-500 text-white ring-4 ring-blue-100",
                      pending && "border-muted-foreground/30 bg-background text-muted-foreground/50"
                    )}
                  >
                    {completed ? "✓" : current ? "●" : String(i + 1)}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          completed && "text-green-700",
                          current && "text-blue-700",
                          pending && "text-muted-foreground/50"
                        )}
                      >
                        {info.label}
                      </span>
                      {current && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          CURRENT
                        </span>
                      )}
                      {completed && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          DONE
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        pending ? "text-muted-foreground/40" : "text-muted-foreground"
                      )}
                    >
                      {info.description}
                    </span>
                  </div>

                  {/* Expand/collapse indicator */}
                  <div className="pt-2">
                    <svg
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expandable content */}
                {isOpen && (
                  <div className="ml-14 pb-3">
                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                      {stage === "Draft" && (
                        <StageDetail icon="📋" label="Detail">
                          {createdAt && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Created</span>
                              <span className="font-medium">{createdAt}</span>
                            </div>
                          )}
                          {createdBy && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Created by</span>
                              <span className="font-medium">{createdBy}</span>
                            </div>
                          )}
                          <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            Menunggu klarifikasi dari Supply Officer
                          </div>
                        </StageDetail>
                      )}

                      {stage === "Clarified" && (
                        <StageDetail icon="🔍" label="Detail">
                          <div className="rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            Order sudah diklarifikasi. Siap untuk Generate PO.
                          </div>
                          {completed || current ? (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Next step</span>
                              <span className="font-medium">Generate Purchase Order</span>
                            </div>
                          ) : null}
                        </StageDetail>
                      )}

                      {stage === "PO Released" && (
                        <StageDetail icon="📄" label="PO Info">
                          {poNumber && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">PO Number</span>
                              <span className="font-medium">{poNumber}</span>
                            </div>
                          )}
                          {poStatus && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">PO Status</span>
                              <span className="font-medium">{poStatus}</span>
                            </div>
                          )}
                          {poReleaseDate && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Release Date</span>
                              <span className="font-medium">{poReleaseDate}</span>
                            </div>
                          )}
                          {!poNumber && (
                            <div className="rounded bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                              PO belum digenerate
                            </div>
                          )}
                        </StageDetail>
                      )}

                      {stage === "In Delivery" && (
                        <StageDetail icon="🚚" label="Delivery Status">
                          <div className="space-y-2">
                            {customsStatus !== undefined && (
                              <SubStatusRow label="Customs" status={customsStatus} />
                            )}
                            {lspStatus !== undefined && (
                              <SubStatusRow label="LSP" status={lspStatus} />
                            )}
                            {deliveryStatus !== undefined && (
                              <SubStatusRow label="Delivery" status={deliveryStatus} />
                            )}
                          </div>
                        </StageDetail>
                      )}

                      {stage === "Closed" && (
                        <StageDetail icon="✅" label="Penyelesaian">
                          <div className="rounded bg-green-50 px-3 py-2 text-xs text-green-700">
                            Order telah selesai diproses.
                          </div>
                        </StageDetail>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StageDetail({
  icon,
  label,
  children,
}: {
  icon: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}

function SubStatusRow({ label, status }: { label: string; status: string }) {
  const colorMap: Record<string, string> = {
    Pending: "bg-gray-100 text-gray-600",
    Cleared: "bg-green-100 text-green-700",
    "In Transit": "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  }

  const progressMap: Record<string, number> = {
    Pending: 0,
    Cleared: 100,
    "In Transit": 50,
    Delivered: 100,
    Partial: 33,
    "In Progress": 66,
    Completed: 100,
  }

  return (
    <div className="rounded-md border bg-background p-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            colorMap[status] || "bg-gray-100 text-gray-600"
          )}
        >
          {status}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            status === "Pending" && "bg-gray-400",
            status === "Cleared" && "bg-green-500",
            status === "Completed" && "bg-green-500",
            status === "In Transit" && "bg-blue-500",
            status === "In Progress" && "bg-blue-500",
            status === "Partial" && "bg-yellow-500",
            status === "Delivered" && "bg-green-500"
          )}
          style={{ width: `${progressMap[status] || 0}%` }}
        />
      </div>
    </div>
  )
}