import { useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { NavigationItem } from "@/components/ui/navigation-item"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Settings,
  LogOut,
  Image,
  BriefcaseBusiness,
  Building2,
} from "lucide-react"

type Page = "dashboard" | "user-management" | "user-profile" | "job-providers" | "associations" | "content-management" | "events" | "promotions" | "resources" | "campaigns" | "notifications" | "surveys" | "voting" | "financial-programmes" | "feed-management" | "feedback" | "levels" | "approvals" | "approval-posts" | "approval-campaigns" | "approval-jobs" | "settings" | "role-management" | "admin-management" | "app-settings"

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
    "notifications",
    "surveys",
    "voting"
  ].includes(currentPage)

  const isContentManagementExpanded = expandedItems.includes("content-management")

  const isApprovalsActive = [
    "approvals",
    "approval-posts",
    "approval-campaigns",
    "approval-jobs"
  ].includes(currentPage)

  const isApprovalsExpanded = expandedItems.includes("approvals")

  const isSettingsActive = [
    "settings",
    "admin-management",
    "role-management",
    "app-settings"
  ].includes(currentPage)

  const isSettingsExpanded = expandedItems.includes("settings")
  const { userPermissions, isSuperAdmin } = (() => {
    try {
      const storedUser = localStorage.getItem('authUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        const role = (user.role || '').toLowerCase()
        const isSuper = role === 'super admin' || user.is_super_admin === true

        // Ensure associations_management is in user permissions
        if (Array.isArray(user.permissions) && !user.permissions.includes('associations_management_view')) {
          user.permissions.push('associations_management_view', 'associations_management_modify')
          try {
            localStorage.setItem('authUser', JSON.stringify(user))
          } catch (_) {}
        }

        return { userPermissions: user.permissions || [], isSuperAdmin: isSuper }
      }
    } catch (e) {
      console.error(e)
    }
    return { userPermissions: [], isSuperAdmin: false }
  })()

  const hasPermission = (permissionId: string) => {
    if (permissionId === 'associations_management') return true
    if (isSuperAdmin) return true
    return userPermissions.some((p: string) => p === `${permissionId}_view` || p === `${permissionId}_modify`)
  }

  const showDashboard = hasPermission("dashboard_management")
  const showUserManagement = hasPermission("user_management")
  const showJobProviders = hasPermission("job_providers_management")
  const showEvents = hasPermission("events_management")
  const showPromotions = hasPermission("promotions_management")
  const showResources = hasPermission("resources_management")
  const showCampaigns = hasPermission("campaigns_management")
  const showNotifications = hasPermission("notifications_management")
  const showSurveys = hasPermission("survey_management")
  const showVoting = hasPermission("voting_management")
  const showContentManagement = showEvents || showPromotions || showResources || showCampaigns || showNotifications || showSurveys || showVoting

  const showFinancialProgrammes = hasPermission("financial_programmes_management")
  const showAssociations = hasPermission("associations_management")
  const showFeedManagement = hasPermission("feed_management")
  const showLevels = hasPermission("levels_management")
  const showPostApprovals = hasPermission("post_approvals")
  const showCampaignApprovals = hasPermission("campaign_approvals")
  const showJobApprovals = hasPermission("job_approvals")
  const showApprovals = showPostApprovals || showCampaignApprovals || showJobApprovals

  const showAdminManagement = hasPermission("admin_management")
  const showRoleManagement = hasPermission("role_management")
  const showAppSettings = hasPermission("app_settings_management")
  const showSettings = showAdminManagement || showRoleManagement || showAppSettings

  const showFeedback = hasPermission("feedback_management")

  return (
    <Sidebar className="flex flex-col h-screen w-70">
      {/* Logo Section */}
      <div className="w-72 h-20 rounded flex items-center justify-center p-2 mb-4">
        <img
          src="/24_connect_logo.png"
          alt="24 Connect Logo"
          className="h-full w-auto object-contain"
        />
      </div>
      {/* Navigation Items */}

      <div className="flex-1 overflow-y-auto px-2 sidebar-scroll">

        {showDashboard && (
          <NavigationItem
            icon={<LayoutDashboard className="w-6 h-6 text-gray-800" />}
            label="Dashboard"
            variant={currentPage === "dashboard" ? "active" : "default"}
            onClick={() => handleNavigation("dashboard")}
          />
        )}

        {showUserManagement && (
          <NavigationItem
            icon={<Users className="w-6 h-6 text-gray-800" />}
            label="User Management"
            variant={currentPage === "user-management" || currentPage === "user-profile" ? "active" : "default"}
            onClick={() => handleNavigation("user-management")}
          />
        )}

        {showJobProviders && (
          <NavigationItem
            icon={<BriefcaseBusiness className="w-6 h-6 text-gray-800" />}
            label="Job Providers"
            variant={currentPage === "job-providers" ? "active" : "default"}
            onClick={() => handleNavigation("job-providers")}
          />
        )}

        {showContentManagement && (
          <NavigationItem
            icon={<FileText className="w-6 h-6 text-gray-800" />}
            label="Content Management"
            variant={isContentManagementActive ? "active" : "default"}
            expandable
            expanded={isContentManagementExpanded}
            onClick={() => {
              toggleExpanded("content-management")
            }}
            onExpandToggle={() => toggleExpanded("content-management")}
          />
        )}

        {/* Content Management Sub-items */}
        {showContentManagement && isContentManagementExpanded && (
          <div className="ml-8 flex flex-col gap-1 mt-2">
            {showEvents && (
              <NavigationItem
                label="Events"
                variant={currentPage === "events" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("events")}
              />
            )}
            {showPromotions && (
              <NavigationItem
                label="Promotions"
                variant={currentPage === "promotions" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("promotions")}
              />
            )}
            {showResources && (
              <NavigationItem
                label="Resources"
                variant={currentPage === "resources" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("resources")}
              />
            )}
            {showCampaigns && (
              <NavigationItem
                label="Campaigns"
                variant={currentPage === "campaigns" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("campaigns")}
              />
            )}
            {showNotifications && (
              <NavigationItem
                label="Notifications"
                variant={currentPage === "notifications" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("notifications")}
              />
            )}
            {showSurveys && (
              <NavigationItem
                label="Surveys"
                variant={currentPage === "surveys" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("surveys")}
              />
            )}
            {showVoting && (
              <NavigationItem
                label="Voting"
                variant={currentPage === "voting" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("voting")}
              />
            )}
          </div>
        )}

        {showFinancialProgrammes && (
          <NavigationItem
            icon={<TrendingUp className="w-6 h-6 text-gray-800" />}
            label="Financial Programmes"
            variant={currentPage === "financial-programmes" ? "active" : "default"}
            onClick={() => handleNavigation("financial-programmes")}
          />
        )}

        {showAssociations && (
          <NavigationItem
            icon={<Building2 className="w-6 h-6 text-gray-800" />}
            label="Associations"
            variant={currentPage === "associations" ? "active" : "default"}
            onClick={() => handleNavigation("associations")}
          />
        )}

        {showFeedManagement && (
          <NavigationItem
            icon={<Image className="w-6 h-6 text-gray-800" />}
            label="Feed Management"
            variant={currentPage === "feed-management" ? "active" : "default"}
            onClick={() => handleNavigation("feed-management")}
          />
        )}

        {showLevels && (
          <NavigationItem
            icon={<BarChart3 className="w-6 h-6 text-gray-800" />}
            label="Levels"
            variant={currentPage === "levels" ? "active" : "default"}
            onClick={() => handleNavigation("levels")}
          />
        )}

        {showApprovals && (
          <NavigationItem
            icon={<CheckCircle className="w-6 h-6 text-gray-800" />}
            label="Approvals"
            variant={isApprovalsActive ? "active" : "default"}
            expandable
            expanded={isApprovalsExpanded}
            onClick={() => {
              toggleExpanded("approvals")
            }}
            onExpandToggle={() => toggleExpanded("approvals")}
          />
        )}

        {/* Approvals Sub-items */}
        {showApprovals && isApprovalsExpanded && (
          <div className="ml-8 flex flex-col gap-1 mt-2">
            {showPostApprovals && (
              <NavigationItem
                label="Posts"
                variant={currentPage === "approval-posts" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("approval-posts")}
              />
            )}
            {showCampaignApprovals && (
              <NavigationItem
                label="Campaigns"
                variant={currentPage === "approval-campaigns" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("approval-campaigns")}
              />
            )}
            {showJobApprovals && (
              <NavigationItem
                label="Jobs"
                variant={currentPage === "approval-jobs" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("approval-jobs")}
              />
            )}
          </div>
        )}
        {showSettings && (
          <NavigationItem
            icon={<Settings className="w-6 h-6 text-gray-800" />}
            label="Settings"
            variant={isSettingsActive ? "active" : "default"}
            expandable
            expanded={isSettingsExpanded}
            onClick={() => {
              toggleExpanded("settings")
            }}
            onExpandToggle={() => toggleExpanded("settings")}
          />
        )}

        {showSettings && isSettingsExpanded && (
          <div className="ml-8 flex flex-col gap-1 mt-2">
            {showAdminManagement && (
              <NavigationItem
                label="Admin Management"
                variant={currentPage === "admin-management" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("admin-management")}
              />
            )}
            {showRoleManagement && (
              <NavigationItem
                label="Role Management"
                variant={currentPage === "role-management" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("role-management")}
              />
            )}
            {showAppSettings && (
              <NavigationItem
                label="Application Settings"
                variant={currentPage === "app-settings" ? "active" : "default"}
                size="sm"
                onClick={() => handleNavigation("app-settings")}
              />
            )}
          </div>
        )}


        {showFeedback && (
          <NavigationItem
            icon={<FileText className="w-6 h-6 text-gray-800" />}
            label="Feedback"
            variant={currentPage === "feedback" ? "active" : "default"}
            onClick={() => handleNavigation("feedback")}
          />
        )}
      </div>

      {/* Logout Section */}
      <div className="flex items-center gap-3 w-full px-4 py-3 rounded cursor-pointer hover:bg-gray-100 transition-colors mt-auto" onClick={handleLogout}>
        <LogOut className="w-6 h-6 text-gray-800" />
        <span className="text-sm font-normal text-black">Logout</span>
      </div>
    </Sidebar>
  )
}
