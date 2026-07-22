import type { VendorSummary } from "../types";
import { VENDORS } from "./vendors";
import { productsByVendor } from "./products";

// 업체 상세 mock — B2B 데이터 수집 도구(sdnig 리포)가 모으는 필드 구조를 그대로 따른다.
//   공통: 연락처 / 운영시간 / 주소 / 업체설명 / 상품구성 / 추가옵션 / 스딩 제휴혜택
//   업종별: category_data (웨딩홀 홀타입·식대·대관료·주차, 드레스 헬퍼비·피팅비 등)
// 값은 전부 가상의 데모 데이터이며 수집 도구 안의 실데이터와 무관하다.

export interface DetailProduct {
  id: string;
  name: string;
  description: string;
  price: number; // 원 — 앱내 결제용
  imageUrl?: string;
  filter?: string;
}

export interface DetailOption {
  name: string;
  price: number; // 원
  desc: string;
}

export interface VendorDetail {
  contact: string;
  hours: string; // "10:00 ~ 19:00"
  address: string;
  description: string;
  sdingBenefit: string;
  products: DetailProduct[];
  options: DetailOption[];
  /** 업종별 상세정보 — 수집 도구 category-fields 라벨 기준 */
  infoRows: { label: string; value: string }[];
  specialNotes?: string;
}

// 지역 → 그럴듯한 mock 주소
const REGION_ADDRESS: Record<string, string> = {
  서울: "서울 강남구 논현로 812",
  "경기·인천": "경기 성남시 분당구 판교역로 152",
  "대전·충청": "대전 서구 둔산로 201",
  "대구·경북": "대구 수성구 동대구로 351",
  "부산·울산·경남": "부산 해운대구 센텀중앙로 90",
  "광주·전남": "광주 서구 상무중앙로 68",
  강원: "강원 춘천시 중앙로 27",
  제주: "제주 제주시 연동로 12",
};

// 업체 id 기반 결정적 변주 (같은 카테고리라도 값이 조금씩 다르게)
function seed(id: string): number {
  let acc = 0;
  for (const ch of id) acc = (acc + ch.charCodeAt(0)) % 97;
  return acc;
}

function contactOf(v: VendorSummary): string {
  const s = seed(v.id);
  return `0507-13${String(s % 10)}${String((s * 7) % 10)}-${String(1000 + s * 83).slice(0, 4)}`;
}

function hoursOf(v: VendorSummary): string {
  const s = seed(v.id);
  return s % 2 === 0 ? "10:00 ~ 19:00" : "10:30 ~ 20:00";
}

function addressOf(v: VendorSummary): string {
  const s = seed(v.id);
  return `${REGION_ADDRESS[v.region] ?? "서울 강남구 논현로 812"} ${s % 9 + 2}층`;
}

const won = (n: number) => n.toLocaleString();

// priceLabel("2,800만원~", "대여 180만원", "80만원")에서 대표 숫자(원)를 뽑는다
function priceToWon(label: string, fallbackManwon: number): number {
  const m = label.replace(/,/g, "").match(/(\d+)\s*만원/);
  return (m ? Number(m[1]) : fallbackManwon) * 10_000;
}

// ---- 업종별 템플릿 -----------------------------------------------------------

