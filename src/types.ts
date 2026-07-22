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

// VendorCategory 14종의 런타임 배열 (카테고리 그리드 렌더링용)
export const VENDOR_CATEGORIES: VendorCategory[] = [
  "웨딩홀",
  "스튜디오",
  "드레스",
  "헤어&메이크업",
  "헤어변형",
  "본식스냅",
  "스냅(데이트·가봉·아이폰)",
  "영상(DVD촬영)",
  "예물",
  "예복",
  "한복",
  "부케",
  "청첩장",
  "사회자",
];

// 지역 — 업체 필터/검색용 (전체서비스 이커머스 지역 필터, 기획서 범위 밖 자체 설계)
export type Region =
  | "서울"
  | "경기·인천"
  | "대전·충청"
  | "대구·경북"
  | "부산·울산·경남"
  | "광주·전남"
  | "강원"
  | "제주";

export const VENDOR_REGIONS: Region[] = [
  "서울",
  "경기·인천",
  "대전·충청",
  "대구·경북",
  "부산·울산·경남",
  "광주·전남",
  "강원",
  "제주",
];

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
  region: Region;
  thumbnailUrl: string; // 빈 문자열이면 플레이스홀더 렌더링
  priceLabel: string;
  /** priceLabel의 숫자값(만원 단위) — 가격순 정렬용. 가격 비공개 업체는 큰 값으로 둬서 오름차순 정렬 시 맨 뒤로 */
  priceFrom: number;
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

// 업체 채팅 메시지 (플로팅 채팅 버튼 → 계약 업체와 1:1 대화, mock)
export interface VendorChatMessage {
  id: string;
  from: "user" | "vendor";
  text: string;
  timestamp: string;
}

// 업체에 등록된 상품 (AI 합성에서 선택하는 드레스/웨딩홀, mock)
export interface VendorProduct {
  id: string;
  vendorId: string; // VendorSummary.id
  name: string;
  imageUrl: string;
  /** mock 변형용 CSS filter — 실제 합성 대신 톤을 달리해 노출 */
  filter?: string;
  priceLabel?: string;
}

// 디스플레이 광고 (홈/전체서비스/커뮤니티 노출, 전부 mock — 실제 광고 연동 없음)
export interface AdBanner {
  id: string;
  sponsor: string;
  title: string;
  sub: string;
  /** 배경에 쓸 mock 이미지. 없으면 브랜드 컬러 카드로 렌더링 */
  imageUrl?: string;
  /** imageUrl이 있을 때 텍스트 대비를 위한 톤 */
  tone: "light" | "dark" | "brand";
  href: string;
  /** "AD" 배지 대신 보여줄 라벨 (기본: "광고") */
  badgeLabel?: string;
}

// 커뮤니티 — 카테고리
export type CommunityCategory = "후기" | "고민상담" | "자유" | "정보공유";

export interface CommunityComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  category: CommunityCategory;
  author: string;
  /** "D-45 예비신부" 같은 저자 뱃지 */
  authorBadge: string;
  title: string;
  body: string;
  imageUrls: string[];
  /** 후기글에서 업체를 태그한 경우 */
  vendorTag?: { vendorId: string; vendorName: string; category: VendorCategory };
  /** 글이 다루는 지역(선택) — 커뮤니티 지역 뱃지·필터용 */
  region?: Region;
  /** 자유 해시태그 (예: ["정찰제", "가성비"]) */
  tags: string[];
  /** 시드 데이터 기준 좋아요 수 (내 좋아요 여부는 AppContext의 likedPostIds로 별도 관리) */
  likeCount: number;
  /** 시드 데이터 기준 스크랩 수 (내 스크랩 여부는 AppContext의 scrappedPostIds로 별도 관리) */
  scrapCount: number;
  /** 조회수 — mock 고정값, 실시간 증가 없음 */
  viewCount: number;
  comments: CommunityComment[];
  timestamp: string;
}
