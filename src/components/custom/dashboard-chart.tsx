import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { dashboardService } from '@/services/dashboardService'
import { Loader2 } from "lucide-react"

interface DashboardChartProps {
  activeTab: "totalUsers" | "totalEvents"
  startDate?: Date | null
  endDate?: Date | null
}

export function DashboardChart({ activeTab, startDate, endDate }: DashboardChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Different colors for different tabs
  const isUsersTab = activeTab === "totalUsers"
  const strokeColor = isUsersTab ? "#3B82F6" : "#EF4444"
  const gradientId = isUsersTab ? "colorGradientBlue" : "colorGradientRed"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let response;
        if (startDate && endDate) {
          // Format dates for API
          const startDateStr = startDate.toISOString().split('T')[0]
          const endDateStr = endDate.toISOString().split('T')[0]
          
          response = await dashboardService.getTrendsByDateRange(startDateStr, endDateStr)
        } else {
          response = await dashboardService.getMonthlyTrends()
        }
        
        if (response.status >= 200 && response.status < 300) {
          // Transform the data to match chart expectations
          const transformedData = response.data.map((item: any) => ({
            month: item.month,
            totalUsers: item.totalUsers,
            totalEvents: item.totalEvents,
            totalDonations: item.totalDonations,
            donationCount: item.donationCount
          }))
          
          setChartData(transformedData)
        } else {
          throw new Error(response.message || "Failed to fetch chart data")
        }
      } catch (err: any) {
        console.error("Error fetching chart data:", err)
        setError(err.message || "An error occurred while fetching chart data")
        // Set default empty data on error
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  // Calculate max value for Y-axis based on current tab and data
  const maxValue = Math.max(
    ...chartData.map(item => item[activeTab]),
    10 // Minimum value to prevent zero scaling
  )

  // Determine the data key to use based on active tab
  const dataKey = activeTab === "totalUsers" ? "totalUsers" : "totalEvents"

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-red-500">
        Error loading chart data: {error}
      </div>
    )
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorGradientBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorGradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            domain={[0, maxValue]}
            ticks={[0, maxValue/4, maxValue/2, (3*maxValue)/4, maxValue]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: strokeColor,
              stroke: "#ffffff",
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}