import SynthesisFlow from "../features/synthesis/SynthesisFlow";
import type { SynthesisConfig } from "../features/synthesis/SynthesisFlow";

// AI 드레스 피팅 (기획서 5.4) — 드레스샵 선택 → 등록 드레스 선택 → 합성
const CONFIG: SynthesisConfig = {
  title: "AI 드레스 피팅",
  photos: [
    { id: "model-a", label: "모델 A", src: "/mock/dress-1.jpg" },
    { id: "model-b", label: "모델 B", src: "/mock/dress-2.jpg" },
  ],
  vendorCategory: "드레스",
  vendorSectionTitle: "드레스샵을 선택해주세요",
  productSectionTitle: "입혀볼 드레스를 선택해주세요",
  checklistItemId: "dress-contract",
  resultBadge: "AI 합성 결과",
  resultSub: "내 사진에 이 드레스를 입혀본 모습이에요",
  loadingPhrases: [
    "드레스 실루엣을 매칭하고 있어요",
    "비즈 디테일을 입히는 중이에요",
    "원단 질감과 조명을 맞추고 있어요",
  ],
  chatLabelPrefix: "AI 드레스 피팅",
  chatText:
    "드레스 합성 결과를 채팅에 남겨뒀어요. 이 드레스샵으로 상담을 이어가볼까요?",
  chatQuickReplies: ["드레스 추천해줘", "다른 드레스도 볼래"],
};

export default function DressSynthesis() {
  return <SynthesisFlow config={CONFIG} />;
}
