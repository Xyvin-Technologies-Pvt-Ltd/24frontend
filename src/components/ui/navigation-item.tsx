import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export interface NavigationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label: string
  expandable?: boolean
  expanded?: boolean
  variant?: "default" | "active" | "expandable"
  size?: "default" | "sm" | "lg"
}

const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ className, variant = "default", size = "default", icon, label, expandable, expanded, ...props }, ref) => {
    const baseClasses = "flex items-center w-full px-3 py-3 gap-2 rounded-lg transition-colors"
    const variantClasses = {
      default: "hover:bg-gray-100",
      active: "bg-gray-200 rounded-2xl",
      expandable: "hover:bg-gray-100",
    }
    const sizeClasses = {
      default: "h-12",
      sm: "h-10", 
      lg: "h-14",
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <div className="w-6 h-6 flex items-center justify-center">
            {icon}
          </div>
        )}
        <span className="flex-1 text-left text-sm font-normal text-black">
          {label}
        </span>
        {expandable && (
          <ChevronRight 
            className={cn(
              "w-6 h-6 text-gray-600 transition-transform",
              expanded && "rotate-90"
            )}
          />
        )}
      </button>
    )
  }
)
NavigationItem.displayName = "NavigationItem"

export { NavigationItem }