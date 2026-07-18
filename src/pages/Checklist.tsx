import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomSheet from "../components/BottomSheet";
import FloatingChat from "../components/FloatingChat";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { GROUP_ORDER, progressPercent } from "../lib/wedding";
import type { ChecklistItem } from "../types";

interface SheetProps {
  item: ChecklistItem | null;
  open: boolean;
  onClose: () => void;
}

// 업체 처리 바텀시트 — 기획서 5.3, 3가지 액션 병렬 제시
function ItemActionSheet({ item, open, onClose }: SheetProps) {
  const navigate = useNavigate();
  const { completeWithoutVendor, toggleItem, showToast } = useApp();

  const vendor = item?.vendor;
  const photoUrl = vendor?.productPhotoUrl ?? vendor?.contractPhotoUrl;
  const editMode = Boolean(vendor?.vendorName);

  return (
    <BottomSheet open={open && item !== null} onClose={onClose} title={item?.title}>
      {item !== null && (
        <div className="pb-1">
          {vendor && (
            <div className="mx-5 mt-2 flex items-center gap-3 rounded-2xl bg-field p-3">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="등록된 사진"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">
                {vendor.vendorName ?? "업체 미등록"}
              </span>
              <StatusBadge status={vendor.status} />
            </div>
          )}

          <div className="mt-2 divide-y divide-line">
            <button
              type="button"
              onClick={() => navigate(`/checklist/${item.id}/register`)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-black/[0.03]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
                <Building2 size={19} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">
                  {editMode ? "업체 정보 수정하기" : "업체 등록하기"}
                </span>
                <span className="mt-0.5 block text-[12px] text-sub">
                  상품·계약서 사진을 올려요
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (item.category) {
                  navigate(
                    `/vendors/${encodeURIComponent(item.category)}?item=${item.id}`,
                  );
                }
              }}
              className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-black/[0.03]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint text-brand">
                <Search size={19} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">업체 보러가기</span>
                <span className="mt-0.5 block text-[12px] text-sub">
                  스딩 등록 업체를 둘러봐요
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                completeWithoutVendor(item.id);
                showToast(`${item.title} 항목을 완료로 표시했어요`);
                onClose();
              }}
              className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-black/[0.03]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 size={19} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">
                  업체 등록 없이 완료 처리
                </span>
                <span className="mt-0.5 block text-[12px] text-sub">
                  나중에 업체를 등록할 수도 있어요
                </span>
              </span>
            </button>
          </div>

          {item.isDone && (
            <div className="flex justify-center border-t border-line py-3">
              <button
                type="button"
                onClick={() => {
                  toggleItem(item.id);
                  onClose();
                }}
                className="text-[13px] text-faint underline"
              >
                완료 해제하기
              </button>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

export default function Checklist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, summary, toggleItem, setItemMemo } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  // highlight 쿼리파람 — 해당 항목으로 스크롤 후 tint 플래시 강조
  const highlight = searchParams.get("highlight");
  useEffect(() => {
    if (!highlight) return;
    const scrollTimer = setTimeout(() => {
      document
        .getElementById(`check-item-${highlight}`)
        ?.scrollIntoView({ block: "center" });
      setFlashId(highlight);
    }, 80);
    const clearTimer = setTimeout(() => setFlashId(null), 1700);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [highlight]);

  const percent = progressPercent(summary);
  const sheetItem = items.find((it) => it.id === sheetItemId) ?? null;

  const handleRowTap = (item: ChecklistItem) => {
    if (item.category) {
      setSheetItemId(item.id);
      setSheetOpen(true);
      return;
    }
    // 단순 체크형: 탭 → 체크 토글 + 메모 입력 펼침 / 다시 탭하면 접힘
    toggleItem(item.id);
    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

  return (
    <div className="min-h-dvh bg-page pb-12">
      <PageHeader
        title="웨딩 체크리스트"
        onBack={() => navigate("/")}
        right={
          <span className="text-[14px] font-bold text-ink">
            <span className="text-brand">{summary.doneCount}</span>
            <span className="text-faint">/{summary.totalCount}</span>
          </span>
        }
      />

      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-field">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-sub">
          {percent}% 완료
        </span>
      </div>

      <div className="px-5">
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((it) => it.group === group);
          if (groupItems.length === 0) return null;
          const doneCount = groupItems.filter((it) => it.isDone).length;
          return (
            <section key={group} className="mt-6">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-[13px] font-bold text-sub">{group}</h2>
                <span className="text-[11px] text-faint">
                  {doneCount}/{groupItems.length}
                </span>
              </div>

              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    id={`check-item-${item.id}`}
                    className={`transition-colors duration-1000 ${
                      flashId === item.id ? "bg-tint" : "bg-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleRowTap(item)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-black/[0.02]"
                    >
                      <span
                        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${
                          item.isDone ? "bg-success" : "border-2 border-line"
                        }`}
                      >
                        {item.isDone && (
                          <Check size={13} strokeWidth={3} className="text-white" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[14px] font-medium ${
                            item.isDone ? "text-faint line-through" : "text-ink"
                          }`}
                        >
                          {item.title}
                        </span>

                        {item.category && (
                          <span className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-field px-1.5 py-0.5 text-[10px] text-sub">
                              {item.category}
                            </span>
                            <StatusBadge
                              status={item.vendor ? item.vendor.status : "미등록"}
                            />
                            {item.vendor?.vendorName && (
                              <span className="truncate text-[12px] text-sub">
                                {item.vendor.vendorName}
                              </span>
                            )}
                          </span>
                        )}

                        {!item.category &&
                          item.memo &&
                          expandedId !== item.id && (
                            <span className="mt-0.5 block truncate text-[12px] text-faint">
                              {item.memo}
                            </span>
                          )}
                      </span>

                      <ChevronRight size={18} className="shrink-0 text-faint" />
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedId === item.id && item.category === null && (
                        <motion.div
                          key="memo"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pb-3.5 pl-[50px] pr-4">
                            <input
                              autoFocus
                              defaultValue={item.memo ?? ""}
                              placeholder="짧은 메모 남기기 (선택)"
                              onBlur={(e) => setItemMemo(item.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setItemMemo(item.id, e.currentTarget.value);
                                  e.currentTarget.blur();
                                  setExpandedId(null);
                                }
                              }}
                              className="h-10 w-full rounded-lg bg-field px-3 text-[13px] outline-none placeholder:text-faint focus:ring-2 focus:ring-brand/40"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ItemActionSheet
        item={sheetItem}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <FloatingChat offsetClass="bottom-[max(env(safe-area-inset-bottom),24px)]" />
    </div>
  );
}
