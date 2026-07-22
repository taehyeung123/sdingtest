import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Coins,
  ImagePlus,
  Sparkles,
  Star,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import BottomSheet from "../../components/BottomSheet";
import VendorThumb from "../../components/VendorThumb";
import { useApp } from "../../store/AppContext";
import { uid } from "../../lib/utils";
import { vendorsByCategory } from "../../data/vendors";
import { SYNTHESIS_COST, productsByVendor } from "../../data/products";
import type { VendorCategory, VendorProduct, VendorSummary } from "../../types";

export interface SynthesisPhoto {
  id: string;
  label: string;
  src: string;
}

// 드레스/웨딩홀 합성 화면이 공유하는 설정
// 흐름: 사진 선택 → 업체 선택 → 업체 등록 상품 선택 → (포인트/AI 패스) → 합성
export interface SynthesisConfig {
  /** PageHeader 타이틀 */
  title: string;
  photos: SynthesisPhoto[];
  vendorCategory: VendorCategory;
  vendorSectionTitle: string;
  productSectionTitle: string;
  /** 결과 화면 "상담 등록" CTA가 연결될 체크리스트 항목 */
  checklistItemId: string;
  resultBadge: string;
  resultSub: string;
  loadingPhrases: string[];
  /** 채팅 label 접두어 (예: "AI 드레스 피팅") */
  chatLabelPrefix: string;
  chatText: string;
  chatQuickReplies: string[];
}

type Step = "select" | "loading" | "result";
type CostSheet = null | "confirm" | "insufficient";

const UPLOAD_ID = "my-photo";

function CheckDot() {
  return (
    <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-brand">
      <Check size={12} strokeWidth={3} className="text-white" />
    </span>
  );
}

function CardLabel({ children }: { children: string }) {
  return (
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-6 text-[11px] font-medium text-white">
      {children}
    </span>
  );
}

