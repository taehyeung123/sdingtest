import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppContext";
import { USER_NAME, daysUntilWedding, formatDday } from "../lib/wedding";
import type { CommunityCategory } from "../types";

const CATEGORIES: CommunityCategory[] = ["후기", "고민상담", "자유", "정보공유"];

export default function CommunityWrite() {
  const navigate = useNavigate();
  const { addCommunityPost, showToast } = useApp();

  const [category, setCategory] = useState<CommunityCategory>(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 이 화면에서 생성한 blob URL 추적 — 언마운트 시 정리
  const createdUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      createdUrls.current.add(url);
      return url;
    });
    setImageUrls((prev) => [...prev, ...urls]);
  };

  const removeImage = (url: string) => {
    if (createdUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      createdUrls.current.delete(url);
    }
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    // 등록되는 URL은 언마운트 시 revoke 대상에서 제외 (게시글 상세에서 계속 사용)
    imageUrls.forEach((url) => createdUrls.current.delete(url));
    const authorBadge = `${formatDday(daysUntilWedding())} 예비신부`;
    const id = addCommunityPost({
      category,
      author: USER_NAME,
      authorBadge,
      title: title.trim(),
      body: body.trim(),
      imageUrls,
    });
    showToast("게시글이 등록됐어요");
    navigate(`/community/${id}`, { replace: true });
  };

  return (
    <div className="min-h-dvh bg-white pb-10">
      <PageHeader
        title="글쓰기"
        onBack={() => navigate(-1)}
        right={
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`px-2 text-[15px] font-bold transition ${
              canSubmit ? "text-brand active:opacity-70" : "text-faint"
            }`}
          >
            등록
          </button>
        }
      />

      <div className="px-5 pt-4">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-brand text-white"
                    : "border border-line text-sub active:bg-field"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요"
          className="mt-5 h-12 w-full border-b border-line text-[16px] font-bold outline-none placeholder:font-normal placeholder:text-faint"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="예비부부들과 나누고 싶은 이야기를 자유롭게 남겨보세요"
          className="mt-3 min-h-[180px] w-full resize-none text-[14px] leading-relaxed outline-none placeholder:text-faint"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[84px] w-[84px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d8d8dc] bg-field active:bg-black/[0.02]"
          >
            <ImagePlus size={20} strokeWidth={1.8} className="text-faint" />
            <span className="text-[11px] text-faint">
              {imageUrls.length}/10
            </span>
          </button>
          {imageUrls.map((url) => (
            <div
              key={url}
              className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-field"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white active:scale-95"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
