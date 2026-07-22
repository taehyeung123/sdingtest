import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Building2,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareHeart,
  RotateCcw,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import ProgressRing from "../components/ProgressRing";
import StatusBadge from "../components/StatusBadge";
import VendorThumb from "../components/VendorThumb";
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
  } = useApp();
  const [notifyOn, setNotifyOn] = useState(true);

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

  return (
    <div className="min-h-dvh bg-page pb-24">
      {/* 1. 헤더 */}
      <header className="anim-rise bg-white px-5 pt-4 pb-3" style={stagger(0)}>
        <h1 className="text-[20px] font-extrabold">마이페이지</h1>
      </header>

      <div className="mt-6 px-5">
        {/* 2. 프로필 카드 */}
        <section className="anim-rise" style={stagger(1)}>
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-[20px] font-extrabold text-white">
                {USER_NAME.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[16px] font-bold">
                    {USER_NAME} · {PARTNER_NAME} 예비부부
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-md bg-tint px-1.5 py-0.5 text-[11px] font-bold text-brand">
                    {dday}
                  </span>
                  <span className="text-[12px] text-sub">
                    {formatWeddingDate()}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast("프로필 수정은 베타에서 준비 중이에요")}
              className="mt-3.5 h-9 w-full rounded-xl border border-line text-[13px] font-semibold text-sub transition active:bg-black/[0.02]"
            >
              프로필 수정
            </button>
          </div>
        </section>

        {/* 3. 활동 통계 요약 */}
        <section className="anim-rise mt-3" style={stagger(2)}>
          <div className="grid grid-cols-4 divide-x divide-line rounded-2xl border border-line bg-white py-3.5">
            <StatCell label="글" value={stats.postCount} />
            <StatCell label="댓글" value={stats.commentCount} />
            <StatCell label="받은 좋아요" value={stats.likesReceived} />
            <StatCell label="찜한 업체" value={stats.favoriteCount} />
          </div>
        </section>

        {/* 4. 포인트 / AI 패스 카드 */}
        <section className="anim-rise mt-6" style={stagger(3)}>
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins size={16} className="text-brand" />
                <span className="text-[15px] font-bold">
                  {points.toLocaleString()}P
                </span>
              </span>
              <button
                type="button"
                onClick={() => showToast("포인트 내역은 베타에서 준비 중이에요")}
                className="flex items-center gap-0.5 text-[12px] font-medium text-sub"
              >
                포인트 내역 보기
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-3 border-t border-line pt-3">
              {aiPass ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                    <Sparkles size={15} className="text-brand" />
                    AI 패스 구독중
                  </span>
                  <span className="rounded-full bg-tint px-2 py-1 text-[11px] font-bold text-brand">
                    무제한 합성
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/ai/dress")}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[13px] font-bold text-white transition active:scale-[0.98]"
                >
                  <Sparkles size={15} />
                  AI 패스 구독하기
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 5. 웨딩 준비 현황 카드 (등급 뱃지 포함) */}
        <button
          type="button"
          onClick={() => navigate("/planner")}
          className="anim-rise mt-6 block w-full text-left"
          style={stagger(4)}
        >
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition active:scale-[0.99] active:bg-black/[0.02]">
            <ProgressRing
              value={summary.totalCount > 0 ? summary.doneCount / summary.totalCount : 0}
              size={68}
              stroke={7}
            >
              <span className="text-[15px] font-extrabold leading-none">
                {percent}%
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-bold">웨딩 준비 현황</p>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${level.className}`}
                >
                  {level.label}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-sub">
                {summary.doneCount}/{summary.totalCount} 완료 · {dday}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-faint" />
          </div>
        </button>

        {/* 6. 찜한 업체 */}
        <section className="anim-rise mt-6" style={stagger(5)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Heart size={16} className="text-brand" />
            찜한 업체
            {favoriteVendors.length > 0 && (
              <span className="text-[13px] font-medium text-faint">
                {favoriteVendors.length}
              </span>
            )}
          </h2>
          {favoriteVendors.length > 0 ? (
            <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
              {favoriteVendors.map((vendor) => (
                <VendorTile
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => goVendor(vendor)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <p className="text-[13px] text-sub">아직 찜한 업체가 없어요</p>
              <button
                type="button"
                onClick={() => navigate("/services")}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-tint px-4 text-[13px] font-bold text-brand transition active:scale-95"
              >
                업체 둘러보기
              </button>
            </div>
          )}
        </section>

        {/* 7. 최근 본 업체 (비어있으면 섹션 자체를 숨김) */}
        {recentlyViewedVendors.length > 0 && (
          <section className="anim-rise mt-6" style={stagger(6)}>
            <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
              <Clock size={16} className="text-brand" />
              최근 본 업체
            </h2>
            <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
              {recentlyViewedVendors.map((vendor) => (
                <VendorTile
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => goVendor(vendor)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. 등록한 업체 */}
        <section className="anim-rise mt-6" style={stagger(7)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Building2 size={16} className="text-brand" />
            등록한 업체
          </h2>
          {registeredVendors.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {registeredVendors.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => navigate(`/vendor-chat/${it.id}`)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-faint">
                      {it.category}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-bold">
                      {it.vendor?.vendorName}
                    </p>
                  </div>
                  {it.vendor && <StatusBadge status={it.vendor.status} />}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <p className="text-[13px] text-sub">
                아직 등록한 업체가 없어요
              </p>
              <button
                type="button"
                onClick={() => navigate("/checklist")}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-tint px-4 text-[13px] font-bold text-brand transition active:scale-95"
              >
                체크리스트에서 등록하기
              </button>
            </div>
          )}
        </section>

        {/* 9. 스크랩한 글 */}
        <section className="anim-rise mt-6" style={stagger(8)}>
          <h2 className="mb-3 flex items-center gap-1.5 text-[16px] font-bold">
            <Bookmark size={16} className="text-brand" />
            스크랩한 글
            {scrappedPosts.length > 0 && (
              <span className="text-[13px] font-medium text-faint">
                {scrappedPosts.length}
              </span>
            )}
          </h2>
          {scrappedPosts.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {scrappedPosts.slice(0, 5).map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => navigate(`/community/${post.id}`)}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
                >
                  <span className="shrink-0 rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
                    {post.category}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">
                    {post.title}
                  </p>
                  <ChevronRight size={15} className="shrink-0 text-faint" />
                </button>
              ))}
              {scrappedPosts.length > 5 && (
                <button
                  type="button"
                  onClick={() => navigate("/community")}
                  className="text-center text-[12px] font-medium text-sub"
                >
                  스크랩 {scrappedPosts.length}개 전체보기
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <p className="text-[13px] text-sub">
                아직 스크랩한 글이 없어요
              </p>
              <button
                type="button"
                onClick={() => navigate("/community")}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-tint px-4 text-[13px] font-bold text-brand transition active:scale-95"
              >
                커뮤니티 둘러보기
              </button>
            </div>
          )}
        </section>

        {/* 10. 내 커뮤니티 활동 */}
        <section className="anim-rise mt-6" style={stagger(9)}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[16px] font-bold">
              <Users size={16} className="text-brand" />
              내 커뮤니티 활동
              <span className="text-[13px] font-medium text-faint">
                {myPosts.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="flex items-center gap-0.5 text-[12px] font-medium text-sub"
            >
              커뮤니티 더보기
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
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
                >
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">
                    {post.title}
                  </p>
                  <span className="shrink-0 text-[12px] text-faint">
                    좋아요 {post.likeCount}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-line bg-white p-5 text-center text-[13px] text-sub">
              아직 작성한 글이 없어요
            </div>
          )}
        </section>

        {/* 11. 설정 리스트 */}
        <section className="anim-rise mt-6" style={stagger(10)}>
          <h2 className="mb-3 text-[16px] font-bold">설정</h2>
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

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[15px] font-extrabold text-ink">{value}</span>
      <span className="text-[11px] text-faint">{label}</span>
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
