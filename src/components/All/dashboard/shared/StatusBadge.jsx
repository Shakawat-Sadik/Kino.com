// components/All/dashboard/shared/StatusBadge.jsx
// No "use client" needed — pure presentational, works in server and client components

const STATUS_STYLES = {
  // Order statuses
  pending:    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  accepted:   "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  shipped:    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  delivered:  "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled:  "bg-red-500/10 text-red-500",

  // Payment statuses
  success:    "bg-green-500/10 text-green-600 dark:text-green-400",
  paid:       "bg-green-500/10 text-green-600 dark:text-green-400",
  failed:     "bg-red-500/10 text-red-500",
  refunded:   "bg-orange-500/10 text-orange-600 dark:text-orange-400",

  // Product statuses
  available:  "bg-green-500/10 text-green-600 dark:text-green-400",
  sold:       "bg-muted text-muted-foreground",
  rejected:   "bg-red-500/10 text-red-500",

  // User statuses
  active:     "bg-green-500/10 text-green-600 dark:text-green-400",
  blocked:    "bg-red-500/10 text-red-500",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status?.toLowerCase()] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${style}`}>
      {status ?? "—"}
    </span>
  );
}
