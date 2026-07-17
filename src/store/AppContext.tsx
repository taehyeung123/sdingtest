import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChecklistItem,
  ProgressSummary,
  RegisteredVendor,
} from "../types";
import { INITIAL_CHECKLIST } from "../data/checklist";
import { progressSummary } from "../lib/wedding";

interface AppContextValue {
  items: ChecklistItem[];
  messages: ChatMessage[];
  greeted: boolean;
  summary: ProgressSummary;
  toastMessage: string | null;
  /** 단순 체크형 항목의 완료 토글 */
  toggleItem: (id: string) => void;
  setItemMemo: (id: string, memo: string) => void;
  /** 업체 등록/수정 — status가 상담중이면 미완료, 그 외(계약완료 등)면 완료 처리 */
  registerVendor: (id: string, vendor: RegisteredVendor) => void;
  /** 업체 등록 없이 완료 처리 */
  completeWithoutVendor: (id: string) => void;
  appendMessages: (msgs: ChatMessage[]) => void;
  markGreeted: () => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [greeted, setGreeted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isDone: !it.isDone } : it)),
    );
  }, []);

  const setItemMemo = useCallback((id: string, memo: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, memo: memo.trim() || undefined } : it,
      ),
    );
  }, []);

  const registerVendor = useCallback((id: string, vendor: RegisteredVendor) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, vendor, isDone: vendor.status !== "상담중" }
          : it,
      ),
    );
  }, []);

  const completeWithoutVendor = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              isDone: true,
              vendor: {
                status: "완료(업체 미등록)",
                registeredAt: new Date().toISOString().slice(0, 10),
              },
            }
          : it,
      ),
    );
  }, []);

  const appendMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...msgs]);
  }, []);

  const markGreeted = useCallback(() => setGreeted(true), []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const summary = useMemo(() => progressSummary(items), [items]);

  const value = useMemo<AppContextValue>(
    () => ({
      items,
      messages,
      greeted,
      summary,
      toastMessage,
      toggleItem,
      setItemMemo,
      registerVendor,
      completeWithoutVendor,
      appendMessages,
      markGreeted,
      showToast,
    }),
    [
      items,
      messages,
      greeted,
      summary,
      toastMessage,
      toggleItem,
      setItemMemo,
      registerVendor,
      completeWithoutVendor,
      appendMessages,
      markGreeted,
      showToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
