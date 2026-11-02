import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ml: "Malayalam",
}

// Turns a Joi field path like "description.ml", "event_start_date" or "speakers[0].name" into a readable label
const formatFieldPath = (path: string) => {
  const parts = path.replace(/\[\d+\]/g, "").split(".")
  const last = parts[parts.length - 1]
  const language = LANGUAGE_LABELS[last]
  const field = (language ? parts.slice(0, -1) : parts)
    .filter((part) => !/^\d+$/.test(part))
    .join(" ")
    .replace(/_/g, " ")
    .trim()
  const label = field.charAt(0).toUpperCase() + field.slice(1)
  return language ? `${label} (${language})` : label
}

// Readable message from an API error: backend `message` first (Joi field paths made friendly), then network/fallback
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  const err = error as {
    response?: { data?: { message?: unknown } }
    request?: unknown
    message?: string
  }

  const message = err?.response?.data?.message
  if (typeof message === "string" && message.trim()) {
    return message.replace(/"([\w.[\]]+)"/g, (_, path: string) => formatFieldPath(path))
  }

  if (err?.request && !err?.response) {
    return "Unable to reach the server. Please check your connection and try again."
  }

  return fallback
}
