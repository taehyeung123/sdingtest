import { useMemo, useRef, useState, type UIEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  CalendarHeart,
  ChevronRight,
  Coins,
  Eye,
  Flame,
  Heart,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Store,
  Users,
} from "lucide-react";
import Logo from "../components/Logo";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import AdBannerView from "../components/AdBanner";
import AdNativeCard from "../components/AdNativeCard";
import RegionChips from "../components/RegionChips";
import VendorThumb, { categoryIcon } from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import {
  PARTNER_NAME,
  USER_NAME,
  daysUntilWedding,
  formatDday,
  nextTodos,
  progressPercent,
} from "../lib/wedding";
import { VENDORS, filterVendors, topRatedVendors, vendorById } from "../data/vendors";
import { HOME_HERO_ADS, feedAdForIndex } from "../data/ads";
import type { CommunityPost, Region, VendorSummary } from "../types";
import { VENDOR_CATEGORIES } from "../types";

// 섹션 순차 등장 딜레이 (CSS 애니메이션 — rAF가 멈춰도 콘텐츠는 항상 보임)
const stagger = (step: number) => ({ animationDelay: `${step * 60}ms` });

// 빠른 카테고리 — 앞쪽 7개 + "전체" 타일
const QUICK_CATEGORIES = VENDOR_CATEGORIES.slice(0, 7);

// 소셜 프루프 배너 숫자 — 매달 대략적으로 그럴듯한 값(마케팅 배너, 실측 데이터 아님).
// 등록 업체 수·누적 후기 수는 실제 mock 데이터에서 집계한 값을 그대로 쓴다.
const COUPLES_THIS_MONTH = 1842;
const TOTAL_REVIEWS = VENDORS.reduce((sum, v) => sum + v.reviewCount, 0);

const AI_SUGGESTED_QUESTIONS = [
  "오늘 뭐부터 시작하면 좋을까?",
  "웨딩홀 추천해줘",
  "예산 어떻게 짜야 해?",
] as const;

// 에디터 픽 — 홈 전용 큐레이션 컬렉션(실제 MD 큐레이션이 아닌 mock 데이터 기반 자체 구성)
interface Collection {
  id: string;
  label: string;
  note: string;
  vendors: VendorSummary[];
}

