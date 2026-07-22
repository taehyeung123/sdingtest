import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { vendorById } from "../data/vendors";
import { formatTime } from "../lib/utils";

// AI 합성에서 업체 선택이 지원되는 카테고리 (SynthesisFlow 참고)
const AI_SYNTHESIS_ROUTE: Partial<Record<string, string>> = {
  드레스: "/ai/dress",
  웨딩홀: "/ai/hall",
};

export default function VendorDetail() {
  const { category: rawCategory, vendorId } = useParams<{
    category: string;
    vendorId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    items,
    communityPosts,
    likedPostIds,
    favoriteVendorIds,
    toggleFavoriteVendor,
    trackVendorView,
    showToast,
  } = useApp();

  const vendor = vendorId ? vendorById(vendorId) : undefined;

  let decodedCategory = rawCategory ?? "";
  try {
    decodedCategory = decodeURIComponent(decodedCategory);
  } catch {
    // 잘못된 인코딩이면 원본 그대로 사용
  }

  useEffect(() => {
    if (!vendor) return;
    trackVendorView(vendor.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  useEffect(() => {
    if (!vendor) {
      navigate(`/vendors/${encodeURIComponent(decodedCategory)}`, {
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor]);

  if (!vendor) return null;

  const favorited = favoriteVendorIds.includes(vendor.id);
  const reviews = communityPosts
    .filter((p) => p.vendorTag?.vendorId === vendor.id)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const aiRoute = AI_SYNTHESIS_ROUTE[vendor.category];

  const handleRegister = () => {
    const queryItemId = searchParams.get("item");
    const targetId =
      queryItemId ?? items.find((it) => it.category === vendor.category)?.id;
    if (!targetId) {
      showToast("연결된 체크리스트 항목이 없어요");
      return;
    }
    navigate(`/checklist/${targetId}/register?vendorId=${vendor.id}`);
  };

  return (
    <div className="min-h-dvh bg-white pb-28">
      <PageHeader
        title={vendor.category}
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            aria-label={favorited ? "찜 해제" : "찜하기"}
            onClick={() => toggleFavoriteVendor(vendor.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90"
          >
            <Heart
              size={20}
              className={favorited ? "fill-brand text-brand" : "text-ink"}
              strokeWidth={1.9}
            />
          </button>
        }
      />

      <VendorThumb
        category={vendor.category}
        thumbnailUrl={vendor.thumbnailUrl}
        className="aspect-[4/3] w-full rounded-none"
        iconSize={40}
      />

      <div className="px-5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-tint px-1.5 py-0.5 text-[11px] font-bold text-brand">
            {vendor.category}
          </span>
          <span className="flex items-center gap-0.5 text-[12px] text-sub">
            <MapPin size={11} />
            {vendor.region}
          </span>
        </div>
        <h1 className="mt-1.5 text-[20px] font-extrabold leading-snug">
          {vendor.name}
        </h1>
        <div className="mt-1.5 flex items-center gap-1 text-[13px] text-sub">
          <Star size={13} className="fill-[#FFC107] text-[#FFC107]" />
          <span className="font-bold text-ink">{vendor.rating.toFixed(1)}</span>
          <span>· 후기 {vendor.reviewCount}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[12px] text-faint">정찰가</span>
          <span className="text-[18px] font-extrabold">{vendor.priceLabel}</span>
        </div>

        {vendor.moodTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.moodTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-field px-2 py-1 text-[11px] text-sub"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {aiRoute && (
          <button
            type="button"
            onClick={() => navigate(aiRoute)}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-field/60 p-3.5 text-left transition active:scale-[0.99] active:bg-field"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Sparkles size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink">
                AI로 미리 체험해보기
              </span>
              <span className="mt-0.5 block text-[11.5px] text-sub">
                이 업체의 등록 상품으로 합성할 수 있어요
              </span>
            </span>
          </button>
        )}

        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={15} className="text-sub" strokeWidth={1.9} />
            <span className="text-[14px] font-bold text-ink">
              실제 후기 {reviews.length}
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="mt-4 py-6 text-center text-[13px] text-faint">
              아직 이 업체를 태그한 후기가 없어요
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {reviews.map((post) => {
                const liked = likedPostIds.includes(post.id);
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => navigate(`/community/${post.id}`)}
                    className="rounded-2xl border border-line p-3.5 text-left transition active:scale-[0.99] active:bg-field/60"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-bold text-ink">
                        {post.author}
                      </span>
                      <span className="text-[11px] text-faint">
                        {post.authorBadge}
                      </span>
                      <span className="ml-auto text-[11px] text-faint">
                        {formatTime(post.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink">
                      {post.body}
                    </p>
                    <span className="mt-1.5 flex items-center gap-1 text-[11px] text-faint">
                      <Heart
                        size={11}
                        className={liked ? "fill-brand text-brand" : ""}
                      />
                      {post.likeCount + (liked ? 1 : 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="pb-2 pt-6 text-center text-[12px] text-faint">
          베타 데모 화면이에요. 실제 업체·후기와 무관해요.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <div className="w-full max-w-[430px] border-t border-line bg-white px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <button
            type="button"
            onClick={handleRegister}
            className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[15px] font-bold text-white transition active:scale-[0.98]"
          >
            <Store size={17} />
            이 업체로 상담 등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
