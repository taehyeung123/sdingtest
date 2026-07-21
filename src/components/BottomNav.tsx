import { useLocation, useNavigate } from "react-router-dom";
import {
  CircleUserRound,
  Home,
  LayoutGrid,
  MessagesSquare,
  Sparkles,
} from "lucide-react";

const TABS = [
  { key: "home", label: "홈", Icon: Home, to: "/" },
  { key: "services", label: "전체서비스", Icon: LayoutGrid, to: "/services" },
  { key: "planner", label: "AI플래너", Icon: Sparkles, to: "/planner" },
  { key: "community", label: "커뮤니티", Icon: MessagesSquare, to: "/community" },
  { key: "my", label: "마이페이지", Icon: CircleUserRound, to: "/my" },
] as const;

// 최하단 5탭 — 전 탭 활성화. planner는 /planner 및 그 하위 라우트
// (체크리스트·채팅·AI합성 등)에서도 활성 표시된다.
function isActive(tabTo: string, pathname: string): boolean {
  if (tabTo === "/") return pathname === "/";
  if (tabTo === "/planner") {
    return (
      pathname.startsWith("/planner") ||
      pathname.startsWith("/checklist") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/vendor-chat") ||
      pathname.startsWith("/ai/")
    );
  }
  return pathname.startsWith(tabTo);
}

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="w-full max-w-[430px] border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {TABS.map(({ key, label, Icon, to }) => {
            const active = isActive(to, pathname);
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(to)}
                className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
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
