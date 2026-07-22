import { Heart, MapPin, Star } from "lucide-react";
import type { VendorSummary } from "../types";
import VendorThumb from "./VendorThumb";
import { useApp } from "../store/AppContext";

interface Props {
  vendor: VendorSummary;
  onClick?: () => void;
  /** true면 무드 태그까지 노출 (업체 보러가기 리스트용) */
  showTags?: boolean;
}

// 업체 요약 카드 — 채팅 추천 / 업체 보러가기 / 전체서비스 공용 (제안서 목업 기준)
export default function VendorCard({ vendor, onClick, showTags }: Props) {
  const { favoriteVendorIds, toggleFavoriteVendor } = useApp();
  const favorited = favoriteVendorIds.includes(vendor.id);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
      >
        <VendorThumb
          category={vendor.category}
          thumbnailUrl={vendor.thumbnailUrl}
          className="h-[64px] w-[64px] rounded-xl"
        />
        <div className="min-w-0 flex-1 pr-7">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold">{vendor.name}</span>
            <span className="shrink-0 rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-semibold text-brand">
              {vendor.category}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-sub">
            <Star size={12} className="fill-[#FFC107] text-[#FFC107]" />
            <span className="font-semibold text-ink">{vendor.rating.toFixed(1)}</span>
            <span>· 후기 {vendor.reviewCount}</span>
            <span className="flex items-center gap-0.5 text-faint">
              <MapPin size={11} />
              {vendor.region}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[11px] text-faint">정찰가</span>
            <span className="text-[14px] font-extrabold">{vendor.priceLabel}</span>
          </div>
          {showTags && vendor.moodTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {vendor.moodTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-field px-1.5 py-0.5 text-[10px] text-sub"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
      <button
        type="button"
        aria-label={favorited ? "찜 해제" : "찜하기"}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavoriteVendor(vendor.id);
        }}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 transition active:scale-90"
      >
        <Heart
          size={16}
          className={favorited ? "fill-brand text-brand" : "text-faint"}
          strokeWidth={1.9}
        />
      </button>
    </div>
  );
}
