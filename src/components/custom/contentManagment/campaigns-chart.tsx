import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", monthlyAmountRaised: 25000, monthlyTargetAmount: 30000 },
  { month: "Feb", monthlyAmountRaised: 30000, monthlyTargetAmount: 35000 },
  { month: "Mar", monthlyAmountRaised: 25000, monthlyTargetAmount: 30000 },
  { month: "Apr", monthlyAmountRaised: 0, monthlyTargetAmount: 25000 },
  { month: "May", monthlyAmountRaised: 70000, monthlyTargetAmount: 80000 },
  { month: "Jun", monthlyAmountRaised: 190000, monthlyTargetAmount: 200000 },
  { month: "Jul", monthlyAmountRaised: 50000, monthlyTargetAmount: 60000 },
  { month: "Aug", monthlyAmountRaised: 230000, monthlyTargetAmount: 240000 },
  { month: "Sep", monthlyAmountRaised: 130000, monthlyTargetAmount: 140000 },
  { month: "Oct", monthlyAmountRaised: 110000, monthlyTargetAmount: 120000 },
  { month: "Nov", monthlyAmountRaised: 240000, monthlyTargetAmount: 250000 },
  { month: "Dec", monthlyAmountRaised: 220000, monthlyTargetAmount: 230000 },
]

export function CampaignsChart() {
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
            domain={[0, 250000]}
            tickFormatter={(value) => `${value / 1000}K`}
            ticks={[0, 50000, 100000, 150000, 200000, 250000]}
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
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}