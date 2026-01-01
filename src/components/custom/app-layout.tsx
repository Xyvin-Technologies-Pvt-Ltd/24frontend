import { useState } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardPage } from "@/pages/dashboard"
import { UserManagementPage } from "@/pages/user/user-management"
import { UserProfilePage } from "@/pages/user/user-profile"
import { PostsApprovalPage } from "@/pages/approvals/posts"
import { CampaignsApprovalPage } from "@/pages/approvals/campaigns"
import { AdminManagementPage } from "@/pages/settings/admin-management"
import { LevelsPage } from "@/pages/level/levels"
import { EventsPage } from "@/pages/contentManagement/events"
import { PromotionsPage } from "@/pages/contentManagement/promotions"
import { ResourcesPage } from "@/pages/contentManagement/resources"
import { CampaignsPage } from "@/pages/contentManagement/campaigns"
import { NotificationsPage } from "@/pages/contentManagement/notifications"
import { RoleManagementPage } from "@/pages/settings/role-management"

type Page = "dashboard" | "user-management" | "user-profile" | "content-management" | "events" | "promotions" | "resources" | "campaigns" | "notifications" | "levels" | "approvals" | "approval-posts" | "approval-campaigns" | "settings" | "role-management" | "admin-management"

export function AppLayout() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "user-management":
        return <UserManagementPage />
      case "user-profile":
        return <UserProfilePage />
      case "events":
        return <EventsPage />
      case "promotions":
        return <PromotionsPage />
      case "resources":
        return <ResourcesPage />
      case "campaigns":
        return <CampaignsPage />
      case "notifications":
        return <NotificationsPage />
      case "levels":
        return <LevelsPage />
      case "approval-posts":
        return <PostsApprovalPage />
      case "approval-campaigns":
        return <CampaignsApprovalPage />
      case "admin-management":
        return <AdminManagementPage />
      case "role-management":
        return <RoleManagementPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-30">
        <DashboardSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
      
      {/* Main Content Area with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-64 flex flex-col">
        {renderPage()}
      </div>
    </div>
  )
}