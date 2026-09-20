import { statusLabels, type AdoptionStatus } from "@/lib/adoptions/types";

const styles: Record<AdoptionStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status }: { status: AdoptionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

