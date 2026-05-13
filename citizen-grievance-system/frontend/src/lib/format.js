export function statusTone(status = "") {
  const normalized = status.toLowerCase();
  if (normalized.includes("resolved")) return "green";
  if (normalized.includes("progress")) return "teal";
  if (normalized.includes("assigned")) return "blue";
  if (normalized.includes("escalated") || normalized.includes("overdue") || normalized.includes("rejected")) return "red";
  if (normalized.includes("auto") || normalized.includes("review")) return "amber";
  return "default";
}

export function priorityTone(priority = "") {
  if (priority === "Critical") return "red";
  if (priority === "High") return "amber";
  if (priority === "Medium") return "blue";
  return "default";
}

export function formatDateTime(value) {
  if (!value || value === "-") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function priorityRank(priority = "") {
  return {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  }[priority] ?? 4;
}

export function sortByPriority(items = []) {
  return [...items].sort((first, second) => {
    const priorityDiff = priorityRank(first.priority) - priorityRank(second.priority);
    if (priorityDiff !== 0) return priorityDiff;
    const proofDiff = Number(Boolean(second.hasCitizenProof)) - Number(Boolean(first.hasCitizenProof));
    if (proofDiff !== 0) return proofDiff;
    return new Date(second.submittedAtRaw || second.submittedAt || 0) - new Date(first.submittedAtRaw || first.submittedAt || 0);
  });
}
