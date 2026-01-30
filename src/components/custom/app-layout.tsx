import { useState, useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
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
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  // Update currentPage based on URL
  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/events')) {
      setCurrentPage('events')
    } else if (path.startsWith('/user-management')) {
      setCurrentPage('user-management')
    } else if (path.startsWith('/user-profile')) {
      setCurrentPage('user-profile')
    } else if (path.startsWith('/promotions')) {
      setCurrentPage('promotions')
    } else if (path.startsWith('/resources')) {
      setCurrentPage('resources')
    } else if (path.startsWith('/campaigns')) {
      setCurrentPage('campaigns')
    } else if (path.startsWith('/notifications')) {
      setCurrentPage('notifications')
    } else if (path.startsWith('/levels')) {
      setCurrentPage('levels')
    } else if (path.startsWith('/approval-posts')) {
      setCurrentPage('approval-posts')
    } else if (path.startsWith('/approval-campaigns')) {
      setCurrentPage('approval-campaigns')
    } else if (path.startsWith('/admin-management')) {
      setCurrentPage('admin-management')
    } else if (path.startsWith('/role-management')) {
      setCurrentPage('role-management')
    }
  }, [location.pathname])

  const handlePageChange = (page: Page) => {
    setCurrentPage(page)
    // Navigate to the corresponding route
    switch (page) {
      case "dashboard":
        navigate("/dashboard")
        break
      case "user-management":
        navigate("/user-management")
        break
      case "user-profile":
        navigate("/user-profile")
        break
      case "events":
        navigate("/events")
        break
      case "promotions":
        navigate("/promotions")
        break
      case "resources":
        navigate("/resources")
        break
      case "campaigns":
        navigate("/campaigns")
        break
      case "notifications":
        navigate("/notifications")
        break
      case "levels":
        navigate("/levels")
        break
      case "approval-posts":
        navigate("/approval-posts")
        break
      case "approval-campaigns":
        navigate("/approval-campaigns")
        break
      case "admin-management":
        navigate("/admin-management")
        break
      case "role-management":
        navigate("/role-management")
        break
      default:
        navigate("/dashboard")
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-30">
        <DashboardSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>

      {/* Main Content Area with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-80 flex flex-col">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/events/*" element={<EventsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/approval-posts" element={<PostsApprovalPage />} />
          <Route path="/approval-campaigns" element={<CampaignsApprovalPage />} />
          <Route path="/admin-management" element={<AdminManagementPage />} />
          <Route path="/role-management" element={<RoleManagementPage />} />
        </Routes>
      </div>
    </div>
  )
}