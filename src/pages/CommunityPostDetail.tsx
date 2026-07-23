import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowUp,
  Bookmark,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { formatTime } from "../lib/utils";
import type { CommunityPost } from "../types";

const RELATED_COUNT = 3;

function RelatedPostCard({
  post,
  onClick,
}: {
  post: CommunityPost;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[168px] shrink-0 flex-col gap-2 rounded-2xl border border-line bg-white p-3 text-left transition active:scale-[0.98] active:bg-black/[0.02]"
    >
      <span className="w-fit rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
        {post.category}
      </span>
      <p className="line-clamp-2 text-[13px] font-bold leading-snug text-ink">
        {post.title}
      </p>
      <span className="mt-auto flex items-center gap-1 text-[11px] text-faint">
        <Heart size={12} strokeWidth={1.9} />
        {post.likeCount}
      </span>
    </button>
  );
}

export default function CommunityPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { communityPosts, likedPostIds, toggleLike, scrappedPostIds, toggleScrap, addComment } =
    useApp();
  const [comment, setComment] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const post = communityPosts.find((p) => p.id === postId);

  useEffect(() => {
    if (!post) navigate("/community", { replace: true });
  }, [post, navigate]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [postId]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return communityPosts
      .filter(
        (p) =>
          p.id !== post.id &&
          (p.category === post.category ||
            (post.vendorTag &&
              p.vendorTag?.category === post.vendorTag.category)),
      )
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, RELATED_COUNT);
  }, [communityPosts, post]);

  if (!post) return null;

  const liked = likedPostIds.includes(post.id);
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const scrapped = scrappedPostIds.includes(post.id);
  const scrapCount = post.scrapCount + (scrapped ? 1 : 0);
  const heroImage = post.imageUrls[activeImageIndex] ?? post.imageUrls[0];

  const handleSend = () => {
    const text = comment.trim();
    if (!text) return;
    addComment(post.id, text);
    setComment("");
  };

  return (
    <div className="min-h-dvh bg-white pb-[88px]">
      <PageHeader title={post.category} onBack={() => navigate(-1)} />

      <div className="px-5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-ink">{post.author}</span>
          <span className="text-[12px] text-faint">{post.authorBadge}</span>
          {post.region && (
            <span className="flex items-center gap-0.5 rounded-md bg-field px-1.5 py-0.5 text-[10px] font-semibold text-sub">
              <MapPin size={10} strokeWidth={2} />
              {post.region}
            </span>
          )}
          <span className="ml-auto text-[12px] text-faint">
            {formatTime(post.timestamp)}
          </span>
        </div>

        <h1 className="mt-3 text-[19px] font-bold leading-snug text-ink">
          {post.title}
        </h1>

        <div className="mt-2 flex items-center gap-1 text-[12px] text-faint">
          <Eye size={13} strokeWidth={1.9} />
          조회 {post.viewCount.toLocaleString()}
        </div>

        {post.imageUrls.length > 0 && (
          <div className="mt-4">
            <div className="w-full overflow-hidden rounded-2xl bg-field">
              <img
                src={heroImage}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>

            {post.imageUrls.length > 1 && (
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
                {post.imageUrls.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl transition ${
                      i === activeImageIndex
                        ? "ring-2 ring-brand ring-offset-2"
                        : "opacity-70 active:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
          {post.body}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-field px-2.5 py-1 text-[12px] font-medium text-sub"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.vendorTag && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/vendors/${encodeURIComponent(post.vendorTag!.category)}/${post.vendorTag!.vendorId}`,
              )
            }
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-field/60 p-3 text-left transition active:scale-[0.99] active:bg-field"
          >
            <VendorThumb
              category={post.vendorTag.category}
              className="h-11 w-11 rounded-xl"
              iconSize={18}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-ink">
                {post.vendorTag.vendorName}
              </p>
              <p className="mt-0.5 text-[11px] text-sub">업체 상세 보기</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-faint" />
          </button>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition active:scale-95 ${
              liked
                ? "border-brand/40 bg-tint text-brand"
                : "border-line text-sub"
            }`}
          >
            <Heart
              size={16}
              className={liked ? "fill-brand text-brand" : ""}
              strokeWidth={1.9}
            />
            좋아요 {likeCount}
          </button>
          <button
            type="button"
            onClick={() => toggleScrap(post.id)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition active:scale-95 ${
              scrapped
                ? "border-brand/40 bg-tint text-brand"
                : "border-line text-sub"
            }`}
          >
            <Bookmark
              size={16}
              className={scrapped ? "fill-brand text-brand" : ""}
              strokeWidth={1.9}
            />
            스크랩 {scrapCount}
          </button>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={15} className="text-sub" strokeWidth={1.9} />
            <span className="text-[14px] font-bold text-ink">
              댓글 {post.comments.length}
            </span>
          </div>

          {post.comments.length === 0 ? (
            <p className="mt-4 py-4 text-center text-[13px] text-faint">
              첫 댓글을 남겨보세요
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3.5">
              {post.comments.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-ink">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-faint">
                      {formatTime(c.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[14px] font-bold text-ink">
              이런 글도 많이 봤어요
            </p>
            <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {relatedPosts.map((rp) => (
                <RelatedPostCard
                  key={rp.id}
                  post={rp}
                  onClick={() => navigate(`/community/${rp.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full max-w-[430px] items-center gap-2 border-t border-line bg-white px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)]"
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
            }}
            placeholder="댓글을 남겨보세요"
            className="h-11 min-w-0 flex-1 rounded-full bg-field px-4 text-[14px] outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            aria-label="댓글 등록"
            disabled={comment.trim().length === 0}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              comment.trim().length > 0
                ? "bg-brand text-white active:scale-95"
                : "bg-field text-faint"
            }`}
          >
            <ArrowUp size={20} strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}