// 가로 스크롤용 컴팩트 업체 카드 — 이미지 위 평점 배지 + 이름 + 보조정보 + 가격 순으로
// 위계를 정리해 한눈에 훑을 수 있게 한다. 홈 전역(지역/에디터픽/인기/최근본) 공용.
function CompactVendorCard({
  vendor,
  onClick,
  showRegion,
}: {
  vendor: VendorSummary;
  onClick: () => void;
  showRegion?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[136px] shrink-0 snap-start rounded-2xl border border-line bg-white p-2.5 text-left transition active:scale-[0.98] active:bg-black/[0.02]"
    >
      <div className="relative">
        <VendorThumb
          category={vendor.category}
          thumbnailUrl={vendor.thumbnailUrl}
          className="h-[112px] w-full rounded-xl"
          iconSize={26}
        />
        <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-[3px] text-[10px] font-bold text-white backdrop-blur-sm">
          <Star size={9} className="fill-[#FFC107] text-[#FFC107]" />
          {vendor.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 truncate text-[13px] font-bold leading-tight">{vendor.name}</p>
      <div className="mt-1 flex items-center gap-0.5 text-[11px] text-faint">
        {showRegion ? (
          <>
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{vendor.region}</span>
          </>
        ) : (
          <span className="truncate">후기 {vendor.reviewCount}개</span>
        )}
      </div>
      <p className="mt-1 truncate text-[12.5px] font-extrabold text-ink">
        {vendor.priceLabel}
      </p>
    </button>
  );
}

// 에디터 픽 컬렉션 한 줄 — 번호 + 짧은 큐레이션 카피 + 가로 스크롤 업체 카드
function CuratedCollectionRow({
  index,
  collection,
  onVendorClick,
}: {
  index: number;
  collection: Collection;
  onVendorClick: (vendor: VendorSummary) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5 px-5">
        <span className="text-[13px] font-extrabold text-faint">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="text-[14.5px] font-bold leading-tight">{collection.label}</h3>
          <p className="mt-0.5 truncate text-[12px] text-sub">{collection.note}</p>
        </div>
      </div>
      <div className="no-scrollbar mt-2.5 flex snap-x gap-2.5 overflow-x-auto px-5">
        {collection.vendors.map((vendor) => (
          <CompactVendorCard
            key={vendor.id}
            vendor={vendor}
            showRegion
            onClick={() => onVendorClick(vendor)}
          />
        ))}
      </div>
    </div>
  );
}

// 커뮤니티 미리보기 카드 — 좋아요/조회수/댓글수를 함께 노출해 정보 밀도를 높인다.
// 대표 사진이 있으면 작은 썸네일을 함께 붙여 텍스트만 나열되는 느낌을 덜어낸다.
function CommunityPreviewCard({
  post,
  emphasize,
}: {
  post: CommunityPost;
  emphasize: "like" | "view";
}) {
  const thumbnail = post.imageUrls[0];
  return (
    <Link
      to={`/community/${post.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition active:scale-[0.99] active:bg-black/[0.02]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
            {post.category}
          </span>
          {post.region && (
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-faint">
              <MapPin size={10} />
              {post.region}
            </span>
          )}
          <span className="ml-auto truncate text-[11px] text-faint">
            {post.authorBadge}
          </span>
        </div>
        <p className="mt-1.5 truncate text-[14px] font-bold">{post.title}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[12px] text-sub">
          <span
            className={`flex items-center gap-1 ${emphasize === "like" ? "font-bold text-brand" : ""}`}
          >
            <Heart
              size={12}
              className={emphasize === "like" ? "fill-brand text-brand" : ""}
            />
            {post.likeCount}
          </span>
          <span
            className={`flex items-center gap-1 ${emphasize === "view" ? "font-bold text-brand" : ""}`}
          >
            <Eye size={12} />
            {post.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {post.comments.length}
          </span>
        </div>
      </div>
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      )}
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    summary,
    points,
    aiPass,
    showToast,
    communityPosts,
    items,
    recentlyViewedVendorIds,
  } = useApp();

  const dday = formatDday(daysUntilWedding());
  const percent = progressPercent(summary);
  const nextTodo = nextTodos(items, 1)[0];
  const popularVendors = topRatedVendors(8);

  const goVendor = (vendor: VendorSummary) =>
    navigate(`/vendors/${encodeURIComponent(vendor.category)}/${vendor.id}`);

  // 히어로 배너 캐러셀 스크롤 위치 → 하단 인디케이터 점
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const handleHeroScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const children = Array.from(el.children) as HTMLElement[];
    let closest = 0;
    let minDiff = Infinity;
    children.forEach((child, i) => {
      const diff = Math.abs(child.offsetLeft - el.scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    setHeroIndex(closest);
  };

  // 지역 선택 + 지역별 추천 업체
  const [homeRegion, setHomeRegion] = useState<Region | null>("서울");
  const regionVendors = useMemo(
    () =>
      filterVendors({ region: homeRegion ?? undefined, sort: "rating" }).slice(
        0,
        10,
      ),
    [homeRegion],
  );

  // 에디터 픽 — 짧은 큐레이션 카피와 함께 묶은 3개 컬렉션(실제 편집샵의 "이번 주 추천" 형태를 참고)
  const curatedCollections = useMemo<Collection[]>(
    () => [
      {
        id: "col-studio",
        label: "가성비 좋은 스튜디오",
        note: "합리적인 가격, 완성도는 타협 없이",
        vendors: filterVendors({ category: "스튜디오", sort: "priceAsc" }).slice(0, 4),
      },
      {
        id: "col-hall",
        label: "청담 인기 웨딩홀",
        note: "예비부부 문의가 가장 많이 몰린 곳",
        vendors: filterVendors({ category: "웨딩홀", region: "서울", sort: "rating" }).slice(
          0,
          4,
        ),
      },
      {
        id: "col-hm",
        label: "예약 몰리는 헤어&메이크업",
        note: "후기로 검증된 물오른 실력파",
        vendors: filterVendors({ category: "헤어&메이크업", sort: "reviews" }).slice(0, 4),
      },
    ],
    [],
  );

  // 커뮤니티 하이라이트 — 인기글(좋아요순) / 지금 화제(조회수순)
  const popularPosts = useMemo(
    () => [...communityPosts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3),
    [communityPosts],
  );
  const trendingPosts = useMemo(
    () => [...communityPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3),
    [communityPosts],
  );

  // 최근 본 업체
  const recentVendors = recentlyViewedVendorIds
    .map((id) => vendorById(id))
    .filter((v): v is VendorSummary => Boolean(v));

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

        {/* 검색바 */}
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="mt-3 flex h-11 w-full items-center gap-2 rounded-xl bg-field px-3.5 text-left transition active:scale-[0.99]"
        >
          <Search size={17} className="text-faint" strokeWidth={2} />
          <span className="text-[13px] text-faint">무엇을 찾고 계세요?</span>
        </button>
      </header>

      {/* 2. 히어로 배너 캐러셀 */}
      <section className="anim-rise mt-4" style={stagger(1)}>
        <div
          ref={heroScrollRef}
          onScroll={handleHeroScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5"
        >
          {HOME_HERO_ADS.map((ad) => (
            <div key={ad.id} className="w-[86%] shrink-0 snap-start">
              <AdBannerView ad={ad} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">
          {HOME_HERO_ADS.map((ad, i) => (
            <span
              key={ad.id}
              className={`h-1.5 rounded-full transition-all ${
                i === heroIndex ? "w-4 bg-brand" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 3. D-day 히어로 카드 + 준비율 + 다음 할 일 */}
      <section className="anim-rise mt-5 px-5" style={stagger(2)}>
        <Link
          to="/planner"
          className="relative block overflow-hidden rounded-2xl bg-ink p-5 text-white transition active:scale-[0.99]"
        >
          <CalendarHeart
            size={104}
            strokeWidth={1.4}
            className="absolute -right-5 -bottom-8 text-white/[0.07]"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white/70">
                {USER_NAME}
                <Heart size={12} className="text-brand" fill="currentColor" />
                {PARTNER_NAME}
              </p>
              <p className="mt-1 text-[30px] font-extrabold leading-none tracking-tight text-brand">
                {dday}
              </p>
            </div>
            <span className="mt-0.5 flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/85">
              준비율 {percent}%
              <ChevronRight size={13} />
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          {nextTodo && (
            <div className="relative mt-4 flex items-center gap-1.5 border-t border-white/10 pt-3.5">
              <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/80">
                다음 할 일
              </span>
              <span className="truncate text-[12.5px] font-semibold text-white/95">
                {nextTodo.title}
              </span>
            </div>
          )}
        </Link>
      </section>

      {/* 4. 지역 선택 + 지역별 추천 업체 */}
      <section className="anim-rise mt-8" style={stagger(3)}>
        <div className="px-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand/70">
            Local Pick
          </p>
          <h2 className="mt-0.5 text-[17px] font-extrabold tracking-tight">
            우리 동네 인기 업체
          </h2>
          <p className="mt-1 text-[12.5px] text-sub">
            {homeRegion ?? "전국"} 기준 평점 높은 업체예요
          </p>
        </div>
        <div className="mt-3.5 px-5">
          <RegionChips value={homeRegion} onChange={setHomeRegion} />
        </div>
        <div className="no-scrollbar mt-3 flex snap-x gap-2.5 overflow-x-auto px-5">
          {regionVendors.map((vendor) => (
            <CompactVendorCard
              key={vendor.id}
              vendor={vendor}
              showRegion={!homeRegion}
              onClick={() => goVendor(vendor)}
            />
          ))}
          {regionVendors.length === 0 && (
            <p className="px-1 py-4 text-[13px] text-faint">
              이 지역에는 아직 등록된 업체가 없어요
            </p>
          )}
        </div>
      </section>

      {/* 5. 빠른 카테고리 */}
      <section className="anim-rise mt-7 px-5" style={stagger(4)}>
        <h2 className="text-[17px] font-extrabold tracking-tight">업체 카테고리</h2>
        <div className="mt-3.5 grid grid-cols-4 gap-y-4">
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

      {/* 6. 소셜 프루프 배너 */}
      <section className="anim-rise mt-7 px-5" style={stagger(5)}>
        <div className="rounded-2xl bg-ink p-4 text-white">
          <p className="text-[14px] font-bold leading-snug">
            이번 달{" "}
            <span className="text-brand">
              {COUPLES_THIS_MONTH.toLocaleString()}쌍
            </span>
            이 스딩과 함께 결혼을 준비하고 있어요
          </p>
          <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-white/10 pt-3.5">
            <div className="flex flex-col items-center gap-1">
              <Store size={16} className="text-white/60" strokeWidth={1.8} />
              <p className="text-[13px] font-bold">{VENDORS.length}곳</p>
              <p className="text-[10.5px] text-white/55">등록 업체</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star size={16} className="text-white/60" strokeWidth={1.8} />
              <p className="text-[13px] font-bold">
                {TOTAL_REVIEWS.toLocaleString()}+
              </p>
              <p className="text-[10.5px] text-white/55">누적 후기</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users size={16} className="text-white/60" strokeWidth={1.8} />
              <p className="text-[13px] font-bold">8,600명</p>
              <p className="text-[10.5px] text-white/55">커뮤니티 회원</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 에디터 픽 — 짧은 큐레이션 카피가 붙은 컬렉션 3종 */}
      <section className="anim-rise mt-9 border-t border-line pt-7" style={stagger(6)}>
        <div className="px-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand/70">
            Editor&apos;s Pick
          </p>
          <h2 className="mt-0.5 text-[17px] font-extrabold tracking-tight">
            이번 주 추천 컬렉션
          </h2>
          <p className="mt-1 text-[12.5px] text-sub">
            스딩이 엄선한 업체를 모았어요 (자체 큐레이션)
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-6">
          {curatedCollections.map((col, i) => (
            <CuratedCollectionRow
              key={col.id}
              index={i + 1}
              collection={col}
              onVendorClick={goVendor}
            />
          ))}
        </div>
      </section>

      {/* 8. AI 플래너 카드 */}
      <section className="anim-rise mt-9 border-t border-line px-5 pt-7" style={stagger(7)}>
        <div className="rounded-2xl bg-tint p-4">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="flex w-full items-center gap-3 text-left transition active:scale-[0.99]"
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
          <div className="mt-3 flex flex-wrap gap-1.5">
            {AI_SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => navigate("/chat", { state: { ask: q } })}
                className="rounded-full border border-brand/25 bg-white px-3 py-1.5 text-[12px] font-medium transition active:bg-brand/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 네이티브 광고 */}
      <section className="anim-rise mt-6 px-5" style={stagger(8)}>
        <AdNativeCard ad={feedAdForIndex(0)} />
      </section>

      {/* 10. 이번 주 인기 업체 */}
      <section className="anim-rise mt-7" style={stagger(9)}>
        <div className="px-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand/70">
            Trend
          </p>
          <h2 className="mt-0.5 text-[17px] font-extrabold tracking-tight">
            이번 주 인기 업체
          </h2>
          <p className="mt-1 text-[12.5px] text-sub">
            지금 가장 많이 찾아보는 업체예요
          </p>
        </div>
        <div className="no-scrollbar mt-3.5 flex snap-x gap-2.5 overflow-x-auto px-5">
          {popularVendors.map((vendor) => (
            <CompactVendorCard key={vendor.id} vendor={vendor} onClick={() => goVendor(vendor)} />
          ))}
        </div>
      </section>

      {/* 11. 예비부부들의 생생한 후기 */}
      <section className="anim-rise mt-9 border-t border-line px-5 pt-7" style={stagger(10)}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand/70">
              Community
            </p>
            <h2 className="mt-0.5 text-[17px] font-extrabold tracking-tight">
              예비부부들의 생생한 후기
            </h2>
          </div>
          <Link
            to="/community"
            className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-sub"
          >
            더보기
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mt-4">
          <p className="flex items-center gap-1 text-[12px] font-bold text-sub">
            <Heart size={12} className="text-faint" />
            인기글
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {popularPosts.map((post) => (
              <CommunityPreviewCard key={post.id} post={post} emphasize="like" />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="flex items-center gap-1 text-[12px] font-bold text-sub">
            <Flame size={12} className="text-brand" />
            지금 화제
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {trendingPosts.map((post) => (
              <CommunityPreviewCard key={post.id} post={post} emphasize="view" />
            ))}
          </div>
        </div>
      </section>

      {/* 12. 최근 본 업체 — 없으면 섹션 자체를 숨김 */}
      {recentVendors.length > 0 && (
        <section className="anim-rise mt-7" style={stagger(11)}>
          <div className="px-5">
            <h2 className="text-[17px] font-extrabold tracking-tight">최근 본 업체</h2>
          </div>
          <div className="no-scrollbar mt-3.5 flex snap-x gap-2.5 overflow-x-auto px-5">
            {recentVendors.map((vendor) => (
              <CompactVendorCard
                key={vendor.id}
                vendor={vendor}
                showRegion
                onClick={() => goVendor(vendor)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 13. 네이티브 광고 */}
      <section className="anim-rise mt-7 px-5" style={stagger(12)}>
        <AdNativeCard ad={feedAdForIndex(2)} />
      </section>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}
