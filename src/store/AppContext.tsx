import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChecklistItem,
  CommunityComment,
  CommunityPost,
  ConsultationBooking,
  ProductOrder,
  ProgressSummary,
  RegisteredVendor,
  VendorChatMessage,
} from "../types";
import { INITIAL_CHECKLIST } from "../data/checklist";
import { SEED_POSTS } from "../data/community";
import { USER_NAME, progressSummary } from "../lib/wedding";
import { uid } from "../lib/utils";

// ---- localStorage 영속화 (베타: 실서버 저장 없음) ----------------------------
// blob: URL(사진 로컬 미리보기)은 새로고침 후 무효라 저장 시 제거한다.

const STORAGE_KEY = "sding-beta-state-v1";

// 가입 축하 포인트 (mock) — AI 합성에 사용
export const SIGNUP_POINTS = 3000;

interface PersistedState {
  items: ChecklistItem[];
  messages: ChatMessage[];
  greeted: boolean;
  vendorChats: Record<string, VendorChatMessage[]>;
  points: number;
  aiPass: boolean;
  communityPosts: CommunityPost[];
  likedPostIds: string[];
  scrappedPostIds: string[];
  favoriteVendorIds: string[];
  recentlyViewedVendorIds: string[];
  consultations: ConsultationBooking[];
  orders: ProductOrder[];
}

function dropBlobUrl(url?: string): string | undefined {
  return url && url.startsWith("blob:") ? undefined : url;
}

function sanitizeItems(items: ChecklistItem[]): ChecklistItem[] {
  return items.map((it) =>
    it.vendor
      ? {
          ...it,
          vendor: {
            ...it.vendor,
            productPhotoUrl: dropBlobUrl(it.vendor.productPhotoUrl),
            contractPhotoUrl: dropBlobUrl(it.vendor.contractPhotoUrl),
          },
        }
      : it,
  );
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter(
    (m) => !(m.synthesis && m.synthesis.imageUrl.startsWith("blob:")),
  );
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    // 체크리스트 데이터 모델이 바뀌면(항목 수 불일치) 저장본을 버리고 초기 상태로
    if (
      !Array.isArray(parsed.items) ||
      parsed.items.length !== INITIAL_CHECKLIST.length
    ) {
      return null;
    }
    const vendorChats: Record<string, VendorChatMessage[]> = {};
    if (parsed.vendorChats && typeof parsed.vendorChats === "object") {
      for (const [key, msgs] of Object.entries(parsed.vendorChats)) {
        if (Array.isArray(msgs)) vendorChats[key] = msgs;
      }
    }
    return {
      items: sanitizeItems(parsed.items),
      messages: sanitizeMessages(
        Array.isArray(parsed.messages) ? parsed.messages : [],
      ),
      greeted: Boolean(parsed.greeted),
      vendorChats,
      points:
        typeof parsed.points === "number" && parsed.points >= 0
          ? parsed.points
          : SIGNUP_POINTS,
      aiPass: Boolean(parsed.aiPass),
      // 시드보다 짧으면(스키마 변경 등) 저장본을 버리고 시드로 되돌린다.
      // 사용자가 새로 쓴 글은 항상 앞쪽에 prepend되므로 길이만 봐도 충분하다.
      communityPosts:
        Array.isArray(parsed.communityPosts) &&
        parsed.communityPosts.length >= SEED_POSTS.length
          ? parsed.communityPosts
          : SEED_POSTS,
      likedPostIds: Array.isArray(parsed.likedPostIds)
        ? parsed.likedPostIds
        : [],
      scrappedPostIds: Array.isArray(parsed.scrappedPostIds)
        ? parsed.scrappedPostIds
        : [],
      favoriteVendorIds: Array.isArray(parsed.favoriteVendorIds)
        ? parsed.favoriteVendorIds
        : [],
      recentlyViewedVendorIds: Array.isArray(parsed.recentlyViewedVendorIds)
        ? parsed.recentlyViewedVendorIds
        : [],
      consultations: Array.isArray(parsed.consultations)
        ? parsed.consultations
        : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return null;
  }
}
// -----------------------------------------------------------------------------

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
  /** 업체 채팅 — 체크리스트 항목 id별 대화 기록 */
  vendorChats: Record<string, VendorChatMessage[]>;
  appendVendorMessages: (itemId: string, msgs: VendorChatMessage[]) => void;
  /** AI 합성용 포인트 (가입 축하 3,000P 지급, mock) */
  points: number;
  /** 스딩 AI 패스 구독 여부 (mock — 구독 중이면 합성 무제한) */
  aiPass: boolean;
  /** 포인트 차감 — 잔액 부족이면 false 반환하고 차감하지 않음 */
  spendPoints: (amount: number) => boolean;
  activateAiPass: () => void;
  /** 커뮤니티 게시글 (시드 + 내가 새로 쓴 글) */
  communityPosts: CommunityPost[];
  /** 내가 좋아요 누른 게시글 id 목록 — 표시 좋아요 수는 post.likeCount + (좋아요 여부) */
  likedPostIds: string[];
  toggleLike: (postId: string) => void;
  /** 내가 스크랩한 게시글 id 목록 — 표시 스크랩 수는 post.scrapCount + (스크랩 여부) */
  scrappedPostIds: string[];
  toggleScrap: (postId: string) => void;
  addCommunityPost: (
    post: Omit<
      CommunityPost,
      "id" | "likeCount" | "scrapCount" | "viewCount" | "comments" | "timestamp"
    >,
  ) => string;
  addComment: (postId: string, text: string) => void;
  /** 내가 찜한 업체 id 목록 */
  favoriteVendorIds: string[];
  toggleFavoriteVendor: (vendorId: string) => void;
  /** 최근 본 업체 id 목록 — 최신순, 최대 12개 */
  recentlyViewedVendorIds: string[];
  trackVendorView: (vendorId: string) => void;
  /** 상담 예약 내역 (mock — 실제 예약 연동 없음) */
  consultations: ConsultationBooking[];
  addConsultation: (
    booking: Omit<ConsultationBooking, "id" | "status" | "createdAt">,
  ) => void;
  /** 앱내 결제 주문 내역 (mock — 실제 청구 없음) */
  orders: ProductOrder[];
  addOrder: (order: Omit<ProductOrder, "id" | "status" | "createdAt">) => void;
  /** 저장된 베타 데이터를 지우고 초기 상태로 되돌림 */
  resetAll: () => void;
}

