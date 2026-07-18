import SynthesisFlow from "../features/synthesis/SynthesisFlow";
import type { SynthesisConfig } from "../features/synthesis/SynthesisFlow";

// AI 웨딩홀 미리보기 (기획서 5.5) — 웨딩홀 선택 → 등록 홀 선택 → 합성
const CONFIG: SynthesisConfig = {
  title: "AI 웨딩홀 미리보기",
  photos: [
    { id: "couple", label: "커플 모델", src: "/mock/hall-1.jpg" },
    { id: "model-a", label: "모델 A", src: "/mock/dress-1.jpg" },
  ],
  vendorCategory: "웨딩홀",
  vendorSectionTitle: "웨딩홀을 선택해주세요",
  productSectionTitle: "배경이 될 홀을 선택해주세요",
  checklistItemId: "hall-contract",
  resultBadge: "가상 시뮬레이션",
  resultSub: "우리 부부가 이 홀에 선 모습을 미리 봤어요",
  loadingPhrases: [
    "웨딩홀 조명과 톤을 맞추고 있어요",
    "버진로드 배경을 합성하는 중이에요",
    "두 분의 실루엣을 배치하고 있어요",
  ],
  chatLabelPrefix: "AI 웨딩홀 미리보기",
  chatText:
    "웨딩홀 합성 결과를 채팅에 남겨뒀어요. 이 웨딩홀로 상담을 이어가볼까요?",
  chatQuickReplies: ["웨딩홀 추천해줘", "다른 홀도 볼래"],
};

export default function HallSynthesis() {
  return <SynthesisFlow config={CONFIG} />;
}
