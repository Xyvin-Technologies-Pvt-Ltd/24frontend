import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down"
  }
  icon?: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger"
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant = "default", title, value, change, icon, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white border-gray-200",
      success: "bg-green-50 border-green-200",
      warning: "bg-yellow-50 border-yellow-200", 
      danger: "bg-red-50 border-red-200",
    }

    return (
      <div
        className={cn(
          "flex flex-col p-6 rounded-lg border shadow-sm",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && (
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold text-gray-900">{value}</span>
          
          {change && (
            <div className="flex items-center gap-1 text-sm">
              {change.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span 
                className={cn(
                  "font-medium",
                  change.trend === "up" ? "text-green-600" : "text-red-600"
                )}
              >
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }