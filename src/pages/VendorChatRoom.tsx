import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUp, ChevronLeft } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { vendorById } from "../data/vendors";
import { formatTime, uid } from "../lib/utils";

// 업체 측 mock 자동응답 (전송 순서대로 로테이션)
const VENDOR_REPLIES = [
  "네 고객님, 확인 후 빠르게 안내드릴게요.",
  "말씀 주신 내용은 담당 실장님께 전달해 두었어요.",
  "해당 일정 예약 가능 여부 확인해서 다시 연락드릴게요.",
  "감사합니다. 더 필요한 내용 있으면 언제든 말씀 주세요.",
];

export default function VendorChatRoom() {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { items, vendorChats, appendVendorMessages } = useApp();

  const item = items.find((it) => it.id === itemId);
  const vendor = item?.vendor;
  const thread = useMemo(
    () => (itemId ? (vendorChats[itemId] ?? []) : []),
    [vendorChats, itemId],
  );

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const timersRef = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 등록되지 않은 항목으로 접근하면 리스트로 되돌림
  useEffect(() => {
    if (!item || !vendor?.vendorName) navigate("/vendor-chat", { replace: true });
  }, [item, vendor, navigate]);

  // 진행 중 타이머 정리
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  // 첫 진입 시 업체 인사 (스레드가 비어 있을 때 1회)
  // ref 가드 대신 thread.length 조건 + 타이머 cleanup으로 처리해야
  // StrictMode 이중 마운트에서도 인사가 정확히 1번 도착한다.
  const vendorName = vendor?.vendorName;
  useEffect(() => {
    if (!itemId || !vendorName || thread.length > 0) return;
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      appendVendorMessages(itemId, [
        {
          id: uid(),
          from: "vendor",
          text: `안녕하세요 고객님, ${vendorName}입니다. 무엇을 도와드릴까요?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 700);
    return () => {
      window.clearTimeout(t);
      setTyping(false);
    };
  }, [itemId, vendorName, thread.length, appendVendorMessages]);

  // 새 메시지 시 하단 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, typing]);

  if (!item || !vendor?.vendorName || !item.category) return null;

  const linked = vendor.linkedVendorId
    ? vendorById(vendor.linkedVendorId)
    : undefined;

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing || !itemId) return;
    setInput("");
    const replyIdx =
      thread.filter((m) => m.from === "vendor").length % VENDOR_REPLIES.length;
    appendVendorMessages(itemId, [
      { id: uid(), from: "user", text, timestamp: new Date().toISOString() },
    ]);
    timersRef.current.push(
      window.setTimeout(() => setTyping(true), 500),
      window.setTimeout(() => {
        setTyping(false);
        appendVendorMessages(itemId, [
          {
            id: uid(),
            from: "vendor",
            text: VENDOR_REPLIES[replyIdx],
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 1300),
    );
  };

  const canSend = input.trim().length > 0 && !typing;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-white/95 px-2 backdrop-blur">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate("/vendor-chat")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <VendorThumb
          category={item.category}
          thumbnailUrl={linked?.thumbnailUrl}
          className="h-9 w-9 rounded-full"
          iconSize={16}
        />
        <div className="ml-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold">
              {vendor.vendorName}
            </span>
            <StatusBadge status={vendor.status} />
          </div>
          <div className="truncate text-[11px] text-faint">
            {item.category} · 보통 몇 시간 내 응답해요
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-[104px]">
        <p className="pb-1 text-center text-[11px] text-faint">
          베타 데모 채팅 — 실제 업체 응답이 아니에요
        </p>
        {thread.map((msg) => {
          const isUser = msg.from === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-1 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {isUser && (
                <span className="shrink-0 text-[10px] text-faint">
                  {formatTime(msg.timestamp)}
                </span>
              )}
              <div
                className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  isUser
                    ? "rounded-tr-[6px] bg-brand text-white"
                    : "rounded-tl-[6px] bg-field text-ink"
                }`}
              >
                {msg.text}
              </div>
              {!isUser && (
                <span className="shrink-0 text-[10px] text-faint">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-[6px] bg-field px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint/70"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
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
              if (e.key === "Enter" && e.nativeEvent.isComposing)
                e.preventDefault();
            }}
            placeholder={`${vendor.vendorName}에 문의하기…`}
            className="h-11 min-w-0 flex-1 rounded-full bg-field px-4 text-[14px] outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            aria-label="전송"
            disabled={!canSend}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              canSend
                ? "bg-brand text-white active:scale-95"
                : "bg-field text-faint"
            }`}
          >
            <ArrowUp size={20} strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}
