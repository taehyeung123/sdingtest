import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import VendorThumb from "../components/VendorThumb";
import BottomSheet from "../components/BottomSheet";
import { useApp } from "../store/AppContext";
import { vendorById } from "../data/vendors";
import { vendorDetailById } from "../data/vendorDetails";
import type { DetailOption, DetailProduct } from "../data/vendorDetails";
import { formatTime } from "../lib/utils";
import type { ConsultationSlot, VendorSummary } from "../types";

// AI 합성에서 업체 선택이 지원되는 카테고리 (SynthesisFlow 참고)
const AI_SYNTHESIS_ROUTE: Partial<Record<string, string>> = {
  드레스: "/ai/dress",
  웨딩홀: "/ai/hall",
};

const MAX_SLOTS = 3;
const TIME_SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const won = (n: number) => `${n.toLocaleString()}원`;

// 앞으로 14일 (오늘 제외 내일부터)
function upcomingDates(): { iso: string; day: number; weekday: string; month: number }[] {
  const out = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      day: d.getDate(),
      weekday: WEEKDAYS[d.getDay()],
      month: d.getMonth() + 1,
    });
  }
  return out;
}

function slotLabel(slot: ConsultationSlot): string {
  const [, m, d] = slot.date.split("-");
  return `${Number(m)}/${Number(d)} ${slot.time}`;
}

// ---- 상담 예약 시트 ----------------------------------------------------------

