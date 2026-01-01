import * as React from "react"
import { cn } from "@/lib/utils"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex flex-col justify-between items-center w-64 h-screen rounded-2xl p-4 gap-7",
          variant === "default" ? "bg-gray-50" : "bg-gray-900",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

export { Sidebar }