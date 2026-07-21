import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Coins,
  LayoutGrid,
  MessageCircle,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import Logo from "../components/Logo";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import AdBannerView from "../components/AdBanner";
import AdNativeCard from "../components/AdNativeCard";
import VendorThumb, { categoryIcon } from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import {
  PARTNER_NAME,
  USER_NAME,
  daysUntilWedding,
  formatDday,
  progressPercent,
} from "../lib/wedding";
import { topRatedVendors } from "../data/vendors";
import { HOME_HERO_ADS, feedAdForIndex } from "../data/ads";
import type { VendorSummary } from "../types";
import { VENDOR_CATEGORIES } from "../types";

// 섹션 순차 등장 딜레이 (CSS 애니메이션 — rAF가 멈춰도 콘텐츠는 항상 보임)
const stagger = (step: number) => ({ animationDelay: `${step * 60}ms` });

// 빠른 카테고리 — 앞쪽 7개 + "전체" 타일
const QUICK_CATEGORIES = VENDOR_CATEGORIES.slice(0, 7);

// 가로 스크롤용 컴팩트 업체 카드 (VendorCard는 세로 리스트형이라 이번 섹션엔 안 맞음)
function CompactVendorCard({
  vendor,
  onClick,
}: {
  vendor: VendorSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[132px] shrink-0 snap-start rounded-2xl border border-line bg-white p-2.5 text-left transition active:scale-[0.98] active:bg-black/[0.02]"
    >
      <VendorThumb
        category={vendor.category}
        thumbnailUrl={vendor.thumbnailUrl}
        className="h-[110px] w-full rounded-xl"
        iconSize={26}
      />
      <p className="mt-2 truncate text-[13px] font-bold">{vendor.name}</p>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-sub">
        <Star size={11} className="fill-[#FFC107] text-[#FFC107]" />
        <span className="font-semibold text-ink">{vendor.rating.toFixed(1)}</span>
        <span>· {vendor.reviewCount}</span>
      </div>
      <p className="mt-0.5 truncate text-[12px] font-extrabold text-ink">
        {vendor.priceLabel}
      </p>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { summary, points, aiPass, showToast, communityPosts } = useApp();

  const dday = formatDday(daysUntilWedding());
  const percent = progressPercent(summary);
  const vendors = topRatedVendors(6);
  const topPosts = [...communityPosts]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

  return (
    <div className="min-h-dvh bg-page pb-24">
      {/* 1. 헤더 */}
      <header className="anim-rise bg-white px-5 pt-4 pb-3" style={stagger(0)}>
        <div className="flex items-center justify-between">
          <Logo className="h-[20px]" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                showToast(
                  aiPass
                    ? "AI 패스 구독 중 — AI 합성이 무제한이에요"
                    : "AI 합성에 쓰는 포인트예요. 가입 축하로 3,000P를 드렸어요",
                )
              }
              className="flex items-center gap-1 rounded-full bg-tint px-2.5 py-1.5 text-[12px] font-bold text-brand transition active:scale-95"
            >
              {aiPass ? <BadgeCheck size={13} /> : <Coins size={13} />}
              {aiPass ? "AI 패스" : `${points.toLocaleString()}P`}
            </button>
            <button
              type="button"
              aria-label="알림"
              onClick={() => showToast("알림은 베타에서 준비 중이에요")}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-95"
            >
              <Bell size={21} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        {/* 2. 검색바 */}
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="mt-3 flex h-11 w-full items-center gap-2 rounded-xl bg-field px-3.5 text-left transition active:scale-[0.99]"
        >
          <Search size={17} className="text-faint" strokeWidth={2} />
          <span className="text-[13px] text-faint">무엇을 찾고 계세요?</span>
        </button>
      </header>

      {/* 3. 히어로 배너 캐러셀 */}
      <section className="anim-rise mt-4" style={stagger(1)}>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5">
          {HOME_HERO_ADS.map((ad) => (
            <div key={ad.id} className="w-[86%] shrink-0 snap-start">
              <AdBannerView ad={ad} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. D-day 미니 카드 */}
      <section className="anim-rise mt-4 px-5" style={stagger(2)}>
        <Link
          to="/planner"
          className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5 transition active:scale-[0.99] active:bg-black/[0.02]"
        >
          <p className="text-[13px] text-sub">
            <span className="font-bold text-ink">
              {USER_NAME} · {PARTNER_NAME}
            </span>
            <span className="mx-1.5 font-extrabold text-brand">{dday}</span>
            · 준비율{" "}
            <span className="font-bold text-ink">{percent}%</span>
          </p>
          <ChevronRight size={17} className="shrink-0 text-faint" />
        </Link>
      </section>

      {/* 5. 빠른 카테고리 */}
      <section className="anim-rise mt-6 px-5" style={stagger(3)}>
        <h2 className="text-[16px] font-bold">업체 카테고리</h2>
        <div className="mt-3 grid grid-cols-4 gap-y-4">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = categoryIcon(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => navigate(`/vendors/${encodeURIComponent(cat)}`)}
                className="flex flex-col items-center gap-1.5 transition active:scale-95"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-brand/70">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="text-[11px] font-medium text-sub">{cat}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="flex flex-col items-center gap-1.5 transition active:scale-95"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-field text-ink">
              <LayoutGrid size={22} strokeWidth={1.8} />
            </span>
            <span className="text-[11px] font-medium text-sub">전체</span>
          </button>
        </div>
      </section>

      {/* 6. AI 플래너 카드 */}
      <section className="anim-rise mt-6 px-5" style={stagger(4)}>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="flex w-full items-center gap-3 rounded-2xl bg-tint p-4 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <Sparkles size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">AI 플래너에게 물어보기</p>
            <p className="mt-0.5 truncate text-[12px] text-sub">
              업체 추천부터 일정 관리까지, 대화로 한 번에
            </p>
          </div>
          <MessageCircle size={18} className="shrink-0 text-brand" />
        </button>
      </section>

      {/* 7. 네이티브 광고 */}
      <section className="anim-rise mt-6 px-5" style={stagger(5)}>
        <AdNativeCard ad={feedAdForIndex(0)} />
      </section>

      {/* 8. 이번 주 인기 업체 */}
      <section className="anim-rise mt-6" style={stagger(6)}>
        <div className="mb-3 flex items-center justify-between px-5">
          <h2 className="text-[16px] font-bold">이번 주 인기 업체</h2>
        </div>
        <div className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto px-5">
          {vendors.map((vendor) => (
            <CompactVendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() =>
                navigate(`/vendors/${encodeURIComponent(vendor.category)}`)
              }
            />
          ))}
        </div>
      </section>

      {/* 9. 예비부부들의 생생한 후기 */}
      <section className="anim-rise mt-6 px-5" style={stagger(7)}>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold">예비부부들의 생생한 후기</h2>
          <Link
            to="/community"
            className="flex items-center gap-0.5 text-[13px] font-medium text-sub"
          >
            커뮤니티 더보기
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {topPosts.map((post) => (
            <Link
              key={post.id}
              to={`/community/${post.id}`}
              className="block rounded-2xl border border-line bg-white p-3.5 transition active:scale-[0.99] active:bg-black/[0.02]"
            >
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
                  {post.category}
                </span>
                <span className="truncate text-[11px] text-faint">
                  {post.authorBadge}
                </span>
              </div>
              <p className="mt-1.5 truncate text-[14px] font-bold">
                {post.title}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[12px] text-sub">
                <Star size={12} className="fill-brand text-brand" />
                <span className="font-semibold text-ink">
                  좋아요 {post.likeCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. 네이티브 광고 */}
      <section className="anim-rise mt-6 px-5" style={stagger(8)}>
        <AdNativeCard ad={feedAdForIndex(1)} />
      </section>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}
