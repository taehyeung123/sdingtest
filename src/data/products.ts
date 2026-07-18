import type { VendorProduct } from "../types";

// AI 합성 1회 비용 (mock 포인트)
export const SYNTHESIS_COST = 500;

// 업체별 등록 상품 mock — 실제 상품 이미지 대신 준비된 사진 + CSS 필터 변형
export const VENDOR_PRODUCTS: VendorProduct[] = [
  // ---- 드레스 (AI 드레스 피팅에서 선택) ----
  {
    id: "p-dress-1a",
    vendorId: "v-dress-1",
    name: "끌레르 시그니처 A라인",
    imageUrl: "/mock/dress-1.jpg",
    filter: "brightness(1.04) contrast(1.03)",
    priceLabel: "대여 180만원",
  },
  {
    id: "p-dress-1b",
    vendorId: "v-dress-1",
    name: "로제 벨라인",
    imageUrl: "/mock/dress-1.jpg",
    filter: "sepia(0.14) brightness(1.05)",
    priceLabel: "대여 210만원",
  },
  {
    id: "p-dress-1c",
    vendorId: "v-dress-1",
    name: "뮤제 슬립 미니멀",
    imageUrl: "/mock/dress-2.jpg",
    filter: "grayscale(0.25) brightness(1.06)",
    priceLabel: "대여 150만원",
  },
  {
    id: "p-dress-2a",
    vendorId: "v-dress-2",
    name: "베르아 머메이드",
    imageUrl: "/mock/dress-2.jpg",
    filter: "brightness(1.03) saturate(1.1)",
    priceLabel: "대여 150만원",
  },
  {
    id: "p-dress-2b",
    vendorId: "v-dress-2",
    name: "아뜰리에 오프숄더",
    imageUrl: "/mock/dress-1.jpg",
    filter: "hue-rotate(-6deg) saturate(1.12)",
    priceLabel: "대여 170만원",
  },
  {
    id: "p-dress-3a",
    vendorId: "v-dress-3",
    name: "로잘린 로열 볼가운",
    imageUrl: "/mock/dress-1.jpg",
    filter: "sepia(0.1) contrast(1.06)",
    priceLabel: "대여 260만원",
  },
  {
    id: "p-dress-3b",
    vendorId: "v-dress-3",
    name: "프리미어 머메이드",
    imageUrl: "/mock/dress-2.jpg",
    filter: "brightness(1.07) contrast(1.02)",
    priceLabel: "대여 240만원",
  },
  {
    id: "p-dress-4a",
    vendorId: "v-dress-4",
    name: "뮤즈 빈티지 레이스",
    imageUrl: "/mock/dress-2.jpg",
    filter: "sepia(0.22) brightness(1.02)",
    priceLabel: "대여 135만원",
  },
  {
    id: "p-dress-4b",
    vendorId: "v-dress-4",
    name: "모던 미니멀 라인",
    imageUrl: "/mock/dress-1.jpg",
    filter: "grayscale(0.35) brightness(1.05)",
    priceLabel: "대여 120만원",
  },

  // ---- 웨딩홀 (AI 웨딩홀 미리보기에서 선택) ----
  {
    id: "p-hall-1a",
    vendorId: "v-hall-1",
    name: "그랜드 채플홀",
    imageUrl: "/mock/hall-1.jpg",
    filter: "brightness(1.04) contrast(1.02)",
    priceLabel: "대관 2,800만원~",
  },
  {
    id: "p-hall-1b",
    vendorId: "v-hall-1",
    name: "가든 스퀘어",
    imageUrl: "/mock/hall-1.jpg",
    filter: "hue-rotate(8deg) saturate(1.15) brightness(1.03)",
    priceLabel: "대관 3,100만원~",
  },
  {
    id: "p-hall-2a",
    vendorId: "v-hall-2",
    name: "라루체 화이트홀",
    imageUrl: "/mock/hall-1.jpg",
    filter: "brightness(1.09) contrast(0.98)",
    priceLabel: "대관 2,300만원~",
  },
  {
    id: "p-hall-2b",
    vendorId: "v-hall-2",
    name: "크리스탈 볼룸",
    imageUrl: "/mock/hall-1.jpg",
    filter: "sepia(0.12) brightness(1.05)",
    priceLabel: "대관 2,500만원~",
  },
  {
    id: "p-hall-3a",
    vendorId: "v-hall-3",
    name: "컨벤션 A홀",
    imageUrl: "/mock/hall-1.jpg",
    filter: "grayscale(0.2) brightness(1.04)",
    priceLabel: "대관 1,900만원~",
  },
  {
    id: "p-hall-3b",
    vendorId: "v-hall-3",
    name: "스카이 볼룸",
    imageUrl: "/mock/hall-1.jpg",
    filter: "hue-rotate(-8deg) brightness(1.06)",
    priceLabel: "대관 2,100만원~",
  },
  {
    id: "p-hall-4a",
    vendorId: "v-hall-4",
    name: "시크릿 가든",
    imageUrl: "/mock/hall-1.jpg",
    filter: "saturate(1.2) brightness(1.02)",
    priceLabel: "대관 3,200만원~",
  },
  {
    id: "p-hall-4b",
    vendorId: "v-hall-4",
    name: "글라스하우스",
    imageUrl: "/mock/hall-1.jpg",
    filter: "brightness(1.1) contrast(1.04)",
    priceLabel: "대관 3,500만원~",
  },
  {
    id: "p-hall-5a",
    vendorId: "v-hall-5",
    name: "루체르 메인홀",
    imageUrl: "/mock/hall-1.jpg",
    filter: "sepia(0.08) contrast(1.05)",
    priceLabel: "대관 2,100만원~",
  },
];

export function productsByVendor(vendorId: string): VendorProduct[] {
  return VENDOR_PRODUCTS.filter((p) => p.vendorId === vendorId);
}
