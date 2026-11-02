import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNotificationAudience } from "@/hooks/useNotifications"
import type { AudienceUser } from "@/types/notification"
import { Loader2, Search, X } from "lucide-react"

interface NotificationUserPickerProps {
  selectedUsers: AudienceUser[]
  onChange: (users: AudienceUser[]) => void
  hasError?: boolean
}

const PAGE_SIZE = 20

// Searchable multi-select of app users for "Selected Users" notifications
export function NotificationUserPicker({ selectedUsers, onChange, hasError }: NotificationUserPickerProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // wait for typing to pause before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotificationAudience({
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
  })

  const users = data?.pages.flatMap((page) => page.data) || []
  const totalCount = data?.pages[0]?.total_count || 0
  const selectedIds = new Set(selectedUsers.map((user) => user._id))
  const allShownSelected = users.length > 0 && users.every((user) => selectedIds.has(user._id))

  const toggleUser = (user: AudienceUser) => {
    onChange(
      selectedIds.has(user._id)
        ? selectedUsers.filter((selected) => selected._id !== user._id)
        : [...selectedUsers, user]
    )
  }

  const toggleShown = () => {
    if (allShownSelected) {
      const shownIds = new Set(users.map((user) => user._id))
      onChange(selectedUsers.filter((selected) => !shownIds.has(selected._id)))
    } else {
      onChange([...selectedUsers, ...users.filter((user) => !selectedIds.has(user._id))])
    }
  }

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${hasError ? "border-red-500" : "border-gray-300"}`}>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <span
              key={user._id}
              className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs pl-3 pr-1 py-1 rounded-full"
            >
              {user.name || user.phone}
              <button
                type="button"
                onClick={() => toggleUser(user)}
                className="p-0.5 rounded-full hover:bg-gray-200"
                aria-label={`Remove ${user.name || user.phone}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => onChange([])} className="text-xs text-red-500 hover:text-red-600 px-2">
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users by name, phone, email or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-gray-300 rounded-lg"
        />
      </div>

      <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 sticky top-0">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allShownSelected}
              onChange={toggleShown}
              disabled={!users.length}
              className="w-4 h-4"
            />
            Select all shown
          </label>
          <span className="text-xs text-gray-500">
            {selectedUsers.length} selected
            {isFetching && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No users found</p>
        ) : (
          users.map((user) => (
            <label
              key={user._id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(user._id)}
                onChange={() => toggleUser(user)}
                className="w-4 h-4"
              />
              <img
                src={user.image || "/Ellipse 3226.png"}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/Ellipse 3226.png"
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{user.name || "Unnamed user"}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[user.phone, user.email].filter(Boolean).join(" · ") || "No contact details"}
                </p>
              </div>
              {!user.email && (
                <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">No email</span>
              )}
            </label>
          ))
        )}

        {hasNextPage && (
          <div className="p-2 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Load more ({totalCount - users.length} more)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
