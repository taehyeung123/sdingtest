import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Store,
} from "lucide-react";
import BottomSheet from "./BottomSheet";
import { useApp } from "../store/AppContext";

interface Props {
  /** FAB의 세로 위치 (하단 네비 유무에 따라 화면별로 지정) */
  offsetClass?: string;
}

// 우하단 플로팅 채팅 버튼 — AI 플래너 대화 / 업체 채팅 선택 모달
export default function FloatingChat({ offsetClass = "bottom-24" }: Props) {
  const navigate = useNavigate();
  const { items } = useApp();
  const [open, setOpen] = useState(false);

  const vendorCount = items.filter((it) => it.vendor?.vendorName).length;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center ${offsetClass}`}
      >
        <div className="relative w-full max-w-[430px]">
          <button
            type="button"
            aria-label="채팅 시작하기"
            onClick={() => setOpen(true)}
            className="pointer-events-auto absolute bottom-0 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_22px_rgba(255,84,22,0.38)] transition active:scale-95"
          >
            <MessageCircle size={25} strokeWidth={2} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink">
              <Sparkles size={11} className="text-white" />
            </span>
          </button>
        </div>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="어떤 대화를 시작할까요?"
      >
        <div className="px-4 pb-2 pt-2">
          <button
            type="button"
            onClick={() => go("/chat")}
            className="flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition active:bg-tint"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Sparkles size={22} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">
                AI 플래너와 대화
              </span>
              <span className="mt-0.5 block text-[12px] text-sub">
                업체 추천부터 일정 관리까지 무엇이든 물어보세요
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-faint" />
          </button>

          <button
            type="button"
            onClick={() => go("/vendor-chat")}
            className="mt-1 flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition active:bg-tint"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
              <Store size={22} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold">업체와 채팅</span>
                {vendorCount > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                    {vendorCount}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[12px] text-sub">
                등록한 업체와 1:1로 소통해요
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-faint" />
          </button>

          <div className="mt-3 border-t border-line pt-3.5">
            <p className="px-1 text-[12px] font-semibold text-faint">
              AI 도구 바로가기
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => go("/ai/dress")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-3 text-[13px] font-semibold transition active:bg-tint"
              >
                <Sparkles size={15} className="text-brand" />
                AI 드레스 합성
              </button>
              <button
                type="button"
                onClick={() => go("/ai/hall")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-3 text-[13px] font-semibold transition active:bg-tint"
              >
                <Building2 size={15} className="text-brand" />
                AI 웨딩홀 합성
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
