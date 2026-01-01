import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: string[]
  variant?: "default"
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, variant = "default", items, ...props }, ref) => {
    return (
      <div
        className={cn("flex items-center gap-1 text-sm text-gray-600", className)}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span 
              className={cn(
                "px-4 py-2 rounded",
                index === items.length - 1 
                  ? "text-black font-medium" 
                  : "text-gray-600 hover:text-gray-800 cursor-pointer"
              )}
            >
              {item}
            </span>
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }