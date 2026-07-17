import type { ChatMessage, ChecklistItem, VendorCategory } from "../types";
import { uid } from "./utils";
import { vendorsByCategory } from "../data/vendors";
import {
  USER_NAME,
  daysUntilWedding,
  formatDday,
  formatWeddingDate,
  nextTodos,
  progressPercent,
  progressSummary,
} from "./wedding";

// AI 웨딩플래너 mock 응답 엔진 (기획서 10)
// 완전 자유 대화가 아니라 키워드 매칭 기반 규칙 응답. 위 규칙일수록 우선한다.

type AiMessageInit = Omit<ChatMessage, "id" | "sender" | "timestamp">;

function ai(init: AiMessageInit): ChatMessage {
  return {
    id: uid(),
    sender: "ai",
    timestamp: new Date().toISOString(),
    ...init,
  };
}

// 카테고리 키워드 매핑 — 순서 중요: 더 구체적인 키워드를 먼저 매칭한다.
const CATEGORY_RULES: { keywords: string[]; category: VendorCategory }[] = [
  { keywords: ["헤어변형"], category: "헤어변형" },
  { keywords: ["본식스냅"], category: "본식스냅" },
  { keywords: ["데이트", "가봉", "아이폰"], category: "스냅(데이트·가봉·아이폰)" },
  { keywords: ["스냅"], category: "본식스냅" },
  { keywords: ["영상", "dvd", "디비디"], category: "영상(DVD촬영)" },
  { keywords: ["웨딩홀", "홀 ", "식장"], category: "웨딩홀" },
  { keywords: ["스튜디오", "촬영"], category: "스튜디오" },
  { keywords: ["드레스"], category: "드레스" },
  { keywords: ["메이크업", "헤어"], category: "헤어&메이크업" },
  { keywords: ["부케"], category: "부케" },
  { keywords: ["한복"], category: "한복" },
  { keywords: ["예물", "반지"], category: "예물" },
  { keywords: ["예복", "정장", "수트"], category: "예복" },
  { keywords: ["청첩장"], category: "청첩장" },
  { keywords: ["사회자", "사회", "mc"], category: "사회자" },
];

const PROGRESS_KEYWORDS = [
  "뭐 해",
  "뭐해",
  "다음",
  "할 일",
  "할일",
  "일정",
  "체크리스트",
  "진행",
];
const BUDGET_KEYWORDS = ["예산", "비용", "가격", "얼마"];
const DDAY_KEYWORDS = ["디데이", "d-day", "며칠", "언제"];
const GREETING_KEYWORDS = ["안녕", "하이", "반가"];
const THANKS_KEYWORDS = ["고마", "감사"];

const DEFAULT_QUICK_REPLIES = [
  "웨딩홀 추천해줘",
  "지금 뭐 해야 해?",
  "스드메가 뭐예요?",
];

function nudgeMessage(items: ChecklistItem[]): ChatMessage | null {
  const next = nextTodos(items, 1)[0];
  if (!next) return null;
  return ai({
    type: "checklistNudge",
    nudge: { title: next.title, checklistItemId: next.id },
  });
}

// 첫 진입 인사 (Chat.tsx에서 greeted가 false일 때 1회 사용)
export function greetingMessages(): ChatMessage[] {
  return [
    ai({
      type: "quickReplies",
      text: `안녕하세요 ${USER_NAME}님! 예산과 지역, 원하시는 스타일을 알려주시면 딱 맞는 곳을 찾아드릴게요.`,
      quickReplies: DEFAULT_QUICK_REPLIES,
    }),
  ];
}

export function getAiResponses(
  userText: string,
  ctx: { items: ChecklistItem[] },
): ChatMessage[] {
  const text = userText.toLowerCase();
  const has = (keywords: string[]) => keywords.some((k) => text.includes(k));

  // 1) 카테고리 추천
  const rule = CATEGORY_RULES.find((r) => has(r.keywords));
  if (rule) {
    const vendors = vendorsByCategory(rule.category).slice(0, 3);
    return [
      ai({
        type: "vendorCard",
        text: `조건에 맞는 ${rule.category} ${vendors.length}곳을 찾았어요. 모두 정찰제라 추가금 걱정이 없어요.`,
        vendors,
      }),
      ai({
        type: "quickReplies",
        quickReplies: ["체크리스트에 등록할래", "지금 뭐 해야 해?"],
      }),
    ];
  }

  // 2) 체크리스트 등록 안내
  if (text.includes("체크리스트에 등록")) {
    const messages = [
      ai({
        type: "text",
        text: "체크리스트에서 해당 항목을 탭하면 업체 등록으로 이어져요.",
      }),
    ];
    const nudge = nudgeMessage(ctx.items);
    if (nudge) messages.push(nudge);
    return messages;
  }

  // 3) 진행 상황 / 다음 할 일
  if (has(PROGRESS_KEYWORDS)) {
    const summary = progressSummary(ctx.items);
    const percent = progressPercent(summary);
    const nudge = nudgeMessage(ctx.items);
    const messages: ChatMessage[] = [
      ai({
        type: "text",
        text: nudge
          ? `전체 ${summary.totalCount}개 중 ${summary.doneCount}개 완료(${percent}%)! 다음으로 이걸 추천해요.`
          : `전체 ${summary.totalCount}개 중 ${summary.doneCount}개 완료(${percent}%)! 모든 준비를 마쳤어요. 정말 수고 많았어요.`,
      }),
    ];
    if (nudge) messages.push(nudge);
    messages.push(
      ai({
        type: "quickReplies",
        quickReplies: ["웨딩홀 추천해줘", "본식스냅 추천해줘"],
      }),
    );
    return messages;
  }

  // 4) 스드메 설명
  if (text.includes("스드메")) {
    return [
      ai({
        type: "quickReplies",
        text: "스드메는 스튜디오·드레스·메이크업의 줄임말이에요. 보통 예식 6~8개월 전에 묶어서 계약하면 동선과 비용 관리가 편해요.",
        quickReplies: ["스튜디오 추천해줘", "드레스 추천해줘", "메이크업 추천해줘"],
      }),
    ];
  }

  // 5) 예산
  if (has(BUDGET_KEYWORDS)) {
    return [
      ai({
        type: "quickReplies",
        text: "커플마다 다르지만 스딩 이용 커플 기준 스드메 평균은 250~400만원대예요. 정찰제 가격이라 견적 비교가 쉬워요. (베타 참고용 수치)",
        quickReplies: ["웨딩홀 추천해줘", "지금 뭐 해야 해?"],
      }),
    ];
  }

  // 6) 디데이
  if (has(DDAY_KEYWORDS)) {
    return [
      ai({
        type: "quickReplies",
        text: `${formatWeddingDate()} 예식까지 ${formatDday(daysUntilWedding())} 남았어요. 오늘도 하나씩 준비해봐요.`,
        quickReplies: ["지금 뭐 해야 해?", "웨딩홀 추천해줘"],
      }),
    ];
  }

  // 7) 인사
  if (has(GREETING_KEYWORDS)) {
    return [
      ai({
        type: "quickReplies",
        text: `안녕하세요 ${USER_NAME}님! 오늘은 어떤 준비를 도와드릴까요?`,
        quickReplies: DEFAULT_QUICK_REPLIES,
      }),
    ];
  }

  // 8) 감사
  if (has(THANKS_KEYWORDS)) {
    return [
      ai({
        type: "text",
        text: "도움이 됐다니 기뻐요. 또 궁금한 게 있으면 언제든 물어봐주세요.",
      }),
    ];
  }

  // 9) fallback
  return [
    ai({
      type: "quickReplies",
      text: "아직 베타라 그 질문은 배우는 중이에요. 대신 이런 걸 도와드릴 수 있어요.",
      quickReplies: ["웨딩홀 추천해줘", "지금 뭐 해야 해?", "예산이 궁금해"],
    }),
  ];
}
