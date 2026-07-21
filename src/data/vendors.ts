import type { VendorCategory, VendorSummary } from "../types";

// 스딩 등록 업체 mock (전 카테고리 커버, 실제 업체 아님)
export const VENDORS: VendorSummary[] = [
  // 웨딩홀
  {
    id: "v-hall-1",
    name: "더채플앳청담",
    category: "웨딩홀",
    thumbnailUrl: "/mock/hall-1.jpg",
    priceLabel: "2,800만원~",
    rating: 4.9,
    reviewCount: 214,
    moodTags: ["채플", "화이트톤", "청담"],
  },
  {
    id: "v-hall-2",
    name: "라루체 화이트홀",
    category: "웨딩홀",
    thumbnailUrl: "/mock/hall-1.jpg",
    priceLabel: "2,300만원~",
    rating: 4.7,
    reviewCount: 156,
    moodTags: ["단독홀", "밝은분위기"],
  },
  {
    id: "v-hall-3",
    name: "그랜드힐 컨벤션",
    category: "웨딩홀",
    thumbnailUrl: "",
    priceLabel: "1,900만원~",
    rating: 4.6,
    reviewCount: 189,
    moodTags: ["대형홀", "역세권"],
  },
  {
    id: "v-hall-4",
    name: "메종 드 가든",
    category: "웨딩홀",
    thumbnailUrl: "",
    priceLabel: "3,200만원~",
    rating: 4.8,
    reviewCount: 98,
    moodTags: ["야외", "가든", "스몰웨딩"],
  },
  {
    id: "v-hall-5",
    name: "루체르 스퀘어",
    category: "웨딩홀",
    thumbnailUrl: "",
    priceLabel: "2,100만원~",
    rating: 4.5,
    reviewCount: 143,
    moodTags: ["모던", "호텔식"],
  },

  // 스튜디오
  {
    id: "v-studio-1",
    name: "르블랑 스튜디오",
    category: "스튜디오",
    thumbnailUrl: "/mock/dress-2.jpg",
    priceLabel: "120만원",
    rating: 4.9,
    reviewCount: 128,
    moodTags: ["청담", "인물중심"],
  },
  {
    id: "v-studio-2",
    name: "오브제 스튜디오",
    category: "스튜디오",
    thumbnailUrl: "",
    priceLabel: "95만원",
    rating: 4.7,
    reviewCount: 211,
    moodTags: ["내추럴", "필름감성"],
  },
  {
    id: "v-studio-3",
    name: "테일러그라피",
    category: "스튜디오",
    thumbnailUrl: "",
    priceLabel: "140만원",
    rating: 4.8,
    reviewCount: 87,
    moodTags: ["시네마틱", "야외촬영"],
  },
  {
    id: "v-studio-4",
    name: "모노클 스튜디오",
    category: "스튜디오",
    thumbnailUrl: "",
    priceLabel: "88만원",
    rating: 4.6,
    reviewCount: 164,
    moodTags: ["미니멀", "가성비"],
  },

  // 드레스
  {
    id: "v-dress-1",
    name: "끌레르 브라이덜",
    category: "드레스",
    thumbnailUrl: "/mock/dress-1.jpg",
    priceLabel: "180만원~",
    rating: 4.9,
    reviewCount: 96,
    moodTags: ["비즈", "A라인"],
  },
  {
    id: "v-dress-2",
    name: "베르아 드레스",
    category: "드레스",
    thumbnailUrl: "/mock/dress-2.jpg",
    priceLabel: "150만원~",
    rating: 4.7,
    reviewCount: 132,
    moodTags: ["머메이드", "심플"],
  },
  {
    id: "v-dress-3",
    name: "로잘린 브라이덜",
    category: "드레스",
    thumbnailUrl: "",
    priceLabel: "210만원~",
    rating: 4.8,
    reviewCount: 74,
    moodTags: ["수입드레스", "럭셔리"],
  },
  {
    id: "v-dress-4",
    name: "뮤즈 드레스",
    category: "드레스",
    thumbnailUrl: "",
    priceLabel: "135만원~",
    rating: 4.6,
    reviewCount: 118,
    moodTags: ["빈티지", "레이스"],
  },

  // 헤어&메이크업
  {
    id: "v-hm-1",
    name: "제이로사 뷰티",
    category: "헤어&메이크업",
    thumbnailUrl: "",
    priceLabel: "70만원",
    rating: 4.8,
    reviewCount: 203,
    moodTags: ["청담", "물광메이크업"],
  },
  {
    id: "v-hm-2",
    name: "아뜰리에 수",
    category: "헤어&메이크업",
    thumbnailUrl: "",
    priceLabel: "55만원",
    rating: 4.7,
    reviewCount: 176,
    moodTags: ["내추럴", "합리적"],
  },
  {
    id: "v-hm-3",
    name: "블랑쉬 헤어메이크업",
    category: "헤어&메이크업",
    thumbnailUrl: "",
    priceLabel: "65만원",
    rating: 4.9,
    reviewCount: 145,
    moodTags: ["또렷한눈매", "고정력"],
  },

  // 헤어변형
  {
    id: "v-hair-1",
    name: "살롱 드 마리",
    category: "헤어변형",
    thumbnailUrl: "",
    priceLabel: "15만원~",
    rating: 4.7,
    reviewCount: 89,
    moodTags: ["볼륨매직", "손상최소"],
  },
  {
    id: "v-hair-2",
    name: "헤르츠 헤어",
    category: "헤어변형",
    thumbnailUrl: "",
    priceLabel: "12만원~",
    rating: 4.6,
    reviewCount: 67,
    moodTags: ["뿌리볼륨", "예약제"],
  },

  // 본식스냅
  {
    id: "v-snap-1",
    name: "딥포커스 스냅",
    category: "본식스냅",
    thumbnailUrl: "/mock/hall-1.jpg",
    priceLabel: "80만원",
    rating: 4.9,
    reviewCount: 154,
    moodTags: ["2인촬영", "원본전체"],
  },
  {
    id: "v-snap-2",
    name: "라이트룸 스냅",
    category: "본식스냅",
    thumbnailUrl: "",
    priceLabel: "65만원",
    rating: 4.8,
    reviewCount: 132,
    moodTags: ["밝은보정", "빠른전달"],
  },
  {
    id: "v-snap-3",
    name: "프레임원 스냅",
    category: "본식스냅",
    thumbnailUrl: "",
    priceLabel: "55만원",
    rating: 4.6,
    reviewCount: 98,
    moodTags: ["1인촬영", "가성비"],
  },

  // 스냅(데이트·가봉·아이폰)
  {
    id: "v-dsnap-1",
    name: "무드필름",
    category: "스냅(데이트·가봉·아이폰)",
    thumbnailUrl: "",
    priceLabel: "25만원~",
    rating: 4.8,
    reviewCount: 76,
    moodTags: ["데이트스냅", "감성"],
  },
  {
    id: "v-dsnap-2",
    name: "어니언 아이폰스냅",
    category: "스냅(데이트·가봉·아이폰)",
    thumbnailUrl: "",
    priceLabel: "18만원~",
    rating: 4.7,
    reviewCount: 112,
    moodTags: ["아이폰스냅", "자연스러움"],
  },

  // 영상(DVD촬영)
  {
    id: "v-dvd-1",
    name: "시네마틱웨딩 필름",
    category: "영상(DVD촬영)",
    thumbnailUrl: "",
    priceLabel: "90만원",
    rating: 4.8,
    reviewCount: 88,
    moodTags: ["4K", "하이라이트"],
  },
  {
    id: "v-dvd-2",
    name: "러브레터 필름",
    category: "영상(DVD촬영)",
    thumbnailUrl: "",
    priceLabel: "70만원",
    rating: 4.7,
    reviewCount: 64,
    moodTags: ["세리머니", "풀영상"],
  },

  // 예물
  {
    id: "v-jewel-1",
    name: "골드앤 주얼리",
    category: "예물",
    thumbnailUrl: "",
    priceLabel: "상담 후 안내",
    rating: 4.7,
    reviewCount: 52,
    moodTags: ["커플링", "종로"],
  },
  {
    id: "v-jewel-2",
    name: "루미에르 다이아",
    category: "예물",
    thumbnailUrl: "",
    priceLabel: "상담 후 안내",
    rating: 4.8,
    reviewCount: 41,
    moodTags: ["프로포즈링", "GIA"],
  },

  // 예복
  {
    id: "v-suit-1",
    name: "클래시코 수트",
    category: "예복",
    thumbnailUrl: "",
    priceLabel: "80만원~",
    rating: 4.7,
    reviewCount: 66,
    moodTags: ["맞춤정장", "클래식"],
  },
  {
    id: "v-suit-2",
    name: "젠틀맨 테일러",
    category: "예복",
    thumbnailUrl: "",
    priceLabel: "95만원~",
    rating: 4.8,
    reviewCount: 49,
    moodTags: ["세미맞춤", "이태리원단"],
  },

  // 한복
  {
    id: "v-hanbok-1",
    name: "담연 한복",
    category: "한복",
    thumbnailUrl: "",
    priceLabel: "60만원~",
    rating: 4.8,
    reviewCount: 58,
    moodTags: ["맞춤한복", "고급원단"],
  },
  {
    id: "v-hanbok-2",
    name: "한올 한복",
    category: "한복",
    thumbnailUrl: "",
    priceLabel: "45만원~",
    rating: 4.6,
    reviewCount: 37,
    moodTags: ["대여", "모던한복"],
  },

  // 부케
  {
    id: "v-bouquet-1",
    name: "플뢰르 아뜰리에",
    category: "부케",
    thumbnailUrl: "",
    priceLabel: "15만원~",
    rating: 4.9,
    reviewCount: 94,
    moodTags: ["생화", "맞춤제작"],
  },
  {
    id: "v-bouquet-2",
    name: "보타닉 부케",
    category: "부케",
    thumbnailUrl: "",
    priceLabel: "12만원~",
    rating: 4.7,
    reviewCount: 61,
    moodTags: ["드라이플라워", "보존부케"],
  },

  // 청첩장
  {
    id: "v-invite-1",
    name: "달페이퍼",
    category: "청첩장",
    thumbnailUrl: "",
    priceLabel: "8만원~",
    rating: 4.8,
    reviewCount: 172,
    moodTags: ["셀프조판", "모바일연동"],
  },
  {
    id: "v-invite-2",
    name: "페이퍼모먼트",
    category: "청첩장",
    thumbnailUrl: "",
    priceLabel: "10만원~",
    rating: 4.7,
    reviewCount: 138,
    moodTags: ["레터프레스", "감성"],
  },

  // 사회자
  {
    id: "v-mc-1",
    name: "김민준 아나운서",
    category: "사회자",
    thumbnailUrl: "",
    priceLabel: "30만원",
    rating: 4.9,
    reviewCount: 45,
    moodTags: ["차분한진행", "방송출신"],
  },
  {
    id: "v-mc-2",
    name: "MC 이태오",
    category: "사회자",
    thumbnailUrl: "",
    priceLabel: "25만원",
    rating: 4.8,
    reviewCount: 62,
    moodTags: ["유쾌한진행", "축가가능"],
  },
];

export function vendorsByCategory(category: VendorCategory): VendorSummary[] {
  return VENDORS.filter((v) => v.category === category);
}

export function vendorById(id: string): VendorSummary | undefined {
  return VENDORS.find((v) => v.id === id);
}

// 평점·후기 수 기준 인기 업체 (홈/전체서비스 트렌딩 섹션용)
export function topRatedVendors(count = 6): VendorSummary[] {
  return [...VENDORS]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, count);
}
