import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Bell, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { AuthUser } from "@/types/auth"

interface TopBarProps {
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

export function TopBar({ user: propUser }: TopBarProps) {
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string }>({
    name: "Admin",
    role: "Admin",
  })

  useEffect(() => {
    // If user is passed via props
    if (propUser) {
      setUser(propUser)
      return
    }

    // Otherwise try to get from localStorage
    try {
      const storedUserStr = localStorage.getItem('authUser')
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr) as AuthUser
        setUser({
          name: storedUser.name || "Admin",
          role: storedUser.role || "Admin",
          avatar: undefined
        })
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error)
    }
  }, [propUser])

  const defaultAvatar = "/Ellipse 3226.png"

  return (
    <div className="fixed top-0 right-0 left-64 bg-white h-[70px] flex items-center justify-end px-8 border-b border-gray-100 z-20">
      <div className="flex items-center gap-4">
        {/* Notifications */}
        {/* <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-600" />
        </div> */}

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-1 py-2 pr-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar || defaultAvatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
            <span className="text-xs text-gray-500 capitalize">{user.role}</span>
          </div>

          {/* <ChevronDown className="w-4 h-4 text-gray-600" /> */}
        </div>
      </div>
    </div>
  )
}