import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Home,
  ListChecks,
  MoreVertical,
  Plus,
  Sparkles,
  Store,
} from "lucide-react";
import type { ChatMessage } from "../types";
import { useApp } from "../store/AppContext";
import { nextTodos } from "../lib/wedding";
import { formatTime, uid } from "../lib/utils";
import { getAiResponses, greetingMessages } from "../lib/chatEngine";
import VendorCard from "../components/VendorCard";

const appear = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.18 },
} as const;

const MENU_ITEMS = [
  { label: "웨딩 체크리스트", Icon: ListChecks, to: "/checklist" },
  { label: "AI 드레스 합성", Icon: Sparkles, to: "/ai/dress" },
  { label: "AI 웨딩홀 합성", Icon: Building2, to: "/ai/hall" },
  { label: "업체 채팅", Icon: Store, to: "/vendor-chat" },
  { label: "대시보드로 가기", Icon: Home, to: "/planner" },
] as const;

// 채팅방 온보딩 — 체크리스트를 대표 행(진행률·다음 할 일 포함)으로 보여주고
// AI 도구 2종을 그 아래 배치하는 허브
const ONBOARDING_TOOLS = [
  { label: "AI 드레스 합성", Icon: Sparkles, to: "/ai/dress" },
  { label: "AI 웨딩홀 합성", Icon: Building2, to: "/ai/hall" },
] as const;

