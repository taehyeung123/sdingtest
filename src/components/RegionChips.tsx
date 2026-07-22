import { VENDOR_REGIONS, type Region } from "../types";

interface Props {
  value: Region | null;
  onChange: (region: Region | null) => void;
  /** true면 "전체" 칩을 넣지 않음 (업체 태그 선택처럼 반드시 지역이 필요한 경우) */
  hideAll?: boolean;
}

// 지역 필터 칩 — 전체서비스/업체 리스트 공용 가로 스크롤 셀렉터
export default function RegionChips({ value, onChange, hideAll }: Props) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {!hideAll && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
            value === null
              ? "bg-brand text-white"
              : "border border-line text-sub active:bg-field"
          }`}
        >
          전체
        </button>
      )}
      {VENDOR_REGIONS.map((region) => {
        const active = value === region;
        return (
          <button
            key={region}
            type="button"
            onClick={() => onChange(region)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              active
                ? "bg-brand text-white"
                : "border border-line text-sub active:bg-field"
            }`}
          >
            {region}
          </button>
        );
      })}
    </div>
  );
}
