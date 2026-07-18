import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  CalendarHeart,
  ChevronRight,
  ClipboardCheck,
  Coins,
  Heart,
  ListChecks,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Logo from "../components/Logo";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import ProgressRing from "../components/ProgressRing";
import StatusBadge from "../components/StatusBadge";
import { categoryIcon } from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import {
  PARTNER_NAME,
  USER_NAME,
  daysUntilWedding,
  formatDday,
  formatWeddingDate,
  nextTodos,
  progressPercent,
  todoDdayLabel,
} from "../lib/wedding";
import type { ChecklistGroup } from "../types";

// 미니 progress bar로 개별 노출하는 주요 그룹 — 나머지는 "기타"로 합산
const MAIN_GROUPS: ChecklistGroup[] = [
  "업체 계약",
  "청첩장 세부 진행",
  "게스트·의전 준비",
  "본식 콘텐츠 준비",
];

const AI_BANNERS = [
  {
    to: "/ai/dress",
    image: "/mock/dress-1.jpg",
    imageClass: "object-cover object-top",
    title: "AI 드레스 합성",
    sub: "내 사진에 드레스를 입혀보세요",
  },
  {
    to: "/ai/hall",
    image: "/mock/hall-1.jpg",
    imageClass: "object-cover",
    title: "AI 웨딩홀 합성",
    sub: "우리 부부가 이 홀에 선다면?",
  },
] as const;

// 섹션 순차 등장 딜레이 (CSS 애니메이션 — rAF가 멈춰도 콘텐츠는 항상 보임)
const stagger = (step: number) => ({ animationDelay: `${step * 60}ms` });

