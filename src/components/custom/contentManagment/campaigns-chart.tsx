import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { useCampaigns } from "@/hooks/useCampaigns"

interface ChartDataPoint {
  month: string
  monthlyAmountRaised: number
  monthlyTargetAmount: number
}

export function CampaignsChart({ startDate, endDate }: { startDate: Date | null, endDate: Date | null }) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  
  // Fetch campaigns data with date filters
  const { data: campaignsData } = useCampaigns({
    start_date: startDate ? startDate.toISOString().split('T')[0] : new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
    end_date: endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (campaignsData?.data) {
      // Process campaigns data to create monthly chart data
      const campaigns = campaignsData.data
      
      // Create array of months between start and end date
      const months: ChartDataPoint[] = []
      const currentDate = startDate ? new Date(startDate) : new Date(new Date().getFullYear() - 1, 0, 1)
      const end = endDate ? new Date(endDate) : new Date()
      
      while (currentDate <= end) {
        months.push({
          month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          monthlyAmountRaised: 0,
          monthlyTargetAmount: 0
        })
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Aggregate data by month
      campaigns.forEach(campaign => {
        const campaignStart = new Date(campaign.start_date)
        const monthIndex = campaignStart.getMonth()
        
        if (monthIndex < months.length) {
          months[monthIndex].monthlyTargetAmount += campaign.target_amount
          months[monthIndex].monthlyAmountRaised += campaign.collected_amount || 0
        }
      })
      
      setChartData(months)
    }
  }, [campaignsData, startDate, endDate])

  // Calculate max value for Y-axis scaling
  const maxValue = Math.max(...chartData.map(d => Math.max(d.monthlyAmountRaised, d.monthlyTargetAmount)), 10000)
  const yAxisTicks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue]
  const yAxisDomain = [0, maxValue * 1.1] // Add 10% padding

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
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
            domain={yAxisDomain}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `₹${(value / 1000000).toFixed(1)}M`
              } else if (value >= 1000) {
                return `₹${(value / 1000).toFixed(0)}K`
              }
              return `₹${value}`
            }}
            ticks={yAxisTicks}
          />
          <Line
            type="monotone"
            dataKey="monthlyTargetAmount"
            stroke="#EC4899"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: "#EC4899",
              stroke: "#ffffff",
              strokeWidth: 2
            }}
            name="Target Amount"
          />
          <Line
            type="monotone"
            dataKey="monthlyAmountRaised"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: "#8B5CF6",
              stroke: "#ffffff",
              strokeWidth: 2
            }}
            name="Amount Raised"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}