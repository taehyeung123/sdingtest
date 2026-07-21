import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronRight,
  Coins,
  FileText,
  HelpCircle,
  LogOut,
  Megaphone,
  MessageSquareHeart,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import ProgressRing from "../components/ProgressRing";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { MY_NICKNAME } from "../data/community";
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

export default function MyPage() {
  const navigate = useNavigate();
  const { items, summary, points, aiPass, communityPosts, showToast, resetAll } =
    useApp();
  const [notifyOn, setNotifyOn] = useState(true);

  const dday = formatDday(daysUntilWedding());
  const percent = progressPercent(summary);

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

        {/* 3. 포인트 / AI 패스 카드 */}
        <section className="anim-rise mt-6" style={stagger(2)}>
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

        {/* 4. 웨딩 준비 현황 카드 */}
        <button
          type="button"
          onClick={() => navigate("/planner")}
          className="anim-rise mt-6 block w-full text-left"
          style={stagger(3)}
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
              <p className="text-[14px] font-bold">웨딩 준비 현황</p>
              <p className="mt-0.5 text-[12px] text-sub">
                {summary.doneCount}/{summary.totalCount} 완료 · {dday}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-faint" />
          </div>
        </button>

        {/* 5. 등록한 업체 */}
        <section className="anim-rise mt-6" style={stagger(4)}>
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

        {/* 6. 내 커뮤니티 활동 */}
        <section className="anim-rise mt-6" style={stagger(5)}>
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

        {/* 7. 설정 리스트 */}
        <section className="anim-rise mt-6" style={stagger(6)}>
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
