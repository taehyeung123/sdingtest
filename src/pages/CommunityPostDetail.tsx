import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUp, ChevronRight, Heart, MessageCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { formatTime } from "../lib/utils";

export default function CommunityPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { communityPosts, likedPostIds, toggleLike, addComment } = useApp();
  const [comment, setComment] = useState("");

  const post = communityPosts.find((p) => p.id === postId);

  useEffect(() => {
    if (!post) navigate("/community", { replace: true });
  }, [post, navigate]);

  if (!post) return null;

  const liked = likedPostIds.includes(post.id);
  const likeCount = post.likeCount + (liked ? 1 : 0);

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
          <span className="ml-auto text-[12px] text-faint">
            {formatTime(post.timestamp)}
          </span>
        </div>

        <h1 className="mt-3 text-[19px] font-bold leading-snug text-ink">
          {post.title}
        </h1>
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
          {post.body}
        </p>

        {post.imageUrls.length > 0 && (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {post.imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-[220px] w-[220px] shrink-0 rounded-2xl object-cover"
              />
            ))}
          </div>
        )}

        {post.vendorTag && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/vendors/${encodeURIComponent(post.vendorTag!.category)}`,
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
              <p className="mt-0.5 text-[11px] text-sub">업체 보러가기</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-faint" />
          </button>
        )}

        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          className={`mt-5 flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition active:scale-95 ${
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
