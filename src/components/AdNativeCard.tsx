import { useNavigate } from "react-router-dom";
import { ChevronRight, Megaphone } from "lucide-react";
import type { AdBanner } from "../types";

// 피드 삽입형 네이티브 광고 카드 — 홈/커뮤니티 리스트 사이에 순환 노출.
// 게시글 카드와 구분되도록 "스폰서" 배지를 항상 표시한다.
export default function AdNativeCard({ ad }: { ad: AdBanner }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(ad.href)}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
    >
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-tint text-brand">
          <Megaphone size={20} strokeWidth={1.8} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-field px-1.5 py-0.5 text-[10px] font-bold text-faint">
            {ad.badgeLabel ?? "광고"}
          </span>
          <span className="truncate text-[11px] text-faint">{ad.sponsor}</span>
        </div>
        <p className="mt-0.5 truncate text-[13px] font-bold text-ink">{ad.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-sub">{ad.sub}</p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-faint" />
    </button>
  );
}