function buildProducts(v: VendorSummary): DetailProduct[] {
  // 드레스·웨딩홀은 AI 합성용 등록 상품(사진 포함)을 그대로 재사용
  const registered = productsByVendor(v.id);
  if (registered.length > 0) {
    return registered.map((p) => ({
      id: p.id,
      name: p.name,
      description:
        v.category === "웨딩홀"
          ? "대관 기본 구성 (예식 90분 · 신부대기실 · 폐백실 포함)"
          : "본식 대여 기본 구성 (가봉 2회 · 헬퍼 동행 포함)",
      price: priceToWon(p.priceLabel ?? "", v.priceFrom),
      imageUrl: p.imageUrl,
      filter: p.filter,
    }));
  }

  const base = v.priceFrom >= 9999 ? 150 : v.priceFrom; // 가격 비공개(예물)는 참고가로
  const s = seed(v.id);
  const P = (manwon: number) => Math.max(1, Math.round(manwon)) * 10_000;

  switch (v.category) {
    case "스튜디오":
      return [
        { id: `${v.id}-p1`, name: "시그니처 촬영 패키지", description: "4시간 촬영 · 원본 전체 제공 · 수정본 30컷", price: P(base) },
        { id: `${v.id}-p2`, name: "야외 추가 촬영", description: "근교 야외 스팟 1곳 추가 (2시간)", price: P(base * 0.4) },
      ];
    case "헤어&메이크업":
      return [
        { id: `${v.id}-p1`, name: "본식 헤어&메이크업", description: "신부 본식 헤어·메이크업 (터치업 포함)", price: P(base) },
        { id: `${v.id}-p2`, name: "리허설 메이크업", description: "촬영용 리허설 헤어·메이크업", price: P(base * 0.6) },
        { id: `${v.id}-p3`, name: "혼주 메이크업", description: "혼주 1인 헤어·메이크업", price: P(base * 0.35) },
      ];
    case "헤어변형":
      return [
        { id: `${v.id}-p1`, name: "신부 볼륨매직", description: "본식 2주 전 권장 · 손상 최소 시술", price: P(base) },
        { id: `${v.id}-p2`, name: "뿌리볼륨 클리닉", description: "당일 스타일 고정력 보강", price: P(base * 0.7) },
      ];
    case "본식스냅":
      return [
        { id: `${v.id}-p1`, name: `${s % 2 === 0 ? "2인" : "1인"} 본식스냅`, description: "식전 스케치부터 원판까지 · 원본 전체 제공", price: P(base) },
        { id: `${v.id}-p2`, name: "원판+스냅 결합 상품", description: "가족 원판 촬영 포함 구성", price: P(base * 1.35) },
      ];
    case "스냅(데이트·가봉·아이폰)":
      return [
        { id: `${v.id}-p1`, name: "데이트 스냅 (2시간)", description: "야외 자율 촬영 · 보정본 20컷", price: P(base) },
        { id: `${v.id}-p2`, name: "가봉 스냅", description: "드레스샵 가봉 현장 기록", price: P(base * 0.8) },
      ];
    case "영상(DVD촬영)":
      return [
        { id: `${v.id}-p1`, name: "본식 DVD 풀패키지", description: "본식 전체 기록 · 하이라이트 5분 포함", price: P(base) },
        { id: `${v.id}-p2`, name: "하이라이트 단품", description: "시네마틱 하이라이트 3~5분", price: P(base * 0.6) },
      ];
    case "예물":
      return [
        { id: `${v.id}-p1`, name: "커플링 기본 세트", description: "14K 커플링 · 각인 무료", price: P(base) },
        { id: `${v.id}-p2`, name: "프로포즈링", description: "1부 다이아 · GIA 감정서 포함", price: P(base * 2.2) },
      ];
    case "예복":
      return [
        { id: `${v.id}-p1`, name: "세미맞춤 예복", description: "이태리 원단 · 셔츠 1벌 포함", price: P(base) },
        { id: `${v.id}-p2`, name: "렌탈 예복", description: "본식 렌탈 3박 4일", price: P(base * 0.5) },
      ];
    case "한복":
      return [
        { id: `${v.id}-p1`, name: "신부 한복 맞춤", description: "본견 소재 · 속치마 포함", price: P(base) },
        { id: `${v.id}-p2`, name: "신부 한복 대여", description: "본식+폐백 대여 구성", price: P(base * 0.55) },
        { id: `${v.id}-p3`, name: "혼주 한복 대여 (2벌)", description: "양가 혼주 한복 세트", price: P(base * 0.9) },
      ];
    case "부케":
      return [
        { id: `${v.id}-p1`, name: "본식부케 (디자인 요청)", description: "원하는 톤·꽃 반영 맞춤 제작", price: P(base * 1.3) },
        { id: `${v.id}-p2`, name: "본식부케 (랜덤 디자인)", description: "시즌 생화 랜덤 구성", price: P(base) },
        { id: `${v.id}-p3`, name: "리허설 부케", description: "촬영용 생화 부케", price: P(base * 0.7) },
      ];
    case "청첩장":
      return [
        { id: `${v.id}-p1`, name: "청첩장 100부 패키지", description: "봉투·스티커 포함 · 모바일 청첩장 무료", price: P(base) },
        { id: `${v.id}-p2`, name: "모바일 청첩장 단품", description: "사진 10장 · 지도·계좌 안내 포함", price: P(base * 0.4) },
      ];
    case "사회자":
      return [
        { id: `${v.id}-p1`, name: "1부 예식 진행", description: "사전 미팅 1회 + 리허설 포함", price: P(base) },
        { id: `${v.id}-p2`, name: "1부+2부 진행", description: "축하연 이벤트 진행 포함", price: P(base * 1.6) },
      ];
    default:
      return [
        { id: `${v.id}-p1`, name: "기본 상품", description: "기본 구성", price: P(base) },
      ];
  }
}