function PhotoCard({
  src,
  label,
  selected,
  onSelect,
}: {
  src: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-dark-card transition active:scale-[0.98] ${
        selected ? "ring-2 ring-brand" : ""
      }`}
    >
      <img
        src={src}
        alt={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <CardLabel>{label}</CardLabel>
      {selected && <CheckDot />}
    </button>
  );
}

export default function SynthesisFlow({ config }: { config: SynthesisConfig }) {
  const navigate = useNavigate();
  const {
    appendMessages,
    points,
    aiPass,
    spendPoints,
    activateAiPass,
    showToast,
  } = useApp();

  const vendors = vendorsByCategory(config.vendorCategory);

  const [step, setStep] = useState<Step>("select");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [costSheet, setCostSheet] = useState<CostSheet>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const uploadedRef = useRef<string | null>(null);

  const vendor: VendorSummary | undefined = vendors.find(
    (v) => v.id === vendorId,
  );
  const products = vendorId ? productsByVendor(vendorId) : [];
  const product: VendorProduct | undefined = products.find(
    (p) => p.id === productId,
  );

  const canSynthesize = Boolean(photoId && vendor && product);

  // 업로드한 내 사진 blob 정리
  useEffect(() => {
    return () => {
      if (uploadedRef.current) URL.revokeObjectURL(uploadedRef.current);
    };
  }, []);

  // 합성 로딩 연출 (1.8초) + 문구 순환
  useEffect(() => {
    if (step !== "loading") return;
    setPhraseIdx(0);
    const phrase = window.setInterval(
      () => setPhraseIdx((i) => (i + 1) % config.loadingPhrases.length),
      700,
    );
    const done = window.setTimeout(() => setStep("result"), 1800);
    return () => {
      window.clearInterval(phrase);
      window.clearTimeout(done);
    };
  }, [step, config.loadingPhrases.length]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedRef.current) URL.revokeObjectURL(uploadedRef.current);
    const url = URL.createObjectURL(file);
    uploadedRef.current = url;
    setUploadedUrl(url);
    setPhotoId(UPLOAD_ID);
    e.target.value = "";
  };

  // CTA: AI 패스면 즉시, 아니면 포인트 확인 시트
  const handleSynthesizeTap = () => {
    if (!canSynthesize) return;
    if (aiPass) {
      setStep("loading");
      return;
    }
    setCostSheet(points >= SYNTHESIS_COST ? "confirm" : "insufficient");
  };

  const handleSpendAndRun = () => {
    if (!spendPoints(SYNTHESIS_COST)) {
      setCostSheet("insufficient");
      return;
    }
    setCostSheet(null);
    showToast(
      `${SYNTHESIS_COST}P 사용 · 남은 포인트 ${(points - SYNTHESIS_COST).toLocaleString()}P`,
    );
    setStep("loading");
  };

  const handleSubscribeAndRun = () => {
    activateAiPass();
    setCostSheet(null);
    showToast("스딩 AI 패스 구독 완료! 이제 합성이 무제한이에요");
    setStep("loading");
  };

  const handleSendToChat = () => {
    if (!vendor || !product) return;
    const now = new Date().toISOString();
    appendMessages([
      {
        id: uid(),
        sender: "user",
        type: "synthesisResult",
        synthesis: {
          imageUrl: product.imageUrl,
          label: `${config.chatLabelPrefix} · ${vendor.name} · ${product.name}`,
        },
        timestamp: now,
      },
      {
        id: uid(),
        sender: "ai",
        type: "quickReplies",
        text: config.chatText,
        quickReplies: config.chatQuickReplies,
        timestamp: now,
      },
    ]);
    navigate("/chat");
  };

  const pointChip = (
    <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-bold text-white">
      {aiPass ? (
        <>
          <BadgeCheck size={13} className="text-brand" />
          AI 패스
        </>
      ) : (
        <>
          <Coins size={13} className="text-brand" />
          {points.toLocaleString()}P
        </>
      )}
    </span>
  );

  return (
    <div className="min-h-dvh bg-dark text-white">
      <PageHeader
        title={config.title}
        dark
        onBack={() => navigate("/planner")}
        right={pointChip}
      />

      {step === "select" && (
        <main className="anim-fade px-5 pt-5 pb-36">
          {/* 1. 사진 선택 */}
          <h2 className="text-[15px] font-semibold">
            합성에 사용할 사진을 골라주세요
          </h2>
          <p className="mt-1 text-[12px] text-white/50">
            베타에서는 준비된 모델 사진 또는 내 사진을 쓸 수 있어요
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {config.photos.map((p) => (
              <PhotoCard
                key={p.id}
                src={p.src}
                label={p.label}
                selected={photoId === p.id}
                onSelect={() => setPhotoId(p.id)}
              />
            ))}
            <label
              onClick={() => {
                if (uploadedRef.current) setPhotoId(UPLOAD_ID);
              }}
              className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl transition active:scale-[0.98] ${
                uploadedUrl
                  ? "bg-dark-card"
                  : "flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/25 bg-dark-card"
              } ${photoId === UPLOAD_ID ? "ring-2 ring-brand" : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleUpload}
              />
              {uploadedUrl ? (
                <>
                  <img
                    src={uploadedUrl}
                    alt="내 사진"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <CardLabel>내 사진</CardLabel>
                  {photoId === UPLOAD_ID && <CheckDot />}
                </>
              ) : (
                <>
                  <ImagePlus size={20} className="text-white/60" />
                  <span className="text-[11px] text-white/60">
                    내 사진 올리기
                  </span>
                </>
              )}
            </label>
          </div>

          {/* 2. 업체 선택 */}
          {photoId !== null && (
            <section className="anim-rise mt-8">
              <h3 className="text-[16px] font-bold">
                {config.vendorSectionTitle}
              </h3>
              <p className="mt-1 text-[12px] text-white/50">
                스딩 등록 업체의 실제 등록 상품으로 합성해요
              </p>
              <div className="no-scrollbar -mx-5 mt-3 flex gap-2.5 overflow-x-auto px-5">
                {vendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVendorId(v.id);
                      setProductId(null);
                    }}
                    className={`w-[124px] shrink-0 rounded-xl bg-dark-card p-2.5 text-left transition active:scale-[0.98] ${
                      vendorId === v.id ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <VendorThumb
                      category={v.category}
                      thumbnailUrl={v.thumbnailUrl}
                      className="h-16 w-full rounded-lg"
                      iconSize={20}
                    />
                    <span className="mt-2 block truncate text-[12px] font-semibold">
                      {v.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/50">
                      <Star size={10} className="fill-consult text-consult" />
                      {v.rating} · 후기 {v.reviewCount}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 3. 상품 선택 */}
          {vendor && (
            <section className="anim-rise mt-7">
              <h3 className="text-[16px] font-bold">
                {config.productSectionTitle}
              </h3>
              <p className="mt-1 text-[12px] text-white/50">
                {vendor.name}에 등록된 상품 {products.length}개
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    className={`relative overflow-hidden rounded-xl bg-dark-card text-left transition active:scale-[0.98] ${
                      productId === p.id ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover object-top"
                        style={{ filter: p.filter }}
                      />
                    </div>
                    <div className="p-2.5">
                      <span className="block truncate text-[12px] font-semibold">
                        {p.name}
                      </span>
                      {p.priceLabel && (
                        <span className="mt-0.5 block text-[11px] text-white/50">
                          정찰가 {p.priceLabel}
                        </span>
                      )}
                    </div>
                    {productId === p.id && <CheckDot />}
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {step === "loading" && (
        <main className="anim-fade flex min-h-[calc(100dvh-52px)] flex-col items-center justify-center px-5 pb-16">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full border border-brand/40"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-card"
            >
              <Sparkles size={28} className="text-brand" />
            </motion.div>
          </div>
          <p className="mt-6 text-[16px] font-bold">AI가 합성 중이에요…</p>
          <p key={phraseIdx} className="anim-fade mt-2 h-5 text-[13px] text-white/55">
            {config.loadingPhrases[phraseIdx]}
          </p>
        </main>
      )}

      {step === "result" && vendor && product && (
        <main className="anim-rise px-5 pt-4 pb-[max(env(safe-area-inset-bottom),24px)]">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-dark-card">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              style={{ filter: product.filter }}
            />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur">
              <Sparkles size={13} className="text-white" />
              <span className="text-[12px] font-semibold">
                {config.resultBadge}
              </span>
            </div>
          </div>

          <p className="mt-5 text-center text-[17px] font-bold">
            {vendor.name} · {product.name}
          </p>
          <p className="mt-1 text-center text-[13px] text-white/55">
            {config.resultSub}
          </p>
          {product.priceLabel && (
            <p className="mt-2 text-center text-[12px] text-white/45">
              정찰가 {product.priceLabel} · 추가금 없는 정찰제
            </p>
          )}

          <p className="mt-4 text-center text-[11px] text-white/40">
            베타 데모 화면이에요. 실제 AI 합성 결과가 아니에요.
          </p>

          <button
            type="button"
            onClick={handleSendToChat}
            className="mt-5 h-[52px] w-full rounded-xl bg-brand text-[15px] font-bold text-white transition active:scale-[0.98]"
          >
            채팅으로 보내기
          </button>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="h-12 rounded-xl border border-white/10 bg-dark-card text-[13px] font-semibold text-white/85 transition active:scale-[0.98]"
            >
              다시 합성하기
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/vendors/${encodeURIComponent(vendor.category)}/${vendor.id}?item=${config.checklistItemId}`,
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-dark-card text-[13px] font-semibold text-white/85 transition active:scale-[0.98]"
            >
              이 업체 자세히 보기
            </button>
          </div>
        </main>
      )}

      {step === "select" && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
          <div className="w-full max-w-[430px] bg-gradient-to-t from-dark via-dark to-transparent px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
            <button
              type="button"
              disabled={!canSynthesize}
              onClick={handleSynthesizeTap}
              className={`flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition ${
                canSynthesize
                  ? "bg-brand text-white active:scale-[0.98]"
                  : "bg-dark-card text-white/30"
              }`}
            >
              합성하기
              <span
                className={`text-[12px] font-semibold ${canSynthesize ? "text-white/80" : "text-white/25"}`}
              >
                {aiPass ? "· AI 패스 무제한" : `· ${SYNTHESIS_COST}P`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 포인트 차감 / 구독 유도 시트 */}
      <BottomSheet
        open={costSheet !== null}
        onClose={() => setCostSheet(null)}
        title={
          costSheet === "insufficient"
            ? "포인트가 부족해요"
            : "포인트로 합성할까요?"
        }
      >
        <div className="px-5 pb-2 pt-1 text-ink">
          <p className="text-[13px] text-sub">
            {costSheet === "insufficient" ? (
              <>
                합성 1회에 {SYNTHESIS_COST}P가 필요해요 · 보유{" "}
                <b className="text-ink">{points.toLocaleString()}P</b>
              </>
            ) : (
              <>
                합성 1회에 {SYNTHESIS_COST}P가 차감돼요 · 보유{" "}
                <b className="text-ink">{points.toLocaleString()}P</b>
              </>
            )}
          </p>

          {costSheet === "confirm" && (
            <button
              type="button"
              onClick={handleSpendAndRun}
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[15px] font-bold text-white transition active:scale-[0.98]"
            >
              <Coins size={16} />
              {SYNTHESIS_COST}P 사용하고 합성하기
            </button>
          )}

          <button
            type="button"
            onClick={handleSubscribeAndRun}
            className={`flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition active:bg-brand/15 ${
              costSheet === "insufficient" ? "mt-4 bg-tint" : "mt-2.5 bg-tint"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <BadgeCheck size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">
                스딩 AI 패스 구독하기
              </span>
              <span className="mt-0.5 block text-[12px] text-sub">
                월 9,900원 · AI 합성 무제한 + 매달 1,000P
              </span>
            </span>
            <span className="shrink-0 text-[13px] font-bold text-brand">
              구독
            </span>
          </button>

          {costSheet === "insufficient" && (
            <button
              type="button"
              onClick={() => showToast("포인트 충전은 베타에서 준비 중이에요")}
              className="mt-2 h-11 w-full rounded-xl border border-line text-[13px] font-semibold text-sub transition active:bg-black/[0.03]"
            >
              포인트 충전하기
            </button>
          )}

          <p className="mt-3 text-center text-[11px] text-faint">
            베타 데모라 실제 결제는 일어나지 않아요 · 가입 축하 포인트 3,000P
            지급
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
