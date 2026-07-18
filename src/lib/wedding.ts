import type {
  ChecklistGroup,
  ChecklistItem,
  ProgressSummary,
} from "../types";

// mock 사용자 프로필
export const USER_NAME = "수민";
export const PARTNER_NAME = "도윤"; // mock 예비 배우자
export const WEDDING_DATE = "2027-01-16"; // mock 예식일 (토요일)

export const GROUP_ORDER: ChecklistGroup[] = [
  "예산·컨셉",
  "업체 계약",
  "청첩장 세부 진행",
  "게스트·의전 준비",
  "본식 콘텐츠 준비",
  "촬영 후속 작업",
  "신부 컨디션 관리",
  "최종 마무리",
];

// 예식일까지 남은 일수 (자정 기준)
export function daysUntilWedding(from: Date = new Date()): number {
  const wedding = new Date(`${WEDDING_DATE}T00:00:00`);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((wedding.getTime() - today.getTime()) / 86_400_000);
}

export function formatDday(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

export function formatWeddingDate(): string {
  const d = new Date(`${WEDDING_DATE}T00:00:00`);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

export function progressSummary(items: ChecklistItem[]): ProgressSummary {
  const groupProgress = GROUP_ORDER.map((groupName) => {
    const inGroup = items.filter((it) => it.group === groupName);
    return {
      groupName,
      done: inGroup.filter((it) => it.isDone).length,
      total: inGroup.length,
    };
  });
  return {
    totalCount: items.length,
    doneCount: items.filter((it) => it.isDone).length,
    groupProgress,
  };
}

export function progressPercent(summary: ProgressSummary): number {
  if (summary.totalCount === 0) return 0;
  return Math.round((summary.doneCount / summary.totalCount) * 100);
}

// 미완료 항목을 권장 시점(recommendedDday가 클수록 먼저 해야 함) 순으로 정렬
export function nextTodos(items: ChecklistItem[], count = 3): ChecklistItem[] {
  return items
    .filter((it) => !it.isDone)
    .sort((a, b) => (b.recommendedDday ?? 0) - (a.recommendedDday ?? 0))
    .slice(0, count);
}

// "다음 할 일" 카드용 D-day 라벨: 권장 완료 시점까지 남은 날
export function todoDdayLabel(item: ChecklistItem): string {
  if (item.recommendedDday == null) return "";
  const left = daysUntilWedding() - item.recommendedDday;
  if (left <= 0) return "지금 하면 좋아요";
  return `D-${left}`;
}
