import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hash, ImagePlus, MapPin, Star, Store, Tag, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomSheet from "../components/BottomSheet";
import RegionChips from "../components/RegionChips";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { USER_NAME, daysUntilWedding, formatDday } from "../lib/wedding";
import { vendorsByCategory } from "../data/vendors";
import type {
  CommunityCategory,
  Region,
  VendorCategory,
  VendorSummary,
} from "../types";
import { VENDOR_CATEGORIES } from "../types";

const MAX_TAGS = 5;

const CATEGORIES: CommunityCategory[] = ["후기", "고민상담", "자유", "정보공유"];

interface VendorTag {
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
}

// 업체 태그 선택 바텀시트 — 카테고리 선택 후 그 카테고리의 스딩 등록 업체를 고른다
function VendorTagSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (vendor: VendorSummary) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<VendorCategory | null>(
    null,
  );
  const vendors = activeCategory ? vendorsByCategory(activeCategory) : [];

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        onClose();
        setActiveCategory(null);
      }}
      title="태그할 업체를 선택해주세요"
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3 pt-1">
        {VENDOR_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? "bg-brand text-white"
                  : "border border-line text-sub active:bg-field"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="max-h-[46vh] overflow-y-auto px-5 pb-2">
        {activeCategory === null ? (
          <p className="py-8 text-center text-[13px] text-faint">
            먼저 카테고리를 선택해주세요
          </p>
        ) : vendors.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-faint">
            아직 등록된 업체가 없어요
          </p>
        ) : (
          <div className="flex flex-col gap-2 pb-2">
            {vendors.map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                onClick={() => {
                  onSelect(vendor);
                  setActiveCategory(null);
                }}
                className="flex items-center gap-3 rounded-2xl border border-line p-2.5 text-left transition active:scale-[0.99] active:bg-field"
              >
                <VendorThumb
                  category={vendor.category}
                  thumbnailUrl={vendor.thumbnailUrl}
                  className="h-12 w-12 rounded-xl"
                  iconSize={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink">
                    {vendor.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-sub">
                    <Star size={11} className="fill-[#FFC107] text-[#FFC107]" />
                    <span className="font-semibold text-ink">
                      {vendor.rating.toFixed(1)}
                    </span>
                    <span>· 정찰가 {vendor.priceLabel}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

export default function CommunityWrite() {
  const navigate = useNavigate();
  const { addCommunityPost, showToast } = useApp();

  const [category, setCategory] = useState<CommunityCategory>(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [vendorTag, setVendorTag] = useState<VendorTag | null>(null);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
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

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (!t || tags.length >= MAX_TAGS || tags.includes(t)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setTags((prev) => prev.filter((tag) => tag !== t));
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
      vendorTag: vendorTag ?? undefined,
      region: region ?? undefined,
      tags,
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

        <div className="mt-5 border-t border-line pt-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-sub">
            <Hash size={14} />
            해시태그 (선택, 최대 {MAX_TAGS}개)
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  addTag();
                }
              }}
              disabled={tags.length >= MAX_TAGS}
              placeholder={
                tags.length >= MAX_TAGS
                  ? "최대 개수만큼 추가했어요"
                  : "태그 입력 후 Enter (예: 정찰제)"
              }
              className="h-10 min-w-0 flex-1 rounded-xl bg-field px-3.5 text-[13.5px] outline-none placeholder:text-faint disabled:opacity-60"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tagInput.trim().length === 0 || tags.length >= MAX_TAGS}
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                tagInput.trim().length > 0 && tags.length < MAX_TAGS
                  ? "bg-brand text-white active:scale-95"
                  : "bg-field text-faint"
              }`}
            >
              추가
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-[12px] font-semibold text-brand"
                >
                  #{tag}
                  <button
                    type="button"
                    aria-label={`${tag} 태그 제거`}
                    onClick={() => removeTag(tag)}
                    className="active:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-sub">
            <MapPin size={14} />
            지역 (선택)
          </p>
          <div className="mt-2.5">
            <RegionChips value={region} onChange={setRegion} />
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-sub">
            <Tag size={14} />
            업체 태그 (선택)
          </p>

          {vendorTag ? (
            <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line bg-field/60 p-3">
              <VendorThumb
                category={vendorTag.category}
                className="h-11 w-11 rounded-xl"
                iconSize={18}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">
                  {vendorTag.vendorName}
                </p>
                <p className="mt-0.5 text-[11px] text-sub">
                  {vendorTag.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTagSheetOpen(true)}
                className="shrink-0 text-[12px] font-semibold text-brand active:opacity-70"
              >
                변경
              </button>
              <button
                type="button"
                aria-label="업체 태그 제거"
                onClick={() => setVendorTag(null)}
                className="shrink-0 rounded-full p-1 text-faint active:bg-black/[0.04]"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTagSheetOpen(true)}
              className="mt-2.5 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d8d8dc] text-[13px] font-semibold text-sub active:bg-field"
            >
              <Store size={15} />
              업체 태그하기
            </button>
          )}
        </div>
      </div>

      <VendorTagSheet
        open={tagSheetOpen}
        onClose={() => setTagSheetOpen(false)}
        onSelect={(vendor) => {
          setVendorTag({
            vendorId: vendor.id,
            vendorName: vendor.name,
            category: vendor.category,
          });
          setTagSheetOpen(false);
        }}
      />
    </div>
  );
}
