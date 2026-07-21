import type { AdBanner } from "../types";

// 디스플레이 광고 mock — 전부 가상의 광고주/자체 프로모션이며 실제 광고 연동은 없다.
// 홈 히어로 캐러셀용 (큰 배너, 3장)
export const HOME_HERO_ADS: AdBanner[] = [
  {
    id: "ad-home-1",
    sponsor: "스딩",
    title: "가입 축하 3,000P 지급",
    sub: "AI 드레스·웨딩홀 합성에 바로 써보세요",
    tone: "brand",
    href: "/ai/dress",
    badgeLabel: "이벤트",
  },
  {
    id: "ad-home-2",
    sponsor: "스딩 브라이덜페어 2027",
    title: "3월 강남, 스딩 단독 초청 예비부부 모집",
    sub: "정찰제 업체 40곳을 한 자리에서",
    imageUrl: "/mock/hall-1.jpg",
    tone: "dark",
    href: "/services",
  },
  {
    id: "ad-home-3",
    sponsor: "루나주얼리",
    title: "예물 다이아 최대 30% 정찰 할인",
    sub: "스딩 제휴 회원 한정",
    imageUrl: "/mock/dress-2.jpg",
    tone: "dark",
    href: "/vendors/예물",
  },
];

// 전체서비스 상단 프로모 배너 (1장)
export const SERVICES_PROMO_AD: AdBanner = {
  id: "ad-services-1",
  sponsor: "스딩 AI 패스",
  title: "월 9,900원, AI 합성 무제한",
  sub: "드레스·웨딩홀 미리보기를 마음껏",
  tone: "brand",
  href: "/ai/dress",
  badgeLabel: "구독",
};

// 피드 중간 삽입용 네이티브 광고 (홈/커뮤니티에서 순환 노출)
export const FEED_NATIVE_ADS: AdBanner[] = [
  {
    id: "ad-feed-1",
    sponsor: "웰스브라이드",
    title: "결혼 준비 자금, 낮은 이자로 미리 계획하세요",
    sub: "예비부부 전용 상담",
    imageUrl: "",
    tone: "light",
    href: "/community",
    badgeLabel: "광고",
  },
  {
    id: "ad-feed-2",
    sponsor: "루나주얼리",
    title: "커플링 각인 무료 이벤트 진행 중",
    sub: "정찰가 그대로, 각인비 0원",
    imageUrl: "/mock/dress-2.jpg",
    tone: "dark",
    href: "/vendors/예물",
    badgeLabel: "광고",
  },
  {
    id: "ad-feed-3",
    sponsor: "스딩",
    title: "AI 플래너에게 예산부터 물어보세요",
    sub: "무료 상담, 24시간 응답",
    tone: "brand",
    href: "/chat",
    badgeLabel: "프로모션",
  },
];

export function feedAdForIndex(i: number): AdBanner {
  return FEED_NATIVE_ADS[i % FEED_NATIVE_ADS.length];
}
