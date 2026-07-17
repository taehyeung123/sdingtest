import {
  Aperture,
  Building2,
  Camera,
  Crown,
  Flower2,
  Gem,
  Mail,
  Mic,
  Scissors,
  Shirt,
  Smartphone,
  UserRound,
  Video,
  Wand2,
} from "lucide-react";
import type { VendorCategory } from "../types";

const ICONS: Record<VendorCategory, typeof Building2> = {
  웨딩홀: Building2,
  스튜디오: Camera,
  드레스: Crown,
  "헤어&메이크업": Wand2,
  헤어변형: Scissors,
  본식스냅: Aperture,
  "스냅(데이트·가봉·아이폰)": Smartphone,
  "영상(DVD촬영)": Video,
  예물: Gem,
  예복: UserRound,
  한복: Shirt,
  부케: Flower2,
  청첩장: Mail,
  사회자: Mic,
};

interface Props {
  category: VendorCategory;
  thumbnailUrl?: string;
  className?: string;
  iconSize?: number;
}

// 업체 썸네일 — 이미지가 없으면 카테고리 아이콘 플레이스홀더
export default function VendorThumb({
  category,
  thumbnailUrl,
  className = "h-16 w-16 rounded-xl",
  iconSize = 22,
}: Props) {
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={category}
        className={`${className} shrink-0 object-cover`}
      />
    );
  }
  const Icon = ICONS[category];
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-tint text-brand/70`}
    >
      <Icon size={iconSize} strokeWidth={1.8} />
    </div>
  );
}

export function categoryIcon(category: VendorCategory) {
  return ICONS[category];
}
