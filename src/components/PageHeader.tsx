import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
  /** AI 합성 화면 등 다크 배경용 */
  dark?: boolean;
}

export default function PageHeader({ title, right, onBack, dark }: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={`sticky top-0 z-30 flex h-13 items-center px-1.5 backdrop-blur ${
        dark
          ? "bg-dark/90 text-white"
          : "border-b border-line bg-white/95 text-ink"
      }`}
    >
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack ?? (() => navigate("/"))}
        className={`flex h-11 w-11 items-center justify-center rounded-full active:scale-95 ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>
      <h1 className="absolute inset-x-0 pointer-events-none text-center text-[16px] font-semibold">
        {title}
      </h1>
      <div className="ml-auto flex items-center pr-2">{right}</div>
    </header>
  );
}