function buildOptions(v: VendorSummary): DetailOption[] {
  const s = seed(v.id);
  switch (v.category) {
    case "웨딩홀":
      return [
        { name: "생화 업그레이드", price: 550_000, desc: "버진로드·단상 생화 장식 업그레이드" },
        { name: "2부 연출", price: 330_000, desc: "조명·음향 2부 파티 연출" },
      ];
    case "스튜디오":
      return [
        { name: "앨범 추가 제작", price: 250_000, desc: "20P 아크릴 앨범 1권" },
        { name: "액자 추가", price: 90_000, desc: "11R 원목 액자" },
      ];
    case "드레스":
      return [
        { name: "리허설 드레스 추가", price: 200_000, desc: "촬영용 드레스 1벌 추가" },
        { name: "퇴장 드레스", price: 150_000, desc: "2부 퇴장용 미니 드레스" },
      ];
    case "헤어&메이크업":
      return [
        { name: "얼리스타트", price: 50_000 + (s % 3) * 10_000, desc: "오전 7시 이전 시작" },
        { name: "출장 시술", price: 100_000, desc: "예식장 현장 출장" },
      ];
    case "본식스냅":
    case "스냅(데이트·가봉·아이폰)":
      return [
        { name: "보정본 추가 10컷", price: 70_000, desc: "정밀 보정 추가" },
        { name: "당일 급송 편집", price: 50_000, desc: "3일 내 1차 전달" },
      ];
    case "영상(DVD촬영)":
      return [{ name: "드론 촬영", price: 200_000, desc: "야외 예식 한정" }];
    case "예복":
      return [{ name: "셔츠 추가", price: 60_000, desc: "맞춤 셔츠 1벌" }];
    case "부케":
      return [{ name: "부토니에 세트", price: 30_000, desc: "신랑·혼주 부토니에" }];
    case "청첩장":
      return [{ name: "식전영상 제작", price: 80_000, desc: "사진 슬라이드 식전영상" }];
    case "사회자":
      return [{ name: "지방 출장비", price: 100_000, desc: "수도권 외 지역" }];
    default:
      return [];
  }
}

