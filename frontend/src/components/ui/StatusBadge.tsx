import { RiskLevel } from "../../data/mockData";

interface Props {
  level: RiskLevel | string;
  size?: "sm" | "md";
}

const styles: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border border-red-300",
  HIGH: "bg-amber-100 text-amber-700 border border-amber-300",
  MODERATE: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  LOW: "bg-green-100 text-green-700 border border-green-300",
  SAFE: "bg-green-100 text-green-700 border border-green-300",
  Normal: "bg-green-50 text-green-700 border border-green-200",
  Warning: "bg-amber-50 text-amber-700 border border-amber-200",
  Overloaded: "bg-red-100 text-red-700 border border-red-300",
  Blocked: "bg-red-100 text-red-800 border border-red-400",
  Backflow: "bg-purple-100 text-purple-700 border border-purple-300",
  Confirmed: "bg-red-50 text-red-700 border border-red-200",
  "Under verification": "bg-amber-50 text-amber-700 border border-amber-200",
  Resolved: "bg-green-50 text-green-700 border border-green-200",
  Closed: "bg-warm-100 text-warm-600 border border-warm-300",
};

export default function StatusBadge({ level, size = "sm" }: Props) {
  const cls = styles[level] ?? "bg-warm-100 text-warm-600 border border-warm-300";
  const sz = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span className={`inline-block font-mono rounded-[2px] font-medium tracking-wide uppercase ${sz} ${cls}`}>
      {level}
    </span>
  );
}
