import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import PageHeader from "../components/PageHeader";
import VendorCard from "../components/VendorCard";
import { vendorsByCategory } from "../data/vendors";
import { useApp } from "../store/AppContext";
import type { VendorCategory, VendorSummary } from "../types";

// 런타임 카테고리 검증용 (types.ts의 VendorCategory 14종과 동일)
const CATEGORIES: VendorCategory[] = [
  "웨딩홀",
  "스튜디오",
  "드레스",
  "헤어&메이크업",
  "헤어변형",
  "본식스냅",
  "스냅(데이트·가봉·아이폰)",
  "영상(DVD촬영)",
  "예물",
  "예복",
  "한복",
  "부케",
  "청첩장",
  "사회자",
];

export default function VendorBrowse() {
  const { category: rawCategory } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, showToast } = useApp();

  let decoded = rawCategory ?? "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // 잘못된 인코딩이면 원본 그대로 사용
  }
  const category = CATEGORIES.find((c) => c === decoded);
  const vendors = category ? vendorsByCategory(category) : [];

  const handleSelect = (vendor: VendorSummary) => {
    const queryItemId = searchParams.get("item");
    const targetId =
      queryItemId ?? items.find((it) => it.category === category)?.id;
    if (!targetId) {
      showToast("연결된 체크리스트 항목이 없어요");
      return;
    }
    navigate(`/checklist/${targetId}/register?vendorId=${vendor.id}`);
  };

  return (
    <div className="min-h-dvh bg-page pb-10">
      <PageHeader
        title={category ?? (decoded || "업체 보러가기")}
        onBack={() => navigate(-1)}
      />

      {category ? (
        <>
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <p className="text-[13px] text-sub">
              스딩 등록 업체 · 모두 정찰제 가격이에요
            </p>
            <span className="shrink-0 text-[13px] font-bold text-ink">
              {vendors.length}곳
            </span>
          </div>

          <div className="flex flex-col gap-3 px-5">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                showTags
                onClick={() => handleSelect(vendor)}
              />
            ))}
          </div>

          <p className="pb-2 pt-6 text-center text-[12px] text-faint">
            베타에서는 업체 상세 대신 목록까지만 제공해요
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
    </div>
  );
}