function buildInfoRows(v: VendorSummary): { label: string; value: string }[] {
  const s = seed(v.id);
  const base = v.priceFrom >= 9999 ? 150 : v.priceFrom;
  switch (v.category) {
    case "웨딩홀":
      return [
        { label: "홀 타입 / 예식 형태", value: v.moodTags.includes("야외") ? "야외 · 가든" : v.moodTags.includes("채플") ? "채플" : "컨벤션홀" },
        { label: "예식 간격", value: s % 2 === 0 ? "90분 간격" : "120분 간격 (단독홀)" },
        { label: "수용 인원", value: `${150 + (s % 4) * 50}명 ~ ${350 + (s % 4) * 50}명` },
        { label: "식대 (1인)", value: `뷔페 ${won(65_000 + (s % 5) * 5_000)}원 · 코스 ${won(85_000 + (s % 5) * 5_000)}원` },
        { label: "대관료", value: `${won(Math.round(base * 0.12) * 10_000)}원` },
        { label: "연출료", value: `${won(1_500_000 + (s % 4) * 200_000)}원` },
        { label: "꽃장식", value: "기본 조화 포함 · 생화 업그레이드 별도" },
        { label: "음주류", value: s % 2 === 0 ? "주류 반입 가능 (콜키지 무료)" : "홀 제공 주류만 가능" },
        { label: "주차", value: `${200 + (s % 5) * 100}대 · 예식 3시간 무료` },
      ];
    case "스튜디오":
      return [
        { label: "촬영소요시간", value: `${3 + (s % 3)}시간` },
        { label: "촬영스케줄", value: "평일·주말 동일 · 하루 2팀 한정" },
        { label: "보유소품", value: "핸드부케 · 빈티지 가구 · 필름 카메라 소품" },
        { label: "촬영 의상 벌수", value: `드레스 ${3 + (s % 3)}벌 + 캐주얼 1벌` },
        { label: "참고사항", value: s % 2 === 0 ? "외부 헤어변형업체 출입 가능" : "외부 헤어변형업체 출입 불가" },
      ];
    case "드레스":
      return [
        { label: "방문상담소요시간", value: "60분" },
        { label: "기본소요시간", value: "피팅 90분" },
        { label: "헬퍼비", value: `${won(200_000 + (s % 3) * 30_000)}원` },
        { label: "피팅비", value: `${won(50_000 + (s % 3) * 10_000)}원 (계약 시 차감)` },
      ];
    case "헤어&메이크업":
      return [
        { label: "메인시술자직급(메이크업)", value: s % 2 === 0 ? "원장" : "부원장" },
        { label: "메인시술자직급(헤어)", value: s % 3 === 0 ? "원장" : "실장" },
        { label: "시술자케어", value: "본식 종료까지 터치업 1회 포함" },
      ];
    case "헤어변형":
      return [
        { label: "디자이너직급", value: "원장 단독 시술" },
        { label: "지역별 출장비", value: `서울 무료 · 경기 ${won(30_000)}원 · 그 외 협의` },
        { label: "시간대별 추가비용", value: `06시 이전 시작 시 ${won(30_000)}원` },
        { label: "야외촬영 추가비용", value: `${won(50_000)}원` },
      ];
    case "본식스냅":
    case "스냅(데이트·가봉·아이폰)":
      return [
        { label: "촬영범위", value: "메이크업샵 출발부터 원판까지" },
        { label: "셀렉방법", value: "전용 웹갤러리에서 2주 내 셀렉" },
        { label: "해피콜방법", value: "예식 1주 전 유선 해피콜" },
      ];
    case "영상(DVD촬영)":
      return [
        { label: "출장비용", value: `수도권 무료 · 그 외 ${won(50_000)}원~` },
        { label: "예약양식", value: "예식일·홀명·원하는 상품 카톡 접수" },
      ];
    case "예물":
      return [
        { label: "평균예산대", value: `${won(base * 10_000)}원 ~ ${won(base * 3 * 10_000)}원` },
      ];
    case "예복":
      return [
        { label: "맞춤시 구성", value: "자켓·팬츠·셔츠 + 가봉 2회" },
        { label: "원단별 금액", value: `국산 ${won(base * 10_000)}원 · 이태리 ${won(Math.round(base * 1.4) * 10_000)}원~` },
        { label: "렌탈시 구성", value: "3박 4일 · 셔츠 포함" },
      ];
    case "한복":
      return [
        { label: "구성 및 금액", value: `맞춤 ${won(base * 10_000)}원~ · 대여 ${won(Math.round(base * 0.55) * 10_000)}원~` },
        { label: "피팅비", value: "무료 (예약제)" },
        { label: "고객안내사항", value: "매장 내 사진촬영 가능" },
      ];
    case "부케":
      return [
        { label: "본식부케 랜덤디자인", value: `${won(base * 10_000)}원~` },
        { label: "본식부케 디자인요청", value: `${won(Math.round(base * 1.3) * 10_000)}원~` },
        { label: "셋트구성", value: "부케 + 부토니에 + 코사지 2개" },
        { label: "주문방법", value: "예식 3주 전까지 카톡 채널 주문" },
      ];
    case "청첩장":
      return [
        { label: "주문 공지사항", value: "스딩 제휴코드 입력 시 샘플 무료 · 최소 주문 50부" },
      ];
    case "사회자":
      return [
        { label: "구성 및 금액", value: `1부 ${won(base * 10_000)}원 (서울예식기준)` },
        { label: "출장비", value: `수도권 무료 · 그 외 ${won(100_000)}원` },
        { label: "지정비", value: `특정 일자 지정 시 ${won(50_000)}원` },
        { label: "진행방식", value: "사전 미팅 1회 + 대본 맞춤 수정 + 리허설 참석" },
      ];
    default:
      return [];
  }
}

