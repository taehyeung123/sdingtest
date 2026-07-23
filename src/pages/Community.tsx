import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  PenSquare,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
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
type SortMode = "popular" | "latest";

const HIGHLIGHT_COUNT = 4;

function matchesQuery(post: CommunityPost, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    post.title.toLowerCase().includes(q) ||
    post.body.toLowerCase().includes(q) ||
    post.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function HighlightCard({
  post,
  rank,
  liked,
  onClick,
}: {
  post: CommunityPost;
  rank: number;
  liked: boolean;
  onClick: () => void;
}) {
  const likeCount = post.likeCount + (liked ? 1 : 0);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[240px] shrink-0 flex-col gap-2 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.98] active:bg-black/[0.02]"
    >
      <div className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
          {rank}
        </span>
        <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
          {post.category}
        </span>
      </div>
      <p className="line-clamp-2 text-[13.5px] font-bold leading-snug text-ink">
        {post.title}
      </p>
      <div className="mt-auto flex items-center gap-2.5 text-[11px] text-faint">
        <span className="flex items-center gap-0.5">
          <Heart
            size={12}
            className={liked ? "fill-brand text-brand" : ""}
            strokeWidth={1.9}
          />
          {likeCount}
        </span>
        <span className="flex items-center gap-0.5">
          <Eye size={12} strokeWidth={1.9} />
          {post.viewCount.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

function PostMeta({
  post,
  showAuthor = true,
}: {
  post: CommunityPost;
  showAuthor?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold text-brand">
        {post.category}
      </span>
      {post.region && (
        <span className="flex items-center gap-0.5 rounded-md bg-field px-1.5 py-0.5 text-[10px] font-semibold text-sub">
          <MapPin size={10} strokeWidth={2} />
          {post.region}
        </span>
      )}
      {showAuthor && (
        <span className="truncate text-[11px] text-faint">
          {post.author} · {post.authorBadge}
        </span>
      )}
    </div>
  );
}

function PostMetrics({
  post,
  liked,
  scrapped,
  showTime = true,
}: {
  post: CommunityPost;
  liked: boolean;
  scrapped: boolean;
  showTime?: boolean;
}) {
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const scrapCount = post.scrapCount + (scrapped ? 1 : 0);
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[12px] text-faint">
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
      <span className="flex items-center gap-1">
        <Eye size={13} strokeWidth={1.9} />
        {post.viewCount.toLocaleString()}
      </span>
      <span className="flex items-center gap-1">
        <Bookmark
          size={13}
          className={scrapped ? "fill-brand text-brand" : ""}
          strokeWidth={1.9}
        />
        {scrapCount}
      </span>
      {showTime && <span className="ml-auto">{formatTime(post.timestamp)}</span>}
    </div>
  );
}

/** 사진 중심 카드 — 이미지가 있는 글은 큰 대표 사진을 카드 상단에 꽉 채워 보여준다. */
function PostCardPhoto({
  post,
  liked,
  scrapped,
  onClick,
}: {
  post: CommunityPost;
  liked: boolean;
  scrapped: boolean;
  onClick: () => void;
}) {
  const extraImageCount = post.imageUrls.length - 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl border border-line bg-white text-left transition active:scale-[0.99] active:bg-black/[0.02]"
    >
      <div className="relative aspect-[4/5] w-full bg-field">
        <img
          src={post.imageUrls[0]}
          alt=""
          className="h-full w-full object-cover"
        />
        {extraImageCount > 0 && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white">
            +{extraImageCount}
          </span>
        )}
      </div>

      <div className="p-4">
        <PostMeta post={post} />

        <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink">
          {post.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-sub">
          {post.body}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11.5px] font-medium text-brand/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <PostMetrics post={post} liked={liked} scrapped={scrapped} />
      </div>
    </button>
  );
}

