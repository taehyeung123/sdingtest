import SynthesisFlow from "../features/synthesis/SynthesisFlow";
import type { SynthesisConfig } from "../features/synthesis/SynthesisFlow";

// AI 웨딩홀 미리보기 (기획서 5.5, 플로우 D)
const CONFIG: SynthesisConfig = {
  title: "AI 웨딩홀 미리보기",
  photos: [
    { id: "couple", label: "커플 모델", src: "/mock/hall-1.jpg" },
    { id: "model-a", label: "모델 A", src: "/mock/dress-1.jpg" },
  ],
  styleSectionTitle: "배경 웨딩홀",
  styles: ["채플홀", "그랜드 볼룸", "야외 가든", "루프탑"],
  resultImage: "/mock/hall-1.jpg",
  resultBadge: "가상 시뮬레이션",
  resultSub: "우리 부부가 이 홀에 선다면?",
  loadingPhrases: [
    "웨딩홀 조명과 톤을 맞추고 있어요",
    "두 분의 실루엣을 배치하고 있어요",
  ],
  vendorCategory: "웨딩홀",
  vendorLinkLabel: "이 웨딩홀 업체 보러가기",
  chatText:
    "웨딩홀 미리보기 결과를 남겨뒀어요. 비슷한 분위기 웨딩홀을 찾아볼까요?",
  chatQuickReplies: ["웨딩홀 추천해줘", "지금 뭐 해야 해?"],
};

export default function HallSynthesis() {
  return <SynthesisFlow config={CONFIG} />;
}
