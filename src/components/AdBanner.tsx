import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { AdBanner as AdBannerData } from "../types";

interface Props {
  ad: AdBannerData;
  /** 카드 높이 클래스 (기본: 홈 히어로 크기) */
  heightClass?: string;
}

// 대형 배너 광고 유닛 — 홈 히어로/전체서비스 상단에서 사용.
// imageUrl이 있으면 사진 배경 + 그라디언트로 항상 흰 텍스트, 없으면
// 톤에 따라 브랜드 컬러 카드(흰 텍스트) 또는 화이트 카드(잉크 텍스트)로 렌더링.
export default function AdBanner({ ad, heightClass = "h-[150px]" }: Props) {
  const navigate = useNavigate();
  const hasImage = Boolean(ad.imageUrl);
  // 텍스트가 흰색이어야 하는 경우: 사진 배경 위, 또는 사진 없는 브랜드/다크 톤
  const lightText = hasImage || ad.tone !== "light";

  return (
    <button
      type="button"
      onClick={() => navigate(ad.href)}
      className={`relative w-full shrink-0 snap-start overflow-hidden rounded-2xl text-left transition active:scale-[0.98] ${heightClass} ${
        hasImage
          ? ""
          : ad.tone === "light"
            ? "border border-line bg-white"
            : "bg-brand"
      }`}
    >
      {hasImage && (
        <>
          <img
            src={ad.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </>
      )}

      <span
        className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold backdrop-blur ${
          lightText ? "bg-white/15 text-white" : "bg-black/[0.06] text-sub"
        }`}
      >
        {ad.badgeLabel ?? "광고"}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p
          className={`text-[11px] font-semibold ${lightText ? "text-white/75" : "text-sub"}`}
        >
          {ad.sponsor}
        </p>
        <p
          className={`mt-0.5 text-[16px] font-bold leading-snug ${lightText ? "text-white" : "text-ink"}`}
        >
          {ad.title}
        </p>
        <p className={`mt-0.5 text-[12px] ${lightText ? "text-white/80" : "text-sub"}`}>
          {ad.sub}
        </p>
      </div>

      {!hasImage && (
        <ChevronRight
          size={18}
          className={`absolute bottom-4 right-3.5 ${lightText ? "text-white/60" : "text-faint"}`}
        />
      )}
    </button>
  );
}
