import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * 커스텀 체크박스 — 내부는 어둡고, 테두리는 금색 포인트.
 * 네이티브 체크박스를 appearance-none으로 숨기고 직접 스타일링한다.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        className={cn(
          "peer size-4 cursor-pointer appearance-none rounded-[5px] border border-primary/70 bg-input/60 transition-colors",
          "checked:border-primary checked:bg-primary",
          "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
          className
        )}
        {...props}
      />
      <Check
        strokeWidth={3.5}
        className="text-primary-foreground pointer-events-none absolute hidden size-3 peer-checked:block"
      />
    </span>
  )
}

export { Checkbox }
