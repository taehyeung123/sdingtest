import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Bell,
  Building2,
  CalendarCheck,
  ChevronRight,
  Coins,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareHeart,
  Pencil,
  RotateCcw,
  Settings2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import ProgressRing from "../components/ProgressRing";
import StatusBadge from "../components/StatusBadge";
import VendorThumb, { categoryIcon } from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { MY_NICKNAME } from "../data/community";
import { vendorById } from "../data/vendors";
import type { VendorSummary } from "../types";
import {
  PARTNER_NAME,
  USER_NAME,
  daysUntilWedding,
  formatDday,
  formatWeddingDate,
  progressPercent,
} from "../lib/wedding";

// 섹션 순차 등장 딜레이 (CSS 애니메이션 — rAF가 멈춰도 콘텐츠는 항상 보임)
const stagger = (step: number) => ({ animationDelay: `${step * 60}ms` });

// "2026-07-25" / "14:00" → "7/25 14:00"
function slotLabel(slot: { date: string; time: string }): string {
  const [, m, d] = slot.date.split("-");
  return `${Number(m)}/${Number(d)} ${slot.time}`;
}

// ISO → "7/22"
function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getMonth() + 1}/${d.getDate()}`;
}

// 웨딩 준비 진행률에 따른 등급 뱃지 (게이미피케이션)
function prepLevel(percent: number): { label: string; className: string } {
  if (percent >= 100) {
    return { label: "준비 완료", className: "bg-success/10 text-success" };
  }
  if (percent >= 70) {
    return { label: "막바지", className: "bg-brand/10 text-brand" };
  }
  if (percent >= 30) {
    return { label: "준비중", className: "bg-consult/10 text-consult" };
  }
  return { label: "시작 단계", className: "bg-field text-sub" };
}

type ArchiveTab = "fav" | "recent" | "scrap";

export default function MyPage() {
  const navigate = useNavigate();
  const {
    items,
    summary,
    points,
    aiPass,
    communityPosts,
    showToast,
    resetAll,
    favoriteVendorIds,
    recentlyViewedVendorIds,
    scrappedPostIds,
    consultations,
    orders,
  } = useApp();
  const [notifyOn, setNotifyOn] = useState(true);
  const [archiveTab, setArchiveTab] = useState<ArchiveTab>("fav");

  const dday = formatDday(daysUntilWedding());
  const percent = progressPercent(summary);
  const level = prepLevel(percent);

  const registeredVendors = useMemo(
    () => items.filter((it) => it.vendor?.vendorName),
    [items],
  );

  const myPosts = useMemo(
    () =>
      communityPosts
        .filter((p) => p.author === MY_NICKNAME)
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [communityPosts],
  );

  // 활동 통계: 글 수 / 댓글 수 / 받은 좋아요 / 찜한 업체
  const stats = useMemo(() => {
    const postCount = myPosts.length;
    const likesReceived = myPosts.reduce((acc, p) => acc + p.likeCount, 0);
    const commentCount = communityPosts.reduce(
      (acc, p) =>
        acc + p.comments.filter((c) => c.author === MY_NICKNAME).length,
      0,
    );
    return {
      postCount,
      commentCount,
      likesReceived,
      favoriteCount: favoriteVendorIds.length,
    };
  }, [myPosts, communityPosts, favoriteVendorIds.length]);

  const favoriteVendors = useMemo(
    () =>
      favoriteVendorIds
        .map((id) => vendorById(id))
        .filter((v): v is VendorSummary => Boolean(v)),
    [favoriteVendorIds],
  );

  const recentlyViewedVendors = useMemo(
    () =>
      recentlyViewedVendorIds
        .map((id) => vendorById(id))
        .filter((v): v is VendorSummary => Boolean(v)),
    [recentlyViewedVendorIds],
  );

  const scrappedPosts = useMemo(
    () =>
      communityPosts
        .filter((p) => scrappedPostIds.includes(p.id))
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [communityPosts, scrappedPostIds],
  );

  const goVendor = (vendor: VendorSummary) =>
    navigate(`/vendors/${encodeURIComponent(vendor.category)}/${vendor.id}`);

  const ARCHIVE_TABS: { key: ArchiveTab; label: string; count: number }[] = [
    { key: "fav", label: "찜한 업체", count: favoriteVendors.length },
    { key: "recent", label: "최근 본 업체", count: recentlyViewedVendors.length },
    { key: "scrap", label: "스크랩한 글", count: scrappedPosts.length },
  ];

  return (
    <div className="min-h-dvh bg-page pb-24">
      {/* 1. 프로필 히어로 — 헤더 텍스트/프로필/통계를 하나의 다크 카드로 통합 */}
      <section className="anim-rise px-5 pt-5" style={stagger(0)}>
        <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white">
          <Heart
            size={108}
            strokeWidth={1.4}
            fill="currentColor"
            className="pointer-events-none absolute -right-5 -top-7 text-white/[0.06]"
          />

          <button
            type="button"
            aria-label="프로필 수정"
            onClick={() => showToast("프로필 수정은 베타에서 준비 중이에요")}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition active:scale-95"
          >
            <Pencil size={14} />
          </button>

          <p className="relative text-[12px] font-semibold text-white/45">
            마이페이지
          </p>

          <div className="relative mt-2.5 flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[20px] font-extrabold text-brand ring-4 ring-white/10">
              {USER_NAME.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 pr-6">
              <p className="truncate text-[16px] font-bold">
                {USER_NAME} · {PARTNER_NAME} 예비부부
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {dday}
                </span>
                <span className="text-[12px] text-white/55">
                  {formatWeddingDate()}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-4 divide-x divide-white/[0.12] border-t border-white/[0.12] pt-3.5">
            <HeroStat label="글" value={stats.postCount} />
            <HeroStat label="댓글" value={stats.commentCount} />
            <HeroStat label="받은 좋아요" value={stats.likesReceived} />
            <HeroStat label="찜한 업체" value={stats.favoriteCount} />
          </div>
        </div>
      </section>

      <div className="mt-6 px-5">
        {/* 2. 웨딩 준비 현황 + 포인트/AI 패스 — 2분할 요약 카드 */}
        <section className="anim-rise grid grid-cols-2 gap-3" style={stagger(1)}>
          <button
            type="button"
            onClick={() => navigate("/planner")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-4 text-center transition active:scale-[0.99] active:bg-black/[0.02]"
          >
            <ProgressRing
              value={
                summary.totalCount > 0
                  ? summary.doneCount / summary.totalCount
                  : 0
              }
              size={64}
              stroke={7}
            >
              <span className="text-[14px] font-extrabold leading-none">
                {percent}%
              </span>
            </ProgressRing>
            <div>
              <span
                className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${level.className}`}
              >
                {level.label}
              </span>
              <p className="mt-1.5 text-[11.5px] text-sub">
                {summary.doneCount}/{summary.totalCount} 완료
              </p>
            </div>
          </button>

          <div className="flex flex-col rounded-2xl border border-line bg-white p-4">
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-sub">
              <Coins size={14} className="text-brand" />
              보유 포인트
            </span>
            <p className="mt-1.5 text-[19px] font-extrabold leading-none">
              {points.toLocaleString()}
              <span className="ml-0.5 text-[13px] font-bold text-sub">P</span>
            </p>
            <button
              type="button"
              onClick={() => showToast("포인트 내역은 베타에서 준비 중이에요")}
              className="mt-1.5 self-start text-[11px] font-medium text-faint underline underline-offset-2"
            >
              포인트 내역 보기
            </button>

            <div className="mt-auto pt-3">
              {aiPass ? (
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-tint px-3 py-2 text-[11.5px] font-bold text-brand">
                  <Sparkles size={13} />
                  AI 패스 구독중
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/ai/dress")}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[12.5px] font-bold text-white transition active:scale-[0.98]"
                >
                  <Sparkles size={13} />
                  AI 패스 구독
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. 보관함 — 찜한 업체 / 최근 본 업체 / 스크랩한 글을 세그먼트 탭으로 통합 */}
        <section className="anim-rise mt-6" style={stagger(2)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Archive size={16} className="text-brand" />
            보관함
          </h2>
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex gap-1 rounded-xl bg-field p-1">
              {ARCHIVE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setArchiveTab(tab.key)}
                  className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold transition ${
                    archiveTab === tab.key
                      ? "bg-white text-brand shadow-sm"
                      : "text-sub"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-1 text-[11px] font-medium ${
                        archiveTab === tab.key ? "text-brand/70" : "text-faint"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3.5">
              {archiveTab === "fav" &&
                (favoriteVendors.length > 0 ? (
                  <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                    {favoriteVendors.map((vendor) => (
                      <VendorTile
                        key={vendor.id}
                        vendor={vendor}
                        onClick={() => goVendor(vendor)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    text="아직 찜한 업체가 없어요"
                    ctaLabel="업체 둘러보기"
                    onClick={() => navigate("/services")}
                  />
                ))}

              {archiveTab === "recent" &&
                (recentlyViewedVendors.length > 0 ? (
                  <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                    {recentlyViewedVendors.map((vendor) => (
                      <VendorTile
                        key={vendor.id}
                        vendor={vendor}
                        onClick={() => goVendor(vendor)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    text="최근 본 업체가 없어요"
                    ctaLabel="업체 둘러보기"
                    onClick={() => navigate("/services")}
                  />
                ))}

              {archiveTab === "scrap" &&
                (scrappedPosts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {scrappedPosts.slice(0, 5).map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => navigate(`/community/${post.id}`)}
                        className="flex items-center gap-3 rounded-xl bg-field p-2.5 text-left transition active:bg-black/[0.03]"
                      >
                        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          {post.category}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">
                          {post.title}
                        </p>
                        <ChevronRight size={15} className="shrink-0 text-faint" />
                      </button>
                    ))}
                    {scrappedPosts.length > 5 && (
                      <button
                        type="button"
                        onClick={() => navigate("/community")}
                        className="pt-1 text-center text-[12px] font-medium text-sub"
                      >
                        스크랩 {scrappedPosts.length}개 전체보기
                      </button>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    text="아직 스크랩한 글이 없어요"
                    ctaLabel="커뮤니티 둘러보기"
                    onClick={() => navigate("/community")}
                  />
                ))}
            </div>
          </div>
        </section>

        {/* 3-1. 상담 예약 내역 (있을 때만) */}
        {consultations.length > 0 && (
          <section className="anim-rise mt-6" style={stagger(3)}>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
                  <CalendarCheck size={16} className="text-brand" />
                  상담 예약 내역
                </h2>
                <span className="text-[12px] font-medium text-faint">
                  {consultations.length}건
                </span>
              </div>
              <div className="divide-y divide-line">
                {consultations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/vendors/${encodeURIComponent(c.category)}/${c.vendorId}`,
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-black/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 truncate text-[14px] font-bold">
                          {c.vendorName}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            c.status === "확정"
                              ? "bg-success/10 text-success"
                              : "bg-consult/10 text-consult"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-sub">
                        희망 시간: {c.slots.map(slotLabel).join(" · ")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-faint">
                        {c.category} · {shortDate(c.createdAt)} 신청
                      </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-faint" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3-2. 결제 내역 (있을 때만) */}
        {orders.length > 0 && (
          <section className="anim-rise mt-6" style={stagger(4)}>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
                  <CreditCard size={16} className="text-brand" />
                  결제 내역
                </h2>
                <span className="text-[12px] font-medium text-faint">
                  {orders.length}건
                </span>
              </div>
              <div className="divide-y divide-line">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/vendors/${encodeURIComponent(o.category)}/${o.vendorId}`,
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-black/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-[14px] font-bold">
                          {o.productName}
                        </span>
                        <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-sub">
                        {o.vendorName}
                        {o.optionNames.length > 0 &&
                          ` · 옵션 ${o.optionNames.length}개`}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[11px] text-faint">
                          {shortDate(o.createdAt)} 결제
                        </span>
                        <span className="text-[14px] font-extrabold text-ink">
                          {o.totalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. 등록한 업체 */}
        <section className="anim-rise mt-6" style={stagger(5)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Building2 size={16} className="text-brand" />
            등록한 업체
            {registeredVendors.length > 0 && (
              <span className="text-[13px] font-medium text-faint">
                {registeredVendors.length}
              </span>
            )}
          </h2>
          {registeredVendors.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {registeredVendors.map((it) => {
                const Icon = it.category ? categoryIcon(it.category) : Building2;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => navigate(`/vendor-chat/${it.id}`)}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-faint">
                        {it.category}
                      </p>
                      <p className="mt-0.5 truncate text-[14px] font-bold">
                        {it.vendor?.vendorName}
                      </p>
                    </div>
                    {it.vendor && <StatusBadge status={it.vendor.status} />}
                    <ChevronRight size={16} className="shrink-0 text-faint" />
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              text="아직 등록한 업체가 없어요"
              ctaLabel="체크리스트에서 등록하기"
              onClick={() => navigate("/checklist")}
              framed
            />
          )}
        </section>

        {/* 5. 내 커뮤니티 활동 */}
        <section className="anim-rise mt-6" style={stagger(6)}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[16px] font-bold">
              <Users size={16} className="text-brand" />
              내 커뮤니티 활동
              {myPosts.length > 0 && (
                <span className="text-[13px] font-medium text-faint">
                  {myPosts.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="flex items-center gap-0.5 text-[12px] font-medium text-sub"
            >
              더보기
              <ChevronRight size={14} />
            </button>
          </div>

          {myPosts.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2.5">
              {myPosts.slice(0, 3).map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => navigate(`/community/${post.id}`)}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
                >
                  {post.imageUrls[0] ? (
                    <img
                      src={post.imageUrls[0]}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-field text-faint">
                      <ImageIcon size={18} strokeWidth={1.7} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-faint">
                      {post.category} · 좋아요 {post.likeCount}
                    </p>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-faint" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-line bg-white p-5 text-center text-[13px] text-sub">
              아직 작성한 글이 없어요
            </div>
          )}
        </section>

        {/* 6. 설정 리스트 */}
        <section className="anim-rise mt-6" style={stagger(7)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Settings2 size={16} className="text-brand" />
            설정
          </h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="flex items-center gap-2.5 text-[14px] font-medium">
                <Bell size={17} className="text-sub" />
                알림 설정
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={notifyOn}
                onClick={() => setNotifyOn((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  notifyOn ? "bg-brand" : "bg-field"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    notifyOn ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-line" />

            <SettingRow
              icon={<Coins size={17} className="text-sub" />}
              label="결제 수단 관리"
              onClick={() => showToast("결제 수단 관리는 베타에서 준비 중이에요")}
            />
            <SettingRow
              icon={<HelpCircle size={17} className="text-sub" />}
              label="고객센터"
              onClick={() => showToast("고객센터는 베타에서 준비 중이에요")}
            />
            <SettingRow
              icon={<Megaphone size={17} className="text-sub" />}
              label="공지사항"
              onClick={() => showToast("공지사항은 베타에서 준비 중이에요")}
            />
            <SettingRow
              icon={<FileText size={17} className="text-sub" />}
              label="이용약관 및 개인정보처리방침"
              onClick={() =>
                showToast("이용약관 및 개인정보처리방침은 베타에서 준비 중이에요")
              }
            />

            <div className="border-t border-line" />

            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="flex items-center gap-2.5 text-[14px] font-medium text-faint">
                <MessageSquareHeart size={17} className="text-faint" />
                버전 정보
              </span>
              <span className="text-[12px] text-faint">v0.1.0 베타</span>
            </div>

            <div className="border-t border-line" />

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "체크리스트와 채팅 기록 등 모든 베타 데이터를 처음 상태로 되돌릴까요?",
                  )
                ) {
                  resetAll();
                }
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-[14px] font-medium text-red-500 transition active:bg-black/[0.02]"
            >
              <RotateCcw size={17} />
              베타 데이터 초기화
            </button>

            <div className="border-t border-line" />

            <button
              type="button"
              onClick={() => showToast("베타에는 로그인이 없어요")}
              className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-[14px] font-medium text-sub transition active:bg-black/[0.02]"
            >
              <LogOut size={17} className="text-sub" />
              로그아웃
            </button>
          </div>
        </section>
      </div>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}

// 히어로 카드 안의 다크 배경용 통계 셀
function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1 text-center">
      <span className="text-[15px] font-extrabold leading-none text-white">
        {value}
      </span>
      <span className="mt-1 text-[10.5px] leading-tight text-white/50">
        {label}
      </span>
    </div>
  );
}

// 보관함 탭 공용 빈 상태. framed=true면 독립 섹션(흰 배경 위)에서 쓰는 테두리 버전
function EmptyState({
  text,
  ctaLabel,
  onClick,
  framed = false,
}: {
  text: string;
  ctaLabel: string;
  onClick: () => void;
  framed?: boolean;
}) {
  return (
    <div
      className={
        framed
          ? "rounded-2xl border border-line bg-white p-5 text-center"
          : "rounded-xl bg-field p-5 text-center"
      }
    >
      <p className="text-[13px] text-sub">{text}</p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-3 inline-flex h-9 items-center justify-center rounded-xl px-4 text-[13px] font-bold text-brand transition active:scale-95 ${
          framed ? "bg-tint" : "bg-white ring-1 ring-line"
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

// 찜한 업체 / 최근 본 업체 가로 스크롤 컴팩트 카드
function VendorTile({
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
      className="flex w-[132px] shrink-0 flex-col gap-1.5 rounded-2xl border border-line bg-white p-2.5 text-left transition active:scale-[0.97] active:bg-black/[0.02]"
    >
      <VendorThumb
        category={vendor.category}
        thumbnailUrl={vendor.thumbnailUrl}
        className="h-[88px] w-full rounded-xl"
        iconSize={26}
      />
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-bold">{vendor.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-sub">
          <Star size={10} className="fill-[#FFC107] text-[#FFC107]" />
          <span className="font-semibold text-ink">
            {vendor.rating.toFixed(1)}
          </span>
          <span className="flex min-w-0 items-center gap-0.5 truncate text-faint">
            <MapPin size={9} className="shrink-0" />
            <span className="truncate">{vendor.region}</span>
          </span>
        </div>
      </div>
    </button>
  );
}

function SettingRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition active:bg-black/[0.02]"
    >
      <span className="flex items-center gap-2.5 text-[14px] font-medium">
        {icon}
        {label}
      </span>
      <ChevronRight size={16} className="text-faint" />
    </button>
  );
}
