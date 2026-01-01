import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", totalUsers: 12, totalEvents: 8 },
  { month: "Feb", totalUsers: 8, totalEvents: 6 },
  { month: "Mar", totalUsers: 15, totalEvents: 10 },
  { month: "Apr", totalUsers: 18, totalEvents: 12 },
  { month: "May", totalUsers: 22, totalEvents: 15 },
  { month: "Jun", totalUsers: 35, totalEvents: 25 },
  { month: "Jul", totalUsers: 42, totalEvents: 30 },
  { month: "Aug", totalUsers: 48, totalEvents: 35 },
  { month: "Sep", totalUsers: 35, totalEvents: 28 },
  { month: "Oct", totalUsers: 38, totalEvents: 32 },
  { month: "Nov", totalUsers: 28, totalEvents: 22 },
  { month: "Dec", totalUsers: 45, totalEvents: 38 },
]

interface DashboardChartProps {
  activeTab: "totalUsers" | "totalEvents"
}

export function DashboardChart({ activeTab }: DashboardChartProps) {
  const dataKey = activeTab === "totalUsers" ? "totalUsers" : "totalEvents"
  const maxValue = activeTab === "totalUsers" ? 50 : 40
  
  // Different colors for different tabs
  const isUsersTab = activeTab === "totalUsers"
  const strokeColor = isUsersTab ? "#3B82F6" : "#EF4444"
  const gradientId = isUsersTab ? "colorGradientBlue" : "colorGradientRed"

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