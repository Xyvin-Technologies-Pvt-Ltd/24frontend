import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  close: () => void
}

const DropdownContext = React.createContext<DropdownContextType | null>(null)

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DropdownMenu({ trigger, children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  React.useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()

      // Calculate position
      // We align the right edge of the dropdown with the right edge of the trigger (similar to right-0)
      // w-48 is 12rem = 192px. 
      // Note: If the className overrides width, this calculation might need adjustment, 
      // but measuring actively would require a two-pass render or visibility tricks.
      // For this specific use case, w-48 is the default.
      const DROPDOWN_WIDTH = 192

      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - DROPDOWN_WIDTH
      })
    }
  }, [isOpen])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleScroll() {
      // Close on scroll to prevent the menu from detaching visually from the trigger
      if (isOpen) setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleScroll)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)
    }
  }, [isOpen])

  return (
    <DropdownContext.Provider value={{ close: () => setIsOpen(false) }}>
      <div className="relative inline-block" ref={triggerRef}>
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            style={{
              top: position.top + 8, // mt-2 equivalent
              left: position.left,
            }}
            className={cn(
              "absolute w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[9999]",
              className
            )}
          >
            {children}
          </div>,
          document.body
        )}
      </div>
    </DropdownContext.Provider>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  const context = React.useContext(DropdownContext)

  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2",
        className
      )}
      onClick={() => {
        onClick?.()
        context?.close()
      }}
    >
      {children}
    </button>
  )
}