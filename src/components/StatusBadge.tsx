export type BadgeStatus =
  | "미등록"
  | "상담중"
  | "계약완료"
  | "완료"
  | "완료(업체 미등록)";

const STYLES: Record<BadgeStatus, { chip: string; dot: string }> = {
  미등록: { chip: "bg-black/5 text-faint", dot: "bg-faint" },
  상담중: { chip: "bg-consult/12 text-consult", dot: "bg-consult" },
  계약완료: { chip: "bg-success/12 text-success", dot: "bg-success" },
  완료: { chip: "bg-success/12 text-success", dot: "bg-success" },
  "완료(업체 미등록)": {
    chip: "border border-success/35 text-success",
    dot: "bg-success",
  },
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
