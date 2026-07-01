"use client"

import { cn } from "@/lib/utils"
import {
  ORDER_STAGES,
  STAGE_INFO,
  getStageIndex,
  isStageCompleted,
  isStageCurrent,
  type OrderStage,
} from "@/lib/orderstages"

interface ProcessTrackerProps {
  currentStage: OrderStage
  customsStatus?: string
  lspStatus?: string
  deliveryStatus?: string
  className?: string
}

export default function ProcessTracker({
  currentStage,
  customsStatus,
  lspStatus,
  deliveryStatus,
  className,
}: ProcessTrackerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main stage tracker */}
      <div className="relative">
        <div className="absolute left-[19px] top-2 h-[calc(100%-32px)] w-0.5 bg-border" />
        <div className="space-y-0">
          {ORDER_STAGES.map((stage, i) => {
            const info = STAGE_INFO[stage]
            const completed = isStageCompleted(currentStage, stage)
            const current = isStageCurrent(currentStage, stage)
            const pending = !completed && !current

            return (
              <div key={stage} className="relative flex items-start gap-4 pb-8 last:pb-0">
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
                <div className="flex min-w-0 flex-col gap-0.5 pt-1.5">
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
              </div>
            )
          })}
        </div>
      </div>

      {/* Sub-statuses section */}
      {(customsStatus || lspStatus || deliveryStatus) && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sub-statuses
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {customsStatus !== undefined && (
              <SubStatusCard label="Customs" status={customsStatus} />
            )}
            {lspStatus !== undefined && (
              <SubStatusCard label="LSP" status={lspStatus} />
            )}
            {deliveryStatus !== undefined && (
              <SubStatusCard label="Delivery" status={deliveryStatus} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SubStatusCard({ label, status }: { label: string; status: string }) {
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
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
            colorMap[status] || "bg-gray-100 text-gray-600"
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${progressMap[status] || 0}%` }}
        />
      </div>
    </div>
  )
}