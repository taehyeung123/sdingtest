import {
  CircleUserRound,
  Home,
  LayoutGrid,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { useApp } from "../store/AppContext";

const TABS = [
  { key: "home", label: "홈", Icon: Home },
  { key: "services", label: "전체서비스", Icon: LayoutGrid },
  { key: "planner", label: "AI플래너", Icon: Sparkles },
  { key: "community", label: "커뮤니티", Icon: MessagesSquare },
  { key: "my", label: "마이페이지", Icon: CircleUserRound },
] as const;

// 최하단 5탭 — 베타에서는 AI플래너만 활성 (기획서 1.3)
export default function BottomNav() {
  const { showToast } = useApp();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="w-full max-w-[430px] border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {TABS.map(({ key, label, Icon }) => {
            const active = key === "planner";
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!active)
                    showToast("베타에서는 AI 플래너 탭만 열려 있어요");
                }}
                className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 ${
                  active ? "text-brand" : "text-faint"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
                <span
                  className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