function OnboardingPanel() {
  const navigate = useNavigate();
  const { items, summary } = useApp();
  const next = nextTodos(items, 1)[0];

  return (
    <div className="anim-rise mb-2 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} className="shrink-0 text-brand" />
        <span className="text-[13px] font-bold">
          AI 플래너가 이런 걸 도와드릴 수 있어요
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate("/checklist")}
        className="mt-3 flex w-full items-center gap-3 rounded-xl bg-tint p-3 text-left transition active:bg-brand/15"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <ListChecks size={18} strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold">웨딩 체크리스트</span>
          <span className="mt-0.5 block truncate text-[11px] text-sub">
            {summary.doneCount}/{summary.totalCount} 완료
            {next ? ` · 다음: ${next.title}` : " · 모든 준비 완료!"}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-brand" />
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {ONBOARDING_TOOLS.map(({ label, Icon, to }) => (
          <button
            key={to}
            type="button"
            onClick={() => navigate(to)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-field/70 py-2.5 text-[12px] font-semibold transition active:bg-tint"
          >
            <Icon size={15} className="text-brand" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 말풍선 + 옆 하단 시각 라벨
function Bubble({
  text,
  isUser,
  time,
}: {
  text: string;
  isUser: boolean;
  time: string;
}) {
  return (
    <div
      className={`flex items-end gap-1 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isUser && <span className="shrink-0 text-[10px] text-faint">{time}</span>}
      <div
        className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? "rounded-tr-[6px] bg-brand text-white"
            : "rounded-tl-[6px] border border-line bg-white"
        }`}
      >
        {text}
      </div>
      {!isUser && <span className="shrink-0 text-[10px] text-faint">{time}</span>}
    </div>
  );
}

function TypingBubble() {
  return (
    <motion.div {...appear} className="flex justify-start py-1">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-[6px] border border-line bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint/70"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface RowProps {
  msg: ChatMessage;
  showChips: boolean;
  onChip: (text: string) => void;
}

// ChatMessage.type과 채워진 필드 기준으로 렌더링 — sender 불문 모든 타입 처리
function MessageRow({ msg, showChips, onChip }: RowProps) {
  const navigate = useNavigate();
  const isUser = msg.sender === "user";
  const time = formatTime(msg.timestamp);

  if (msg.type === "synthesisResult" && msg.synthesis) {
    return (
      <motion.div
        {...appear}
        className={`flex items-end gap-1 py-1 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {isUser && <span className="shrink-0 text-[10px] text-faint">{time}</span>}
        <div className="max-w-[70%] overflow-hidden rounded-2xl border border-line bg-white">
          <img
            src={msg.synthesis.imageUrl}
            alt={msg.synthesis.label}
            className="aspect-[3/4] w-full object-cover object-top"
          />
          <div className="flex items-center gap-1 px-3 py-2">
            <Sparkles size={12} className="shrink-0 text-brand" />
            <span className="truncate text-[12px] font-semibold">
              {msg.synthesis.label}
            </span>
          </div>
        </div>
        {!isUser && <span className="shrink-0 text-[10px] text-faint">{time}</span>}
      </motion.div>
    );
  }

  if (msg.type === "checklistNudge" && msg.nudge) {
    const nudge = msg.nudge;
    return (
      <motion.div {...appear} className="flex flex-col gap-2 py-1">
        {msg.text && <Bubble text={msg.text} isUser={isUser} time={time} />}
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
            <ClipboardCheck size={19} strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-bold">{nudge.title}</div>
            <div className="mt-0.5 text-[12px] text-sub">
              지금 순서상 이걸 하면 좋아요
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/checklist?highlight=${nudge.checklistItemId}`)}
            className="shrink-0 py-1 text-[13px] font-bold text-brand active:opacity-70"
          >
            보러가기
          </button>
        </div>
      </motion.div>
    );
  }

  if (msg.type === "vendorCard") {
    const vendors = (msg.vendors ?? []).slice(0, 3);
    const category = vendors[0]?.category;
    const to = category ? `/vendors/${encodeURIComponent(category)}` : null;
    return (
      <motion.div {...appear} className="flex flex-col gap-2 py-1">
        {msg.text && <Bubble text={msg.text} isUser={isUser} time={time} />}
        {vendors.map((v) => (
          <VendorCard
            key={v.id}
            vendor={v}
            onClick={() => {
              if (to) navigate(to);
            }}
          />
        ))}
        {to && (
          <button
            type="button"
            onClick={() => navigate(to)}
            className="flex items-center justify-center gap-1 py-1.5 text-[13px] font-semibold text-brand active:opacity-70"
          >
            <Plus size={14} strokeWidth={2.4} />
            이 카테고리 전체 보기
          </button>
        )}
      </motion.div>
    );
  }

  // text / quickReplies (그 외 필드 누락 타입도 안전하게 처리)
  const chips =
    msg.type === "quickReplies" && showChips ? (msg.quickReplies ?? []) : [];
  if (!msg.text && chips.length === 0) return null;
  return (
    <motion.div {...appear} className="flex flex-col">
      {msg.text && <Bubble text={msg.text} isUser={isUser} time={time} />}
      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChip(chip)}
              className="rounded-full border border-brand/40 bg-white px-3 py-1.5 text-[13px] text-brand active:bg-tint"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, messages, greeted, appendMessages, markGreeted } = useApp();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const greetedAtMount = useRef(greeted);

  const schedule = (delay: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  };

  // 언마운트 시 진행 중인 응답 타이머 정리
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  // 첫 진입 인사 (greeted가 false일 때만 1회)
  useEffect(() => {
    if (greetedAtMount.current) return;
    markGreeted();
    setBusy(true);
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setBusy(false);
      appendMessages(greetingMessages());
    }, 800);
    return () => window.clearTimeout(t);
  }, [markGreeted, appendMessages]);

  // 새 메시지·타이핑 표시 시 하단 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    appendMessages([
      {
        id: uid(),
        sender: "user",
        type: "text",
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
    const responses = getAiResponses(text, { items });
    schedule(700, () => setTyping(true));
    responses.forEach((msg, i) => {
      schedule(1200 + i * 400, () => {
        if (i === 0) setTyping(false);
        appendMessages([msg]);
        if (i === responses.length - 1) setBusy(false);
      });
    });
  };

  // 대시보드 추천 질문 칩으로 진입한 경우: (첫 진입이면 인사 후) 질문 자동 전송.
  // state 초기화는 전송 시점에 해야 StrictMode 이중 마운트에서도 질문이 유실되지 않는다.
  useEffect(() => {
    const ask = (location.state as { ask?: string } | null)?.ask;
    if (!ask) return;
    const delay = greetedAtMount.current ? 300 : 1400;
    const t = window.setTimeout(() => {
      navigate("/chat", { replace: true, state: null });
      send(ask);
    }, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = input.trim().length > 0 && !busy;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-white/95 px-2 backdrop-blur">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="ml-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold">AI 웨딩플래너</span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            <span className="shrink-0 text-[11px] text-sub">온라인</span>
          </div>
          <div className="truncate text-[11px] text-faint">나만의 웨딩 플래너</div>
        </div>
        <button
          type="button"
          aria-label="더보기 메뉴"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95"
        >
          <MoreVertical size={20} />
        </button>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="chat-more-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center"
          >
            <div className="relative w-full max-w-[430px]">
              <div className="pointer-events-auto absolute right-2 top-[58px] w-52 rounded-xl border border-line bg-white py-1 shadow-lg">
                {MENU_ITEMS.map(({ label, Icon, to }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(to);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] text-ink active:bg-tint"
                  >
                    <Icon size={18} strokeWidth={1.9} className="shrink-0 text-sub" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex flex-1 flex-col gap-1 px-4 pt-4 pb-[104px]">
        <OnboardingPanel />
        {(messages.length > 0 || typing) && (
          <div className="pb-2 text-center text-[11px] text-faint">오늘</div>
        )}
        {messages.map((msg, i) => (
          <MessageRow
            key={msg.id}
            msg={msg}
            showChips={
              i === messages.length - 1 && msg.sender === "ai" && !busy
            }
            onChip={send}
          />
        ))}
        {typing && <TypingBubble />}
        <div ref={bottomRef} className="h-px shrink-0" />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex w-full max-w-[430px] items-center gap-2 border-t border-line bg-white px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
            }}
            placeholder="메시지 입력…"
            disabled={busy}
            className="h-11 min-w-0 flex-1 rounded-full bg-field px-4 text-[14px] outline-none placeholder:text-faint disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="전송"
            disabled={!canSend}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              canSend ? "bg-brand text-white active:scale-95" : "bg-field text-faint"
            }`}
          >
            <ArrowUp size={20} strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}
