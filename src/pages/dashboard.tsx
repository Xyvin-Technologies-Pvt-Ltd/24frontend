import { useState, useRef, useEffect } from "react"
import { TopBar } from "@/components/custom/top-bar"
import { DashboardChart } from "@/components/custom/dashboard-chart"
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from "lucide-react"

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"totalUsers" | "totalEvents">("totalUsers")
  const [startDate, setStartDate] = useState("2024-01")
  const [endDate, setEndDate] = useState("2024-12")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  const formatDateRange = () => {
    const startMonth = new Date(startDate + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endMonth = new Date(endDate + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${startMonth} - ${endMonth}`
  }

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  const stats = [
    {
      title: "Total Users",
      value: "345",
      change: "+11.01%",
      isPositive: true,
      bgColor: "bg-[#EDEEFC]", // Light purple
      textColor: "text-gray-900"
    },
    {
      title: "Active Events",
      value: "48",
      change: "-0.03%",
      isPositive: false,
      bgColor: "bg-[#E6F1FD]", // Light blue
      textColor: "text-gray-900"
    },
    {
      title: "Campaigns",
      value: "48",
      change: "+15.03%",
      isPositive: true,
      bgColor: "bg-[#EDEEFC]", 
      textColor: "text-gray-900"
    },
    {
      title: "Donations",
      value: "₹2.5L",
      change: "+6.08%",
      isPositive: true,
      bgColor: "bg-[#E6F1FD]", // Light green
      textColor: "text-gray-900"
    }
  ]

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
          {stats.map((stat, index) => (
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
          ))}
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
            
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                <span className="text-sm text-gray-600">{formatDateRange()}</span>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="month"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
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
          <DashboardChart activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}