// AI 플래너 카드의 추천 질문 — 탭하면 채팅방에서 바로 전송된다
const SUGGESTED_QUESTIONS = [
  "지금 뭐 해야 해?",
  "웨딩홀 추천해줘",
  "스드메가 뭐예요?",
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const { items, summary, showToast, resetAll, points, aiPass } = useApp();

  const dday = formatDday(daysUntilWedding());
  const percent = progressPercent(summary);
  const todos = nextTodos(items, 3);

  const groupRows = useMemo(() => {
    const rows = MAIN_GROUPS.map((name) => {
      const g = summary.groupProgress.find((p) => p.groupName === name);
      return { label: name as string, done: g?.done ?? 0, total: g?.total ?? 0 };
    });
    const etc = summary.groupProgress
      .filter((g) => !MAIN_GROUPS.includes(g.groupName))
      .reduce(
        (acc, g) => ({ done: acc.done + g.done, total: acc.total + g.total }),
        { done: 0, total: 0 },
      );
    rows.push({ label: "기타", ...etc });
    return rows;
  }, [summary]);

  return (
    <div className="min-h-dvh bg-white pb-24">
      <div>
        {/* 1. 헤더 */}
        <header className="anim-rise px-5 pt-4" style={stagger(0)}>
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
          <h1 className="mt-3 text-[20px] font-extrabold">
            {USER_NAME}님의 웨딩 플래너
          </h1>
        </header>

        {/* 2. D-day 배너 */}
        <section className="anim-rise mt-4 px-5" style={stagger(1)}>
          <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white">
            <CalendarHeart
              size={96}
              strokeWidth={1.4}
              className="absolute -right-4 -bottom-7 text-white/[0.07]"
            />
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
              {USER_NAME}
              <Heart size={13} className="text-brand" fill="currentColor" />
              {PARTNER_NAME}
              <span className="font-medium text-white/50">· 결혼까지</span>
            </p>
            <p className="mt-1 text-[34px] font-extrabold leading-none tracking-tight text-brand">
              {dday}
            </p>
            <p className="mt-2.5 text-[12px] text-white/60">
              {formatWeddingDate()}
            </p>
          </div>
        </section>

        {/* 3. 진행률 요약 = 웨딩 체크리스트 진입 카드 (카드 전체 탭 가능) */}
        <section className="anim-rise mt-5 px-5" style={stagger(2)}>
          <Link
            to="/checklist"
            className="block rounded-2xl border border-line bg-white p-4 transition active:scale-[0.99] active:bg-black/[0.02]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ListChecks size={16} className="text-brand" />
                <span className="text-[15px] font-bold">웨딩 체크리스트</span>
              </span>
              <span className="flex items-center gap-0.5 text-[13px] font-semibold text-brand">
                전체보기
                <ChevronRight size={15} />
              </span>
            </div>
            <div className="mt-3.5 flex items-center gap-5">
            <ProgressRing
              value={
                summary.totalCount > 0
                  ? summary.doneCount / summary.totalCount
                  : 0
              }
              size={112}
              stroke={10}
            >
              <div className="flex items-baseline">
                <span className="text-[27px] font-extrabold leading-none text-ink">
                  {percent}
                </span>
                <span className="text-[14px] font-bold text-ink">%</span>
              </div>
              <span className="mt-1 text-[11px] font-medium text-faint">
                {summary.doneCount}/{summary.totalCount} 완료
              </span>
            </ProgressRing>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {groupRows.map((row) => {
                const ratio =
                  row.total > 0 ? Math.round((row.done / row.total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-sub">
                        {row.label}
                      </span>
                      <span className="shrink-0 text-[11px] text-faint">
                        {row.done}/{row.total}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-field">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </Link>
        </section>

        {/* 4. AI 배너 캐러셀 */}
        <section className="anim-rise mt-5" style={stagger(3)}>
          <div className="mb-3 flex items-center gap-1.5 px-5">
            <Sparkles size={16} className="text-brand" />
            <h2 className="text-[16px] font-bold">AI로 미리 보는 우리 결혼식</h2>
            <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
              BETA
            </span>
          </div>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5">
            {AI_BANNERS.map((banner) => (
              <Link
                key={banner.to}
                to={banner.to}
                className="relative h-[150px] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl transition active:scale-[0.98]"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`absolute inset-0 h-full w-full ${banner.imageClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                  <Sparkles size={11} />
                  AI 베타
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[17px] font-bold text-white">
                    {banner.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/80">
                    {banner.sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. 다음 할 일 */}
        <section className="anim-rise mt-6 px-5" style={stagger(4)}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">다음 할 일</h2>
            <Link
              to="/checklist"
              className="flex items-center gap-0.5 text-[13px] font-medium text-sub"
            >
              체크리스트 전체보기
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {todos.map((item) => {
              const Icon = item.category
                ? categoryIcon(item.category)
                : ClipboardCheck;
              const ddayLabel = todoDdayLabel(item);
              return (
                <Link
                  key={item.id}
                  to={`/checklist?highlight=${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition active:scale-[0.99] active:bg-black/[0.02]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">
                      {item.title}
                    </p>
                    {(ddayLabel || item.vendor?.status === "상담중") && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {ddayLabel && (
                          <span className="rounded-md bg-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                            {ddayLabel}
                          </span>
                        )}
                        {item.vendor?.status === "상담중" && (
                          <StatusBadge status="상담중" />
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-faint" />
                </Link>
              );
            })}
            {todos.length === 0 && (
              <div className="rounded-2xl border border-line bg-white p-5 text-center text-[13px] text-sub">
                모든 준비를 마쳤어요. 정말 수고하셨어요!
              </div>
            )}
          </div>
        </section>

        {/* 6. AI 플래너 허브 카드 — 추천 질문 탭 시 채팅방에서 바로 전송 */}
        <section className="anim-rise mt-6 px-5" style={stagger(5)}>
          <div className="rounded-2xl bg-tint p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Sparkles size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">
                  AI 웨딩플래너에게 물어보세요
                </p>
                <p className="mt-0.5 text-[12px] text-sub">
                  업체 추천부터 일정 관리까지, 대화로 한 번에
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
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
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[14px] font-bold text-white transition active:scale-[0.98]"
            >
              <MessageCircle size={16} strokeWidth={2.2} />
              대화 시작하기
            </button>
          </div>
        </section>

        {/* 베타 유틸: 저장된 데이터 초기화 */}
        <section className="anim-rise mt-8 px-5 text-center" style={stagger(6)}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("체크리스트와 채팅 기록을 처음 상태로 되돌릴까요?")) {
                resetAll();
              }
            }}
            className="text-[12px] text-faint underline underline-offset-2"
          >
            베타 데이터 초기화
          </button>
        </section>
      </div>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}
