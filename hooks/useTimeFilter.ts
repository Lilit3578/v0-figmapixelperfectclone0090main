export type TimePeriod = "today" | "this-week" | "last-week" | "this-month" | "last-month" | "this-year"

export const useTimeFilter = () => {
  const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        }

      case "this-week": {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      }

      case "last-week": {
        const startOfLastWeek = new Date(today)
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        endOfLastWeek.setHours(23, 59, 59, 999)
        return { start: startOfLastWeek, end: endOfLastWeek }
      }

      case "this-month":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        }

      case "last-month":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
        }

      case "this-year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
        }

      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
    }
  }

  const formatPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case "today":
        return "Today"
      case "this-week":
        return "This Week"
      case "last-week":
        return "Last Week"
      case "this-month":
        return "This Month"
      case "last-month":
        return "Last Month"
      case "this-year":
        return "This Year"
      default:
        return "Today"
    }
  }

  return {
    getDateRange,
    formatPeriodLabel,
  }
}
