/**
 * formatRelativeTime(timestamp)
 *
 * Returns a human-friendly relative time string, automatically choosing
 * the most appropriate unit — matching the behaviour of GitHub, Linear, Notion.
 *
 * < 60 minutes  →  "5m ago", "42m ago"
 * < 24 hours    →  "2h ago", "17h ago"
 * < 7 days      →  "3d ago", "6d ago"
 * ≥ 7 days      →  short calendar date, e.g. "Jul 18", "Jan 05"
 *                  (year appended only if it differs from the current year)
 *
 * @param {string|number|Date} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return "Unknown";

  const date = new Date(timestamp);

  // Guard against invalid dates
  if (isNaN(date.getTime())) return "Unknown";

  const now   = new Date();
  const diffMs = now - date;

  // Future timestamps — show the date directly
  if (diffMs < 0) {
    return formatCalendarDate(date, now);
  }

  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays  < 7)  return `${diffDays}d ago`;

  return formatCalendarDate(date, now);
}

/**
 * Formats a Date as a short calendar string.
 * Includes the year only when it differs from `referenceDate`'s year.
 *
 * @param {Date} date
 * @param {Date} referenceDate
 * @returns {string}  e.g. "Jul 18" or "Jan 05, 2024"
 */
function formatCalendarDate(date, referenceDate) {
  const sameYear = date.getFullYear() === referenceDate.getFullYear();

  return date.toLocaleDateString("en-US", {
    month: "short",
    day:   "2-digit",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