function buildDescription(v: VendorSummary): string {
  const tag = v.moodTags[0] ?? v.category;
  switch (v.category) {
    case "웨딩홀":
      return `${v.region} ${tag} 컨셉의 웨딩홀입니다. 추가금 없는 정찰제 견적으로 상담부터 본식까지 동일한 금액을 약속드려요. 하객 동선과 식사 만족도에 특히 신경 쓰고 있습니다.`;
    case "스튜디오":
      return `${tag} 무드를 살린 인물 중심 촬영을 지향하는 스튜디오입니다. 원본 전체 제공이 기본이며, 촬영 당일 하루 두 팀만 받아 여유 있게 진행합니다.`;
    case "드레스":
      return `${tag} 라인이 강점인 브라이덜샵입니다. 체형 상담 후 어울리는 실루엣을 제안드리고, 가봉 일정은 전담 실장이 끝까지 책임집니다.`;
    default:
      return `${v.name}입니다. ${tag} 스타일을 중심으로 정찰제 가격으로 운영하고 있어요. 스딩을 통해 예약하시면 표기된 금액 그대로, 추가금 걱정 없이 진행됩니다.`;
  }
}

function buildBenefit(v: VendorSummary): string {
  const s = seed(v.id);
  const perks = [
    "스딩 예약 시 5% 포인트 적립",
    "스딩 회원 한정 사은품 증정",
    "스딩 예약 고객 우선 일정 배정",
    "스딩 결제 시 옵션 1종 무료",
  ];
  return perks[s % perks.length];
}

function buildSpecialNotes(v: VendorSummary): string | undefined {
  switch (v.category) {
    case "웨딩홀":
      return "성수기(4·5·10월) 주말은 6개월 전 마감되는 경우가 많아요. 견학 예약 후 방문해주세요.";
    case "드레스":
      return "가봉은 본식 3주 전 완료를 권장해요. 리허설 촬영과 본식 드레스는 다른 라인으로 준비됩니다.";
    case "헤어변형":
      return "본식 최소 2주 전 시술을 권장합니다. 당일 시술은 고정력이 떨어질 수 있어요.";
    case "본식스냅":
      return "원본은 예식 후 2주 내 전달되며, 보정본은 셀렉 후 4주 소요됩니다.";
    case "예물":
      return "다이아 등급(4C)별 실물 비교가 가능하니 방문 상담을 추천드려요.";
    default:
      return undefined;
  }
}

// ---- 공개 API ---------------------------------------------------------------

export function vendorDetailById(vendorId: string): VendorDetail | undefined {
  const v = VENDORS.find((x) => x.id === vendorId);
  if (!v) return undefined;
  return {
    contact: contactOf(v),
    hours: hoursOf(v),
    address: addressOf(v),
    description: buildDescription(v),
    sdingBenefit: buildBenefit(v),
    products: buildProducts(v),
    options: buildOptions(v),
    infoRows: buildInfoRows(v),
    specialNotes: buildSpecialNotes(v),
  };
}