function BookingSheet({
  open,
  onClose,
  vendor,
  checklistItemId,
}: {
  open: boolean;
  onClose: () => void;
  vendor: VendorSummary;
  checklistItemId?: string;
}) {
  const { items, addConsultation, registerVendor, showToast } = useApp();
  const dates = useMemo(upcomingDates, []);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);

  const toggleSlot = (time: string) => {
    if (!activeDate) return;
    const exists = slots.find((s) => s.date === activeDate && s.time === time);
    if (exists) {
      setSlots((prev) => prev.filter((s) => s !== exists));
      return;
    }
    if (slots.length >= MAX_SLOTS) {
      showToast(`희망 시간은 최대 ${MAX_SLOTS}개까지 선택할 수 있어요`);
      return;
    }
    setSlots((prev) => [...prev, { date: activeDate, time }]);
  };

  const handleSubmit = () => {
    if (slots.length === 0) return;
    addConsultation({
      vendorId: vendor.id,
      vendorName: vendor.name,
      category: vendor.category,
      slots,
    });
    // 체크리스트에도 상담중으로 연결 (이미 계약완료면 건드리지 않음)
    const item =
      items.find((it) => it.id === checklistItemId) ??
      items.find((it) => it.category === vendor.category);
    if (item && item.vendor?.status !== "계약완료") {
      registerVendor(item.id, {
        status: "상담중",
        vendorName: vendor.name,
        linkedVendorId: vendor.id,
        memo: `상담 희망: ${slots.map(slotLabel).join(", ")}`,
        registeredAt: new Date().toISOString().slice(0, 10),
      });
    }
    showToast("상담 예약이 신청됐어요. 업체 확인 후 확정돼요");
    setSlots([]);
    setActiveDate(null);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="상담 예약">
      <div className="px-5 pb-2 pt-1">
        <p className="text-[13px] text-sub">
          희망 날짜와 시간을 <b className="text-ink">최대 {MAX_SLOTS}개</b>까지
          선택해주세요. 업체가 확인 후 한 곳으로 확정해드려요.
        </p>

        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
          {dates.map((d) => {
            const active = activeDate === d.iso;
            const count = slots.filter((s) => s.date === d.iso).length;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setActiveDate(d.iso)}
                className={`relative flex w-[52px] shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2.5 transition ${
                  active
                    ? "border-brand bg-tint"
                    : "border-line bg-white active:bg-field"
                }`}
              >
                <span
                  className={`text-[11px] ${d.weekday === "일" ? "text-red-500" : d.weekday === "토" ? "text-blue-500" : "text-faint"}`}
                >
                  {d.weekday}
                </span>
                <span className={`text-[15px] font-bold ${active ? "text-brand" : "text-ink"}`}>
                  {d.day}
                </span>
                <span className="text-[10px] text-faint">{d.month}월</span>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeDate ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((time) => {
              const selected = slots.some(
                (s) => s.date === activeDate && s.time === time,
              );
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleSlot(time)}
                  className={`h-9 rounded-lg text-[13px] font-semibold transition ${
                    selected
                      ? "bg-brand text-white"
                      : "border border-line text-sub active:bg-field"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 py-3 text-center text-[12px] text-faint">
            날짜를 먼저 선택해주세요
          </p>
        )}

        {slots.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3">
            {slots.map((s) => (
              <span
                key={`${s.date}-${s.time}`}
                className="flex items-center gap-1 rounded-full bg-tint px-2.5 py-1.5 text-[12px] font-semibold text-brand"
              >
                {slotLabel(s)}
                <button
                  type="button"
                  aria-label="선택 해제"
                  onClick={() =>
                    setSlots((prev) => prev.filter((x) => x !== s))
                  }
                  className="active:opacity-60"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={slots.length === 0}
          onClick={handleSubmit}
          className={`mt-4 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition ${
            slots.length > 0
              ? "bg-brand text-white active:scale-[0.98]"
              : "bg-field text-faint"
          }`}
        >
          <CalendarCheck size={17} />
          상담 예약 신청 ({slots.length}/{MAX_SLOTS})
        </button>
        <p className="mt-2.5 pb-1 text-center text-[11px] text-faint">
          베타 데모 예약으로 실제 업체에 전달되지 않아요
        </p>
      </div>
    </BottomSheet>
  );
}

// ---- 앱내 결제 시트 ----------------------------------------------------------

function PaymentSheet({
  open,
  onClose,
  vendor,
  products,
  options,
  checklistItemId,
}: {
  open: boolean;
  onClose: () => void;
  vendor: VendorSummary;
  products: DetailProduct[];
  options: DetailOption[];
  checklistItemId?: string;
}) {
  const { items, addOrder, registerVendor } = useApp();
  const [productId, setProductId] = useState<string | null>(
    products[0]?.id ?? null,
  );
  const [optionNames, setOptionNames] = useState<string[]>([]);
  const [phase, setPhase] = useState<"select" | "processing" | "done">("select");

  const product = products.find((p) => p.id === productId);
  const optionTotal = options
    .filter((o) => optionNames.includes(o.name))
    .reduce((acc, o) => acc + o.price, 0);
  const total = (product?.price ?? 0) + optionTotal;

  const handlePay = () => {
    if (!product) return;
    setPhase("processing");
    window.setTimeout(() => {
      addOrder({
        vendorId: vendor.id,
        vendorName: vendor.name,
        category: vendor.category,
        productName: product.name,
        optionNames,
        totalPrice: total,
      });
      // 결제 = 계약 확정 → 체크리스트 계약완료 연동
      const item =
        items.find((it) => it.id === checklistItemId) ??
        items.find((it) => it.category === vendor.category);
      if (item) {
        registerVendor(item.id, {
          status: "계약완료",
          vendorName: vendor.name,
          linkedVendorId: vendor.id,
          memo: `앱내 결제: ${product.name} (${won(total)})`,
          registeredAt: new Date().toISOString().slice(0, 10),
        });
      }
      setPhase("done");
    }, 1400);
  };

  const handleClose = () => {
    if (phase === "processing") return;
    setPhase("select");
    setOptionNames([]);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={phase === "done" ? "결제 완료" : "상품 결제"}
    >
      <div className="px-5 pb-2 pt-1">
        {phase === "done" ? (
          <div className="flex flex-col items-center py-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Check size={28} strokeWidth={2.6} className="text-success" />
            </span>
            <p className="mt-3 text-[16px] font-bold">
              {product?.name} 결제가 완료됐어요
            </p>
            <p className="mt-1 text-[13px] text-sub">
              총 {won(total)} · 체크리스트에 계약완료로 반영했어요
            </p>
            <p className="mt-1 text-[11px] text-faint">
              베타 데모 결제라 실제 청구는 없어요
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 h-11 w-full rounded-xl bg-brand text-[14px] font-bold text-white transition active:scale-[0.98]"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-sub">상품 선택</p>
            <div className="mt-2 flex flex-col gap-2">
              {products.map((p) => {
                const active = productId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active ? "border-brand bg-tint" : "border-line active:bg-field"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-brand bg-brand" : "border-line"
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-sub">
                        {p.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13.5px] font-extrabold text-ink">
                      {won(p.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            {options.length > 0 && (
              <>
                <p className="mt-4 text-[13px] font-semibold text-sub">
                  추가옵션 (선택)
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {options.map((o) => {
                    const active = optionNames.includes(o.name);
                    return (
                      <button
                        key={o.name}
                        type="button"
                        onClick={() =>
                          setOptionNames((prev) =>
                            active
                              ? prev.filter((n) => n !== o.name)
                              : [...prev, o.name],
                          )
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active ? "border-brand bg-tint" : "border-line active:bg-field"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                            active ? "border-brand bg-brand" : "border-line"
                          }`}
                        >
                          {active && <Check size={12} strokeWidth={3} className="text-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-ink">
                            {o.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-sub">
                            {o.desc}
                          </span>
                        </span>
                        <span className="shrink-0 text-[12.5px] font-bold text-ink">
                          +{won(o.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
              <span className="text-[13px] font-semibold text-sub">
                총 결제 금액
              </span>
              <span className="text-[18px] font-extrabold text-brand">
                {won(total)}
              </span>
            </div>

            <button
              type="button"
              disabled={!product || phase === "processing"}
              onClick={handlePay}
              className="mt-3 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
            >
              {phase === "processing" ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  결제 진행 중…
                </>
              ) : (
                <>
                  <CreditCard size={17} />
                  {won(total)} 결제하기
                </>
              )}
            </button>
            <p className="mt-2.5 pb-1 text-center text-[11px] text-faint">
              베타 데모 결제로 실제 청구는 일어나지 않아요
            </p>
          </>
        )}
      </div>
    </BottomSheet>
  );
}

// ---- 업체 상세 ---------------------------------------------------------------

export default function VendorDetail() {
  const { category: rawCategory, vendorId } = useParams<{
    category: string;
    vendorId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    communityPosts,
    likedPostIds,
    favoriteVendorIds,
    toggleFavoriteVendor,
    trackVendorView,
  } = useApp();

  const vendor = vendorId ? vendorById(vendorId) : undefined;
  const detail = vendorId ? vendorDetailById(vendorId) : undefined;
  const [descExpanded, setDescExpanded] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

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

  if (!vendor || !detail) return null;

  const favorited = favoriteVendorIds.includes(vendor.id);
  const reviews = communityPosts
    .filter((p) => p.vendorTag?.vendorId === vendor.id)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const aiRoute = AI_SYNTHESIS_ROUTE[vendor.category];
  const checklistItemId = searchParams.get("item") ?? undefined;

  return (
    <div className="min-h-dvh bg-white pb-32">
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
        {/* 기본 정보 */}
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
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 영업 정보 (수집도구 공통 필드: 연락처/운영시간/주소) */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line p-3.5 text-[13px]">
          <span className="flex items-center gap-2 text-sub">
            <Phone size={14} className="shrink-0 text-faint" />
            {detail.contact}
          </span>
          <span className="flex items-center gap-2 text-sub">
            <Clock size={14} className="shrink-0 text-faint" />
            영업시간 {detail.hours}
          </span>
          <span className="flex items-center gap-2 text-sub">
            <MapPin size={14} className="shrink-0 text-faint" />
            {detail.address}
          </span>
        </div>

        {/* 스딩 제휴혜택 */}
        {detail.sdingBenefit && (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-tint p-3.5">
            <Gift size={17} className="shrink-0 text-brand" />
            <span className="text-[13px] font-semibold text-ink">
              {detail.sdingBenefit}
            </span>
          </div>
        )}

        {/* 업체 소개 */}
        <div className="mt-6 border-t border-line pt-4">
          <h2 className="text-[15px] font-bold">업체 소개</h2>
          <p
            className={`mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink ${
              descExpanded ? "" : "line-clamp-3"
            }`}
          >
            {detail.description}
          </p>
          {detail.description.length > 80 && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1.5 text-[12.5px] font-semibold text-sub active:opacity-70"
            >
              {descExpanded ? "접기" : "더보기"}
            </button>
          )}
        </div>

        {/* 상품구성 + 가격 */}
        <div className="mt-6 border-t border-line pt-4">
          <h2 className="text-[15px] font-bold">
            상품구성 <span className="text-faint">{detail.products.length}</span>
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {detail.products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-line p-3"
              >
                {p.imageUrl && (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-field">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover object-top"
                      style={{ filter: p.filter }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink">
                    {p.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-sub">
                    {p.description}
                  </p>
                  <p className="mt-1 text-[13.5px] font-extrabold text-ink">
                    {won(p.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추가옵션 */}
        {detail.options.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <h2 className="text-[15px] font-bold">추가옵션</h2>
            <div className="mt-3 flex flex-col divide-y divide-line rounded-2xl border border-line">
              {detail.options.map((o) => (
                <div key={o.name} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">{o.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-sub">{o.desc}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold text-ink">
                    +{won(o.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 상세정보 (업종별 category_data) */}
        {detail.infoRows.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <h2 className="text-[15px] font-bold">상세정보</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {detail.infoRows.map((row) => (
                <div key={row.label} className="flex gap-3 text-[13px]">
                  <span className="w-[110px] shrink-0 text-faint">
                    {row.label}
                  </span>
                  <span className="min-w-0 flex-1 leading-relaxed text-ink">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 특이사항 */}
        {detail.specialNotes && (
          <div className="mt-6 border-t border-line pt-4">
            <h2 className="text-[15px] font-bold">특이사항</h2>
            <p className="mt-2 rounded-xl bg-field/70 p-3 text-[12.5px] leading-relaxed text-sub">
              {detail.specialNotes}
            </p>
          </div>
        )}

        {/* AI 체험 크로스링크 */}
        {aiRoute && (
          <button
            type="button"
            onClick={() => navigate(aiRoute)}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-line bg-field/60 p-3.5 text-left transition active:scale-[0.99] active:bg-field"
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
            <ChevronRight size={16} className="shrink-0 text-faint" />
          </button>
        )}

        {/* 실제 후기 */}
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
          베타 데모 화면이에요. 실제 업체·후기·결제와 무관해요.
        </p>
      </div>

      {/* 하단 고정 CTA — 상담 예약 + 앱내 결제 */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <div className="grid w-full max-w-[430px] grid-cols-2 gap-2.5 border-t border-line bg-white px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="flex h-[52px] items-center justify-center gap-1.5 rounded-xl border border-brand bg-white text-[14.5px] font-bold text-brand transition active:scale-[0.98]"
          >
            <CalendarCheck size={17} />
            상담 예약
          </button>
          <button
            type="button"
            onClick={() => setPaymentOpen(true)}
            className="flex h-[52px] items-center justify-center gap-1.5 rounded-xl bg-brand text-[14.5px] font-bold text-white transition active:scale-[0.98]"
          >
            <CreditCard size={17} />
            바로 결제
          </button>
        </div>
      </div>

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        vendor={vendor}
        checklistItemId={checklistItemId}
      />
      <PaymentSheet
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        vendor={vendor}
        products={detail.products}
        options={detail.options}
        checklistItemId={checklistItemId}
      />
    </div>
  );
}
