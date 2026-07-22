import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Check, SearchX } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomSheet from "../components/BottomSheet";
import VendorCard from "../components/VendorCard";
import RegionChips from "../components/RegionChips";
import { filterVendors } from "../data/vendors";
import type { VendorSort } from "../data/vendors";
import { VENDOR_CATEGORIES, VENDOR_REGIONS } from "../types";
import type { Region, VendorSummary } from "../types";

const SORT_OPTIONS: { value: VendorSort; label: string }[] = [
  { value: "recommended", label: "추천순" },
  { value: "rating", label: "평점 높은순" },
  { value: "reviews", label: "후기 많은순" },
  { value: "priceAsc", label: "가격 낮은순" },
];

export default function VendorBrowse() {
  const { category: rawCategory } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itemParam = searchParams.get("item");

  // 전체서비스 등에서 ?region=서울 형태로 넘어오면 초기 선택값으로 반영
  const regionParam = searchParams.get("region");
  const [region, setRegion] = useState<Region | null>(
    () => VENDOR_REGIONS.find((r) => r === regionParam) ?? null,
  );
  const [sort, setSort] = useState<VendorSort>("recommended");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  let decoded = rawCategory ?? "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // 잘못된 인코딩이면 원본 그대로 사용
  }
  const category = VENDOR_CATEGORIES.find((c) => c === decoded);

  const vendors = useMemo(
    () =>
      category
        ? filterVendors({ category, region: region ?? undefined, sort })
        : [],
    [category, region, sort],
  );

  // 카드를 누르면 상세 화면으로 — 상담 등록은 상세 화면의 CTA에서 처리한다.
  // item 쿼리(체크리스트에서 넘어온 경우)는 그대로 상세 화면까지 실어 보낸다.
  const goToDetail = (vendor: VendorSummary) => {
    const path = `/vendors/${encodeURIComponent(vendor.category)}/${vendor.id}`;
    navigate(itemParam ? `${path}?item=${encodeURIComponent(itemParam)}` : path);
  };

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label;

  return (
    <div className="min-h-dvh bg-page pb-10">
      <PageHeader
        title={category ?? (decoded || "업체 보러가기")}
        onBack={() => navigate(-1)}
      />

      {category ? (
        <>
          <div className="border-b border-line bg-white px-5 pb-3.5 pt-3.5">
            <RegionChips value={region} onChange={setRegion} />
          </div>

          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <p className="text-[13px] text-sub">
              스딩 등록 업체 <span className="font-bold text-ink">{vendors.length}곳</span>{" "}
              · 모두 정찰제 가격이에요
            </p>
            <button
              type="button"
              onClick={() => setSortSheetOpen(true)}
              className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-sub"
            >
              <ArrowUpDown size={13} />
              {activeSortLabel}
            </button>
          </div>

          {vendors.length > 0 ? (
            <div className="flex flex-col gap-3 px-5">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  showTags
                  onClick={() => goToDetail(vendor)}
                />
              ))}
            </div>
          ) : (
            <div className="mx-5 flex flex-col items-center gap-2 rounded-2xl border border-line bg-white py-12">
              <SearchX size={26} strokeWidth={1.6} className="text-faint" />
              <p className="text-[13px] font-semibold text-ink">
                이 지역에는 등록된 업체가 없어요
              </p>
              <p className="text-[12px] text-faint">다른 지역을 선택해보세요</p>
            </div>
          )}

          <p className="pb-2 pt-6 text-center text-[12px] text-faint">
            업체를 눌러 상세 정보와 실제 후기를 확인해보세요
          </p>
        </>
      ) : (
        <div className="px-5 pt-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white py-12">
            <SearchX size={28} strokeWidth={1.6} className="text-faint" />
            <p className="text-[14px] font-semibold text-ink">
              준비 중인 카테고리예요
            </p>
            <p className="text-[12px] text-faint">
              베타에서는 일부 카테고리만 제공해요
            </p>
          </div>
        </div>
      )}

      <BottomSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        title="정렬 방식"
      >
        <div className="flex flex-col px-2 pb-2">
          {SORT_OPTIONS.map((opt) => {
            const active = sort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSort(opt.value);
                  setSortSheetOpen(false);
                }}
                className="flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition active:bg-field"
              >
                <span className={active ? "font-bold text-brand" : "text-ink"}>
                  {opt.label}
                </span>
                {active && <Check size={17} className="text-brand" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
