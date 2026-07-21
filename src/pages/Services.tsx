import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Coins,
  ListChecks,
  MessageCircle,
  MessagesSquare,
  Search,
  SearchX,
  Sparkles,
} from "lucide-react";
import AdBanner from "../components/AdBanner";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import VendorCard from "../components/VendorCard";
import { categoryIcon } from "../components/VendorThumb";
import { SERVICES_PROMO_AD } from "../data/ads";
import { topRatedVendors } from "../data/vendors";
import { VENDOR_CATEGORIES } from "../types";

// 검색어 정규화 — 공백/대소문자 무시 contains 매칭에 사용
function normalize(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

const QUICK_ACTIONS = [
  {
    label: "AI 드레스 합성",
    sub: "내 사진에 드레스를 입혀보기",
    to: "/ai/dress",
    Icon: Sparkles,
  },
  {
    label: "AI 웨딩홀 합성",
    sub: "우리 부부가 이 홀에 선다면",
    to: "/ai/hall",
    Icon: Building2,
  },
  {
    label: "웨딩 체크리스트",
    sub: "결혼 준비, 순서대로 착착",
    to: "/checklist",
    Icon: ListChecks,
  },
  {
    label: "AI 플래너 상담",
    sub: "무엇이든 대화로 물어보기",
    to: "/chat",
    Icon: MessageCircle,
  },
] as const;

const MORE_SERVICES = [
  {
    label: "커뮤니티 후기 모아보기",
    sub: "선배 신부들의 생생한 업체 후기",
    to: "/community",
    Icon: MessagesSquare,
  },
  {
    label: "AI 플래너 무료 상담",
    sub: "예산부터 일정까지 24시간 응답",
    to: "/chat",
    Icon: Sparkles,
  },
  {
    label: "포인트 · AI 패스 확인",
    sub: "보유 포인트와 구독 상태 보기",
    to: "/my",
    Icon: Coins,
  },
] as const;

// 섹션 순차 등장 딜레이 (CSS 애니메이션 — rAF가 멈춰도 콘텐츠는 항상 보임)
const stagger = (step: number) => ({ animationDelay: `${step * 60}ms` });

export default function Services() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const normalizedQuery = normalize(query);
  const isSearching = normalizedQuery.length > 0;

  const filteredQuickActions = useMemo(
    () =>
      isSearching
        ? QUICK_ACTIONS.filter((action) =>
            normalize(action.label).includes(normalizedQuery),
          )
        : QUICK_ACTIONS,
    [isSearching, normalizedQuery],
  );

  const filteredCategories = useMemo(
    () =>
      isSearching
        ? VENDOR_CATEGORIES.filter((cat) =>
            normalize(cat).includes(normalizedQuery),
          )
        : VENDOR_CATEGORIES,
    [isSearching, normalizedQuery],
  );

  const popularVendors = useMemo(() => topRatedVendors(6), []);

  return (
    <div className="min-h-dvh bg-page pb-24">
      <header className="anim-rise sticky top-0 z-30 border-b border-line bg-white/95 px-5 pb-3 pt-4 backdrop-blur">
        <h1 className="text-[20px] font-extrabold">전체서비스</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-field px-3.5 py-2.5">
          <Search size={17} className="shrink-0 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카테고리, AI 합성, 체크리스트 검색"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
          />
        </div>
      </header>

      {/* 빠른 액션 */}
      {filteredQuickActions.length > 0 && (
        <section className="anim-rise mt-6 px-5" style={stagger(0)}>
          <div className="grid grid-cols-2 gap-2.5">
            {filteredQuickActions.map(({ label, sub, to, Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="flex flex-col items-start gap-2.5 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.98] active:bg-black/[0.02]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tint text-brand">
                  <Icon size={19} strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold leading-tight">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-tight text-sub">
                    {sub}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 프로모 배너 */}
      <section className="anim-rise mt-6 px-5" style={stagger(1)}>
        <AdBanner ad={SERVICES_PROMO_AD} heightClass="h-[120px]" />
      </section>

      {/* 카테고리별 업체 */}
      <section className="anim-rise mt-7 px-5" style={stagger(2)}>
        <h2 className="text-[16px] font-bold">카테고리별 업체</h2>
        <p className="mt-0.5 text-[12px] text-sub">
          정찰제 업체를 카테고리로 둘러보세요
        </p>

        {filteredCategories.length > 0 ? (
          <div className="mt-3.5 grid grid-cols-4 gap-x-2 gap-y-4">
            {filteredCategories.map((cat) => {
              const Icon = categoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    navigate(`/vendors/${encodeURIComponent(cat)}`)
                  }
                  className="flex flex-col items-center gap-1.5 text-center transition active:scale-95"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-brand">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="px-0.5 text-[11.5px] font-medium leading-tight text-ink">
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3.5 flex flex-col items-center gap-2 rounded-2xl border border-line bg-white py-10">
            <SearchX size={26} strokeWidth={1.6} className="text-faint" />
            <p className="text-[13px] font-semibold text-ink">
              일치하는 카테고리가 없어요
            </p>
            <p className="text-[12px] text-faint">
              다른 검색어로 시도해보세요
            </p>
          </div>
        )}
      </section>

      {/* 이런 것도 있어요 */}
      <section className="anim-rise mt-7 px-5" style={stagger(3)}>
        <h2 className="text-[16px] font-bold">이런 것도 있어요</h2>
        <div className="mt-3.5 flex flex-col gap-2.5">
          {MORE_SERVICES.map(({ label, sub, to, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(to)}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
                <Icon size={19} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold">{label}</span>
                <span className="mt-0.5 block text-[12px] text-sub">
                  {sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 인기 업체 */}
      <section className="anim-rise mt-7 px-5" style={stagger(4)}>
        <h2 className="text-[16px] font-bold">인기 업체</h2>
        <p className="mt-0.5 text-[12px] text-sub">
          평점과 후기가 가장 좋은 업체예요
        </p>
        <div className="mt-3.5 flex flex-col gap-2.5">
          {popularVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              showTags
              onClick={() =>
                navigate(`/vendors/${encodeURIComponent(vendor.category)}`)
              }
            />
          ))}
        </div>
      </section>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}
