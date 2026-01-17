import { useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { NavigationItem } from "@/components/ui/navigation-item"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  Settings,
  LogOut,
} from "lucide-react"

type Page = "dashboard" | "user-management" | "user-profile" | "content-management" | "events" | "promotions" | "resources" | "campaigns" | "notifications" | "levels" | "approvals" | "approval-posts" | "approval-campaigns" | "settings" | "role-management" | "admin-management"

interface DashboardSidebarProps {
  currentPage?: Page
  onPageChange?: (page: Page) => void
}

export function DashboardSidebar({ currentPage = "dashboard", onPageChange }: DashboardSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["content-management"])

  const handleNavigation = (page: Page) => {
    onPageChange?.(page)
  }

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleLogout = () => {
    localStorage.clear()
      window.location.href = '/login'
  }

  const isContentManagementActive = [
    "content-management", 
    "events", 
    "promotions", 
    "resources", 
    "campaigns",
    "notifications"
  ].includes(currentPage)

  const isContentManagementExpanded = expandedItems.includes("content-management") || isContentManagementActive

  const isApprovalsActive = [
    "approvals",
    "approval-posts",
    "approval-campaigns"
  ].includes(currentPage)

  const isApprovalsExpanded = expandedItems.includes("approvals") || isApprovalsActive

  const isSettingsActive = [
    "settings",
    "admin-management",
    "role-management"
  ].includes(currentPage)

  const isSettingsExpanded = expandedItems.includes("settings") || isSettingsActive
  return (
    <Sidebar>
      {/* Logo Section */}
      <div className="flex flex-col gap-6 w-full">
        <div className="w-48 h-12 bg-white rounded flex items-center justify-center p-2">
          <img 
            src="/24_CONNECT_LOGO_page-0001-removebg-preview 1.png" 
            alt="24 Connect Logo" 
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col w-full">
          <NavigationItem
            icon={<LayoutDashboard className="w-6 h-6 text-gray-800" />}
            label="Dashboard"
            variant={currentPage === "dashboard" ? "active" : "default"}
            onClick={() => handleNavigation("dashboard")}
          />
          
          <NavigationItem
            icon={<Users className="w-6 h-6 text-gray-800" />}
            label="User Management"
            variant={currentPage === "user-management" || currentPage === "user-profile" ? "active" : "default"}
            onClick={() => handleNavigation("user-management")}
          />
          
          <NavigationItem
            icon={<FileText className="w-6 h-6 text-gray-800" />}
            label="Content Management"
            variant={isContentManagementActive ? "active" : "default"}
            expandable
            expanded={isContentManagementExpanded}
            onClick={() => {
              toggleExpanded("content-management")
              if (!isContentManagementExpanded) {
                handleNavigation("content-management")
              }
            }}
          />
          
          {/* Content Management Sub-items */}
          {isContentManagementExpanded && (
            <div className="ml-8 flex flex-col gap-1">
              <NavigationItem
                label="Events"
                variant={currentPage === "events" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("events")}
              />
              <NavigationItem
                label="Promotions"
                variant={currentPage === "promotions" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("promotions")}
              />
              <NavigationItem
                label="Resources"
                variant={currentPage === "resources" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("resources")}
              />
              <NavigationItem
                label="Campaigns"
                variant={currentPage === "campaigns" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("campaigns")}
              />
              <NavigationItem
                label="Notifications"
                variant={currentPage === "notifications" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("notifications")}
              />
            </div>
          )}
          
          <NavigationItem
            icon={<BarChart3 className="w-6 h-6 text-gray-800" />}
            label="Levels"
            variant={currentPage === "levels" ? "active" : "default"}
            onClick={() => handleNavigation("levels")}
          />
          
          <NavigationItem
            icon={<CheckCircle className="w-6 h-6 text-gray-800" />}
            label="Approvals"
            variant={isApprovalsActive ? "active" : "default"}
            expandable
            expanded={isApprovalsExpanded}
            onClick={() => {
              toggleExpanded("approvals")
              if (!isApprovalsExpanded) {
                handleNavigation("approvals")
              }
            }}
          />
          
          {/* Approvals Sub-items */}
          {isApprovalsExpanded && (
            <div className="ml-8 flex flex-col gap-1">
              <NavigationItem
                label="Posts"
                variant={currentPage === "approval-posts" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("approval-posts")}
              />
              <NavigationItem
                label="Campaigns"
                variant={currentPage === "approval-campaigns" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("approval-campaigns")}
              />
            </div>
          )}
          
          <NavigationItem
            icon={<Settings className="w-6 h-6 text-gray-800" />}
            label="Settings"
            variant={isSettingsActive ? "active" : "default"}
            expandable
            expanded={isSettingsExpanded}
            onClick={() => {
              toggleExpanded("settings")
              if (!isSettingsExpanded) {
                handleNavigation("settings")
              }
            }}
          />

          {isSettingsExpanded && (
             <div className="ml-8 flex flex-col gap-1">
              <NavigationItem
                label="Admin Mangement"
                variant={currentPage === "admin-management" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("admin-management")}
              />
              <NavigationItem
                label="Role Mangement"
                variant={currentPage === "role-management" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("role-management")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Logout Section */}
      <div 
        className="flex items-center gap-3 w-full px-4 py-3 rounded cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleLogout}
      >
        <LogOut className="w-6 h-6 text-gray-800" />
        <span className="text-sm font-normal text-black">Logout</span>
      </div>
    </Sidebar>
  )
}