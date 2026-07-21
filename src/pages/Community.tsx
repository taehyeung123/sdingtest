import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, PenSquare, Users } from "lucide-react";
import BottomNav from "../components/BottomNav";
import FloatingChat from "../components/FloatingChat";
import AdNativeCard from "../components/AdNativeCard";
import { useApp } from "../store/AppContext";
import { formatTime } from "../lib/utils";
import { feedAdForIndex } from "../data/ads";
import type { CommunityCategory, CommunityPost } from "../types";

const CATEGORIES: CommunityCategory[] = ["후기", "고민상담", "자유", "정보공유"];
type FilterValue = "전체" | CommunityCategory;
const FILTERS: FilterValue[] = ["전체", ...CATEGORIES];

function PostCard({
  post,
  liked,
  onClick,
}: {
  post: CommunityPost;
  liked: boolean;
  onClick: () => void;
}) {
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const thumb = post.imageUrls[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
            {post.category}
          </span>
          <span className="truncate text-[11px] text-faint">
            {post.author} · {post.authorBadge}
          </span>
        </div>
        <p className="mt-1.5 truncate text-[15px] font-bold text-ink">
          {post.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-sub">
          {post.body}
        </p>
        <div className="mt-2.5 flex items-center gap-3 text-[12px] text-faint">
          <span className="flex items-center gap-1">
            <Heart
              size={13}
              className={liked ? "fill-brand text-brand" : ""}
              strokeWidth={1.9}
            />
            {likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} strokeWidth={1.9} />
            {post.comments.length}
          </span>
          <span className="ml-auto">{formatTime(post.timestamp)}</span>
        </div>
      </div>
      {thumb && (
        <img
          src={thumb}
          alt=""
          className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"
        />
      )}
    </button>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const { communityPosts, likedPostIds } = useApp();
  const [filter, setFilter] = useState<FilterValue>("전체");

  const sorted = [...communityPosts].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
  );
  const filtered =
    filter === "전체" ? sorted : sorted.filter((p) => p.category === filter);

  return (
    <div className="min-h-dvh bg-page pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-5 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-bold">커뮤니티</h1>
          <button
            type="button"
            aria-label="글쓰기"
            onClick={() => navigate("/community/write")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-95"
          >
            <PenSquare size={21} strokeWidth={1.9} />
          </button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-brand text-white"
                    : "border border-line text-sub active:bg-field"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white py-14">
            <Users size={28} strokeWidth={1.6} className="text-faint" />
            <p className="text-[14px] font-semibold text-ink">
              아직 글이 없어요
            </p>
            <p className="text-[12px] text-faint">
              첫 번째 이야기를 남겨보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((post, i) => {
              const showAd = i > 0 && i % 4 === 0;
              return (
                <div key={post.id} className="flex flex-col gap-3">
                  {showAd && <AdNativeCard ad={feedAdForIndex(i / 4 - 1)} />}
                  <PostCard
                    post={post}
                    liked={likedPostIds.includes(post.id)}
                    onClick={() => navigate(`/community/${post.id}`)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FloatingChat offsetClass="bottom-24" />
      <BottomNav />
    </div>
  );
}
