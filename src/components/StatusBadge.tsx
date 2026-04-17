import { cn } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL, type ProcessStatus } from "@/data/mockData";

interface Props {
  status: ProcessStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
        STATUS_COLOR[status],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
