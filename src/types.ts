// SDING AI 플래너 베타 — 데이터 모델 (기획서 6장)

export type ChecklistGroup =
  | "예산·컨셉"
  | "업체 계약"
  | "청첩장 세부 진행"
  | "게스트·의전 준비"
  | "본식 콘텐츠 준비"
  | "촬영 후속 작업"
  | "신부 컨디션 관리"
  | "최종 마무리";

// 업체 카테고리 — 14종
export type VendorCategory =
  | "웨딩홀"
  | "스튜디오"
  | "드레스"
  | "헤어&메이크업"
  | "헤어변형"
  | "본식스냅"
  | "스냅(데이트·가봉·아이폰)"
  | "영상(DVD촬영)"
  | "예물"
  | "예복"
  | "한복"
  | "부케"
  | "청첩장"
  | "사회자";

export type VendorStatus = "상담중" | "계약완료" | "완료(업체 미등록)";

// 체크리스트에 등록된 업체
export interface RegisteredVendor {
  status: VendorStatus;
  vendorName?: string; // "완료(업체 미등록)"인 경우 없을 수 있음
  productPhotoUrl?: string; // 로컬 blob URL (mock)
  contractPhotoUrl?: string; // 로컬 blob URL (mock)
  memo?: string;
  linkedVendorId?: string; // "업체 보러가기"에서 선택한 경우 VendorSummary.id
  registeredAt: string;
}

// 체크리스트 항목
export interface ChecklistItem {
  id: string;
  group: ChecklistGroup;
  title: string;
  category: VendorCategory | null; // null이면 단순 체크형 항목
  isDone: boolean;
  memo?: string;
  vendor?: RegisteredVendor; // category가 있는 항목에서만 사용
  recommendedDday?: number; // 권장 완료 시점 (예식 D-n일 전)
}

// 대시보드 진행률 요약 (ChecklistItem 배열에서 파생)
export interface ProgressSummary {
  totalCount: number;
  doneCount: number;
  groupProgress: { groupName: ChecklistGroup; done: number; total: number }[];
}

// 업체 요약 (추천 카드 / 업체 보러가기 리스트용)
export interface VendorSummary {
  id: string;
  name: string;
  category: VendorCategory;
  thumbnailUrl: string; // 빈 문자열이면 플레이스홀더 렌더링
  priceLabel: string;
  rating: number;
  reviewCount: number;
  moodTags: string[];
}

// 채팅 메시지
export type ChatMessageType =
  | "text"
  | "quickReplies"
  | "vendorCard"
  | "checklistNudge"
  | "synthesisResult";

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  type: ChatMessageType;
  text?: string;
  quickReplies?: string[];
  vendors?: VendorSummary[];
  nudge?: { title: string; checklistItemId: string };
  synthesis?: { imageUrl: string; label: string };
  timestamp: string;
}
