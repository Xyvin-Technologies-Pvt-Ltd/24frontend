import { BriefcaseBusiness, Building2, FileBadge2, Users } from "lucide-react"

interface JobProviderSummaryCardsProps {
  totalProviders: number
  activeProviders: number
  activeJobs: number
  totalApplicants: number
}

const cards = [
  {
    key: "totalProviders",
    title: "Total Providers",
    bgColor: "bg-[#EDEEFC]",
    borderColor: "border-[#E3E8F3]",
    iconBg: "bg-white/70",
    icon: Building2,
  },
  {
    key: "activeProviders",
    title: "Active Providers",
    bgColor: "bg-[#E6F1FD]",
    borderColor: "border-[#D6E6F8]",
    iconBg: "bg-white/70",
    icon: Users,
  },
  {
    key: "activeJobs",
    title: "Active Jobs",
    bgColor: "bg-[#EDEEFC]",
    borderColor: "border-[#E3E8F3]",
    iconBg: "bg-white/70",
    icon: BriefcaseBusiness,
  },
  {
    key: "totalApplicants",
    title: "Total Applicants",
    bgColor: "bg-[#E6F1FD]",
    borderColor: "border-[#D6E6F8]",
    iconBg: "bg-white/70",
    icon: FileBadge2,
  },
] as const

export function JobProviderSummaryCards(props: JobProviderSummaryCardsProps) {
  const values = {
    totalProviders: props.totalProviders,
    activeProviders: props.activeProviders,
    activeJobs: props.activeJobs,
    totalApplicants: props.totalApplicants.toLocaleString("en-IN"),
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.key}
            className={`rounded-2xl border px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.02)] ${card.bgColor} ${card.borderColor}`}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-[#4F4F4F]">{card.title}</p>
                <p className="text-[30px] font-semibold leading-none text-[#161616]">{values[card.key]}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                <Icon className="h-6 w-6 text-[#718EBF]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
