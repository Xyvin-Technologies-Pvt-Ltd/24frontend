import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MoreVertical,
  PenLine,
  Search,
  SlidersHorizontal,
} from "lucide-react"

type ProviderAccent =
  | "amber"
  | "emerald"
  | "indigo"
  | "lime"
  | "orange"
  | "red"
  | "rose"
  | "sky"
  | "slate"
  | "stone"
  | "teal"
  | "violet"
  | "zinc"

export type JobProviderStatusFilter = "all" | "active" | "inactive" | "pending"

export interface JobProviderRecord {
  id: string
  name: string
  phone: string
  logoUrl?: string
  location: string
  activeJobs: number
  applicants: number
  joinedOn: string
  status: Exclude<JobProviderStatusFilter, "all">
  accent: ProviderAccent
}

interface JobProvidersTableProps {
  providers: JobProviderRecord[]
  totalCount: number
  currentPage: number
  rowsPerPage: number
  searchTerm: string
  onSearchChange: (value: string) => void
  onRowsPerPageChange: (value: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onOpenFilter: () => void
  onViewProvider: (provider: JobProviderRecord) => void
  onEditProvider: (provider: JobProviderRecord) => void
}

const accentClasses: Record<ProviderAccent, string> = {
  amber: "bg-[#EDEEFC] text-[#718EBF]",
  emerald: "bg-[#E6F1FD] text-[#718EBF]",
  indigo: "bg-[#EDEEFC] text-[#718EBF]",
  lime: "bg-[#E6F1FD] text-[#718EBF]",
  orange: "bg-[#EDEEFC] text-[#718EBF]",
  red: "bg-[#E6F1FD] text-[#718EBF]",
  rose: "bg-[#EDEEFC] text-[#718EBF]",
  sky: "bg-[#E6F1FD] text-[#718EBF]",
  slate: "bg-[#EDEEFC] text-[#718EBF]",
  stone: "bg-[#E6F1FD] text-[#718EBF]",
  teal: "bg-[#EDEEFC] text-[#718EBF]",
  violet: "bg-[#E6F1FD] text-[#718EBF]",
  zinc: "bg-[#EDEEFC] text-[#718EBF]",
}

function formatJoinedDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB")
}

function getStatusBadge(status: JobProviderRecord["status"]) {
  if (status === "active") {
    return <Badge className="rounded-full bg-[#E6F8ED] px-4 py-1 text-[#2AA65A] hover:bg-[#E6F8ED]">{status}</Badge>
  }

  if (status === "pending") {
    return <Badge className="rounded-full bg-[#FFF5E8] px-4 py-1 text-[#C98A2E] hover:bg-[#FFF5E8]">{status}</Badge>
  }

  return <Badge className="rounded-full bg-[#F1F3F7] px-4 py-1 text-[#7A7A7A] hover:bg-[#F1F3F7]">{status}</Badge>
}

function getProviderInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function JobProvidersTable({
  providers,
  totalCount,
  currentPage,
  rowsPerPage,
  searchTerm,
  onSearchChange,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
  onOpenFilter,
  onViewProvider,
  onEditProvider,
}: JobProvidersTableProps) {
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const pageEnd = Math.min(currentPage * rowsPerPage, totalCount)

  return (
    <div className="rounded-[22px] border border-[#ECECEC] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
      <div className="border-b border-[#F1F1F1] px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* <h2 className="text-[20px] font-medium text-[#161616]">Providers</h2> */}

          <div className="ml-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Providers"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                className="rounded-full border-[#B3B3B3] pl-10 focus:border-[#B3B3B3]"
              />
            </div>

            <Button
              variant="outline"
              onClick={onOpenFilter}
              className="h-10 w-10 rounded-xl border-[#ECECEC] bg-white p-0 text-[#A3A3A3] hover:bg-[#FAFAFA]"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-4 pt-3">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Provider</th>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Location</th>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Active Jobs</th>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Applicants</th>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Joined On</th>
              <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Status</th>
              <th className="px-3 py-2 text-right text-sm font-normal text-[#9C9C9C]"></th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={7} className="rounded-2xl bg-[#FAFAFA] px-3 py-10 text-center text-sm text-[#9C9C9C]">
                  No providers found for the current search and filter.
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr
                  key={provider.id}
                  className="cursor-pointer bg-[#FAFAFA] hover:bg-[#F3F3F3] transition-colors"
                  onClick={() => onViewProvider(provider)}
                >
                  <td className="rounded-l-2xl px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl text-xs font-semibold ${accentClasses[provider.accent]}`}>
                        {provider.logoUrl ? (
                          <img
                            src={provider.logoUrl}
                            alt={provider.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getProviderInitials(provider.name)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#303030]">{provider.name}</p>
                        <p className="text-xs text-[#8D8D8D]">{provider.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-[#303030]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#B3B3B3]" />
                      <span>{provider.location}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-[#303030]">{provider.activeJobs.toString().padStart(2, "0")}</td>
                  <td className="px-3 py-3 text-sm text-[#303030]">{provider.applicants}</td>
                  <td className="px-3 py-3 text-sm text-[#303030]">{formatJoinedDate(provider.joinedOn)}</td>
                  <td className="px-3 py-3 text-sm text-[#303030]">{getStatusBadge(provider.status)}</td>
                  <td className="rounded-r-2xl px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-[#737373] hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    >
                      <DropdownMenuItem 
                        className="flex items-center gap-2 px-3 py-2 text-sm"
                        onClick={() => onViewProvider(provider)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 text-sm"
                        onClick={() => onEditProvider(provider)}
                      >
                        <PenLine className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#F1F1F1] px-5 py-4 md:flex-row md:items-center md:justify-end">
        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            className="rounded-md border border-[#E5E5E5] px-2 py-1 text-sm text-[#303030] outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
          <span>
            {pageStart}-{pageEnd} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0"
              onClick={onPreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0"
              onClick={onNextPage}
              disabled={pageEnd >= totalCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