const MAX_RECENTLY_VIEWED = 12;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ChecklistItem[]>(
    () => loadPersisted()?.items ?? INITIAL_CHECKLIST,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadPersisted()?.messages ?? [],
  );
  const [greeted, setGreeted] = useState(
    () => loadPersisted()?.greeted ?? false,
  );
  const [vendorChats, setVendorChats] = useState<
    Record<string, VendorChatMessage[]>
  >(() => loadPersisted()?.vendorChats ?? {});
  const [points, setPoints] = useState<number>(
    () => loadPersisted()?.points ?? SIGNUP_POINTS,
  );
  const [aiPass, setAiPass] = useState<boolean>(
    () => loadPersisted()?.aiPass ?? false,
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(
    () => loadPersisted()?.communityPosts ?? SEED_POSTS,
  );
  const [likedPostIds, setLikedPostIds] = useState<string[]>(
    () => loadPersisted()?.likedPostIds ?? [],
  );
  const [scrappedPostIds, setScrappedPostIds] = useState<string[]>(
    () => loadPersisted()?.scrappedPostIds ?? [],
  );
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<string[]>(
    () => loadPersisted()?.favoriteVendorIds ?? [],
  );
  const [recentlyViewedVendorIds, setRecentlyViewedVendorIds] = useState<
    string[]
  >(() => loadPersisted()?.recentlyViewedVendorIds ?? []);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>(
    () => loadPersisted()?.consultations ?? [],
  );
  const [orders, setOrders] = useState<ProductOrder[]>(
    () => loadPersisted()?.orders ?? [],
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 상태 변경을 디바운스해서 localStorage에 저장
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const state: PersistedState = {
          items: sanitizeItems(items),
          messages: sanitizeMessages(messages),
          greeted,
          vendorChats,
          points,
          aiPass,
          communityPosts,
          likedPostIds,
          scrappedPostIds,
          favoriteVendorIds,
          recentlyViewedVendorIds,
          consultations,
          orders,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // 저장 실패(용량 초과 등)는 베타에서 무시
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [
    items,
    messages,
    greeted,
    vendorChats,
    points,
    aiPass,
    communityPosts,
    likedPostIds,
    scrappedPostIds,
    favoriteVendorIds,
    recentlyViewedVendorIds,
    consultations,
    orders,
  ]);

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

  const appendVendorMessages = useCallback(
    (itemId: string, msgs: VendorChatMessage[]) => {
      setVendorChats((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] ?? []), ...msgs],
      }));
    },
    [],
  );

  const spendPoints = useCallback(
    (amount: number) => {
      if (points < amount) return false;
      setPoints((prev) => prev - amount);
      return true;
    },
    [points],
  );

  const activateAiPass = useCallback(() => setAiPass(true), []);

  const toggleLike = useCallback((postId: string) => {
    setLikedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  }, []);

  const addCommunityPost = useCallback(
    (
      post: Omit<
        CommunityPost,
        | "id"
        | "likeCount"
        | "scrapCount"
        | "viewCount"
        | "comments"
        | "timestamp"
      >,
    ) => {
      const id = uid();
      setCommunityPosts((prev) => [
        {
          ...post,
          id,
          likeCount: 0,
          scrapCount: 0,
          viewCount: 0,
          comments: [],
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      return id;
    },
    [],
  );

  const toggleScrap = useCallback((postId: string) => {
    setScrappedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  }, []);

  const toggleFavoriteVendor = useCallback((vendorId: string) => {
    setFavoriteVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId],
    );
  }, []);

  const trackVendorView = useCallback((vendorId: string) => {
    setRecentlyViewedVendorIds((prev) =>
      [vendorId, ...prev.filter((id) => id !== vendorId)].slice(
        0,
        MAX_RECENTLY_VIEWED,
      ),
    );
  }, []);

  const addConsultation = useCallback(
    (booking: Omit<ConsultationBooking, "id" | "status" | "createdAt">) => {
      setConsultations((prev) => [
        {
          ...booking,
          id: uid(),
          status: "대기중",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const addOrder = useCallback(
    (order: Omit<ProductOrder, "id" | "status" | "createdAt">) => {
      setOrders((prev) => [
        {
          ...order,
          id: uid(),
          status: "결제완료",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const addComment = useCallback((postId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const comment: CommunityComment = {
      id: uid(),
      author: USER_NAME,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
      ),
    );
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
    setItems(INITIAL_CHECKLIST);
    setMessages([]);
    setGreeted(false);
    setVendorChats({});
    setPoints(SIGNUP_POINTS);
    setAiPass(false);
    setCommunityPosts(SEED_POSTS);
    setLikedPostIds([]);
    setScrappedPostIds([]);
    setFavoriteVendorIds([]);
    setRecentlyViewedVendorIds([]);
    setConsultations([]);
    setOrders([]);
    showToast("베타 데이터를 초기 상태로 되돌렸어요");
  }, [showToast]);

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
      vendorChats,
      appendVendorMessages,
      points,
      aiPass,
      spendPoints,
      activateAiPass,
      communityPosts,
      likedPostIds,
      toggleLike,
      scrappedPostIds,
      toggleScrap,
      addCommunityPost,
      addComment,
      favoriteVendorIds,
      toggleFavoriteVendor,
      recentlyViewedVendorIds,
      trackVendorView,
      consultations,
      addConsultation,
      orders,
      addOrder,
      resetAll,
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
      vendorChats,
      appendVendorMessages,
      points,
      aiPass,
      spendPoints,
      activateAiPass,
      communityPosts,
      likedPostIds,
      toggleLike,
      scrappedPostIds,
      toggleScrap,
      addCommunityPost,
      addComment,
      favoriteVendorIds,
      toggleFavoriteVendor,
      recentlyViewedVendorIds,
      trackVendorView,
      consultations,
      addConsultation,
      orders,
      addOrder,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