/** 텍스트 중심 컴팩트 카드 — 이미지가 없는 글(고민상담·자유·정보공유 등)에 사용. */
function PostCardCompact({
  post,
  liked,
  scrapped,
  onClick,
}: {
  post: CommunityPost;
  liked: boolean;
  scrapped: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col rounded-2xl border border-line bg-white p-4 text-left transition active:scale-[0.99] active:bg-black/[0.02]"
    >
      <PostMeta post={post} />

      <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink">
        {post.title}
      </p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-sub">
        {post.body}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[11.5px] font-medium text-brand/80">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <PostMetrics post={post} liked={liked} scrapped={scrapped} />
    </button>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const { communityPosts, likedPostIds, scrappedPostIds } = useApp();
  const [filter, setFilter] = useState<FilterValue>("전체");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const highlights = useMemo(() => {
    return [...communityPosts]
      .sort((a, b) => {
        const scoreA = a.likeCount + Math.round(a.viewCount / 50);
        const scoreB = b.likeCount + Math.round(b.viewCount / 50);
        return scoreB - scoreA;
      })
      .slice(0, HIGHLIGHT_COUNT);
  }, [communityPosts]);

  const filtered = useMemo(() => {
    const byCategory =
      filter === "전체"
        ? communityPosts
        : communityPosts.filter((p) => p.category === filter);
    const bySearch = byCategory.filter((p) => matchesQuery(p, query));
    return [...bySearch].sort((a, b) => {
      if (sortMode === "popular") return b.likeCount - a.likeCount;
      return +new Date(b.timestamp) - +new Date(a.timestamp);
    });
  }, [communityPosts, filter, query, sortMode]);

  const showHighlights = !(searchOpen && query.trim().length > 0);

  return (
    <div className="min-h-dvh bg-page pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-5 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          {searchOpen ? (
            <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-field px-3.5">
              <Search size={16} className="shrink-0 text-faint" strokeWidth={2} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목, 내용, 태그로 검색"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
              />
              <button
                type="button"
                aria-label="검색 닫기"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="shrink-0 text-faint active:opacity-70"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-[19px] font-bold">커뮤니티</h1>
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="검색"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-95"
                >
                  <Search size={20} strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  aria-label="글쓰기"
                  onClick={() => navigate("/community/write")}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-95"
                >
                  <PenSquare size={21} strokeWidth={1.9} />
                </button>
              </div>
            </>
          )}
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

      {showHighlights && (
        <section className="border-b border-line bg-white pb-4 pt-4">
          <div className="flex items-center gap-1.5 px-5">
            <TrendingUp size={15} className="text-brand" strokeWidth={2} />
            <p className="text-[13.5px] font-bold text-ink">이번 주 인기글</p>
          </div>
          <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto px-5">
            {highlights.map((post, i) => (
              <HighlightCard
                key={post.id}
                post={post}
                rank={i + 1}
                liked={likedPostIds.includes(post.id)}
                onClick={() => navigate(`/community/${post.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      <main className="px-5 pt-4">
        <div className="flex items-center gap-1.5">
          {(["popular", "latest"] as SortMode[]).map((mode) => {
            const active = sortMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                className={`rounded-full px-3 py-1 text-[12.5px] font-semibold transition ${
                  active ? "text-brand" : "text-faint"
                }`}
              >
                {mode === "popular" ? "인기순" : "최신순"}
              </button>
            );
          })}
          <span className="ml-auto text-[12px] text-faint">
            {filtered.length}개의 글
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-line bg-white py-14">
            <Users size={28} strokeWidth={1.6} className="text-faint" />
            <p className="text-[14px] font-semibold text-ink">
              {query.trim() ? "검색 결과가 없어요" : "아직 글이 없어요"}
            </p>
            <p className="text-[12px] text-faint">
              {query.trim()
                ? "다른 키워드로 검색해보세요"
                : "첫 번째 이야기를 남겨보세요"}
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {filtered.map((post, i) => {
              const showAd = i > 0 && i % 5 === 0;
              const liked = likedPostIds.includes(post.id);
              const scrapped = scrappedPostIds.includes(post.id);
              const onClick = () => navigate(`/community/${post.id}`);
              return (
                <div key={post.id} className="flex flex-col gap-3">
                  {showAd && <AdNativeCard ad={feedAdForIndex(i / 5 - 1)} />}
                  {post.imageUrls.length > 0 ? (
                    <PostCardPhoto
                      post={post}
                      liked={liked}
                      scrapped={scrapped}
                      onClick={onClick}
                    />
                  ) : (
                    <PostCardCompact
                      post={post}
                      liked={liked}
                      scrapped={scrapped}
                      onClick={onClick}
                    />
                  )}
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
