import { useState, useEffect, forwardRef } from "react"
import { TopBar } from "@/components/custom/top-bar"
import { DashboardChart } from "@/components/custom/dashboard-chart"
import { TrendingUp, TrendingDown, Calendar, ChevronDown, Loader2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { dashboardService } from '@/services/dashboardService'

// Month-Year Input for custom picker
const MonthInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <div className="relative w-full">
    <input
      type="text"
      readOnly
      value={value}
      onClick={onClick}
      ref={ref}
      className="w-full border border-gray-300 rounded-lg h-10 px-3 pr-10 text-gray-700 bg-white cursor-pointer"
    />
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
))
MonthInput.displayName = "MonthInput"

export function DashboardPage() {
  // Set default date range to past 1 year
  const getDefaultStartDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 1)
    return date
  }

  const [activeTab, setActiveTab] = useState<"totalUsers" | "totalEvents">("totalUsers")
  const [startDate, setStartDate] = useState<Date | null>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [tempStart, setTempStart] = useState<Date | null>(getDefaultStartDate())
  const [tempEnd, setTempEnd] = useState<Date | null>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatMonth = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch analytics with default date range (past 1 year)
        const startDateStr = startDate ? startDate.toISOString().split('T')[0] : ''
        const endDateStr = endDate ? endDate.toISOString().split('T')[0] : ''
        
        let analyticsResponse;
        if (startDate && endDate) {
          analyticsResponse = await dashboardService.getAnalyticsByDateRange(startDateStr, endDateStr)
        } else {
          analyticsResponse = await dashboardService.getAnalytics()
        }
        
        if (analyticsResponse.status >= 200 && analyticsResponse.status < 300) {
          const { stats: apiStats } = analyticsResponse.data
          
          // Format the stats for display
          const formattedStats = [
            {
              title: "Total Users",
              value: apiStats.total_users?.toString() || "0",
              change: "+11.01%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#EDEEFC]",
              textColor: "text-gray-900"
            },
            {
              title: "Active Events",
              value: apiStats.active_events?.toString() || "0",
              change: "-0.03%", // We can calculate this dynamically later
              isPositive: false,
              bgColor: "bg-[#E6F1FD]",
              textColor: "text-gray-900"
            },
            {
              title: "Campaigns",
              value: apiStats.active_campaigns?.toString() || "0",
              change: "+15.03%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#EDEEFC]",
              textColor: "text-gray-900"
            },
            {
              title: "Donations",
              value: apiStats.total_donations || "₹0",
              change: "+6.08%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#E6F1FD]",
              textColor: "text-gray-900"
            }
          ]
          
          setStats(formattedStats)
        } else {
          throw new Error(analyticsResponse.message || "Failed to fetch analytics")
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "An error occurred while fetching dashboard data")
        // Set default values on error
        setStats([
          {
            title: "Total Users",
            value: "0",
            change: "+0%",
            isPositive: true,
            bgColor: "bg-[#EDEEFC]",
            textColor: "text-gray-900"
          },
          {
            title: "Active Events",
            value: "0",
            change: "+0%",
            isPositive: true,
            bgColor: "bg-[#E6F1FD]",
            textColor: "text-gray-900"
          },
          {
            title: "Campaigns",
            value: "0",
            change: "+0%",
            isPositive: true,
            bgColor: "bg-[#EDEEFC]",
            textColor: "text-gray-900"
          },
          {
            title: "Donations",
            value: "₹0",
            change: "+0%",
            isPositive: true,
            bgColor: "bg-[#E6F1FD]",
            textColor: "text-gray-900"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [startDate, endDate])

  // Handle date range change
  const handleApplyDateRange = async () => {
    setStartDate(tempStart)
    setEndDate(tempEnd)
    setShowDatePicker(false)
    
    if (tempStart && tempEnd) {
      try {
        setLoading(true)
        setError(null)
        
        // Format dates for API
        const startDateStr = tempStart.toISOString().split('T')[0]
        const endDateStr = tempEnd.toISOString().split('T')[0]
        
        // Fetch analytics with date range
        const analyticsResponse = await dashboardService.getAnalyticsByDateRange(startDateStr, endDateStr)
        if (analyticsResponse.status >= 200 && analyticsResponse.status < 300) {
          const { stats: apiStats } = analyticsResponse.data
          
          // Format the stats for display
          const formattedStats = [
            {
              title: "Total Users",
              value: apiStats.total_users?.toString() || "0",
              change: "+11.01%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#EDEEFC]",
              textColor: "text-gray-900"
            },
            {
              title: "Active Events",
              value: apiStats.active_events?.toString() || "0",
              change: "-0.03%", // We can calculate this dynamically later
              isPositive: false,
              bgColor: "bg-[#E6F1FD]",
              textColor: "text-gray-900"
            },
            {
              title: "Campaigns",
              value: apiStats.active_campaigns?.toString() || "0",
              change: "+15.03%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#EDEEFC]",
              textColor: "text-gray-900"
            },
            {
              title: "Donations",
              value: apiStats.total_donations || "₹0",
              change: "+6.08%", // We can calculate this dynamically later
              isPositive: true,
              bgColor: "bg-[#E6F1FD]",
              textColor: "text-gray-900"
            }
          ]
          
          setStats(formattedStats)
        } else {
          throw new Error(analyticsResponse.message || "Failed to fetch analytics")
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data with date range:", err)
        setError(err.message || "An error occurred while fetching dashboard data")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-4 flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="col-span-4 text-center py-4 text-red-500">
              Error loading dashboard data: {error}. Showing default values.
            </div>
          ) : (
            stats.map((stat, index) => (
              <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                    <p className={`text-3xl font-semibold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className="flex items-center text-black">
                    {stat.isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab("totalUsers")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === "totalUsers"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                Total Users
              </button>
              <button
                onClick={() => setActiveTab("totalEvents")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === "totalEvents"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                Total Events
              </button>
            </div>

            {/* Month-Year Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                <span className="text-sm text-gray-600">
                  {startDate ? formatMonth(startDate) : "Past Year"} – {endDate ? formatMonth(endDate) : "Today"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[300px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Select Date Range</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Month</label>
                      <DatePicker
                        selected={tempStart}
                        onChange={(date: Date | null) => setTempStart(date)}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        customInput={<MonthInput />}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Month</label>
                      <DatePicker
                        selected={tempEnd}
                        onChange={(date: Date | null) => setTempEnd(date)}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        minDate={tempStart || undefined}
                        customInput={<MonthInput />}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setTempStart(getDefaultStartDate())
                        setTempEnd(new Date())
                        setShowDatePicker(false)
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyDateRange}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <DashboardChart activeTab={activeTab} startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  )
}