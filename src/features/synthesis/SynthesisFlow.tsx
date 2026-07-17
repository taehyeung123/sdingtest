import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ImagePlus, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../store/AppContext";
import { uid } from "../../lib/utils";
import type { VendorCategory } from "../../types";

export interface SynthesisPhoto {
  id: string;
  label: string;
  src: string;
}

// 드레스/웨딩홀 합성 화면이 공유하는 설정 (기획서 5.4/5.5, 플로우 D)
export interface SynthesisConfig {
  /** PageHeader 타이틀이자 채팅 label 접두어 */
  title: string;
  photos: SynthesisPhoto[];
  styleSectionTitle: string;
  styles: string[];
  /** 결과 mock 이미지 — 채팅으로도 이 경로가 그대로 전달됨 */
  resultImage: string;
  resultBadge: string;
  resultSub: string;
  loadingPhrases: string[];
  vendorCategory: VendorCategory;
  vendorLinkLabel: string;
  chatText: string;
  chatQuickReplies: string[];
}

type Step = "select" | "loading" | "result";

// 스타일 인덱스별 mock 변형 — 실제 합성 대신 같은 이미지에 톤만 달리 적용
const STYLE_FILTERS = [
  "brightness(1.04) contrast(1.03)",
  "sepia(0.12) brightness(1.05) contrast(1.04)",
  "hue-rotate(-6deg) saturate(1.15) brightness(1.02)",
  "grayscale(0.2) brightness(1.07) contrast(1.05)",
];

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
  const { appendMessages } = useApp();

  const [step, setStep] = useState<Step>("select");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [styleIdx, setStyleIdx] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const uploadedRef = useRef<string | null>(null);
  uploadedRef.current = uploadedUrl;

  // 업로드한 로컬 blob URL 정리 (언마운트 시)
  useEffect(
    () => () => {
      if (uploadedRef.current) URL.revokeObjectURL(uploadedRef.current);
    },
    [],
  );

  // mock 합성 로딩 — 약 1.8초 뒤 결과로 전환
  useEffect(() => {
    if (step !== "loading") return;
    const t = setTimeout(() => setStep("result"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  // 로딩 진행 문구 순환
  useEffect(() => {
    if (step !== "loading") return;
    setPhraseIdx(0);
    const t = setInterval(
      () => setPhraseIdx((i) => (i + 1) % config.loadingPhrases.length),
      900,
    );
    return () => clearInterval(t);
  }, [step, config.loadingPhrases.length]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const activeStyle = styleIdx ?? 0;
  const canSynthesize = photoId !== null && styleIdx !== null;

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setPhotoId(UPLOAD_ID);
    e.target.value = "";
  };

  // 플로우 D 계약: 합성 결과 메시지 + AI 퀵리플라이를 채팅에 넣고 이동
  const handleSendToChat = () => {
    const now = new Date().toISOString();
    appendMessages([
      {
        id: uid(),
        sender: "user",
        type: "synthesisResult",
        synthesis: {
          imageUrl: config.resultImage,
          label: `${config.title} · ${config.styles[activeStyle]}`,
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

  return (
    <div className="min-h-dvh bg-dark text-white">
      <PageHeader title={config.title} dark onBack={() => navigate("/")} />

      {step === "select" && (
          <main key="select" className="anim-fade px-5 pt-5 pb-32">
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

            {photoId !== null && (
                <section key="styles" className="anim-rise mt-8">
                  <h3 className="text-[16px] font-bold">
                    {config.styleSectionTitle}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {config.styles.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStyleIdx(i)}
                        className={`rounded-full px-4 py-2 text-[13px] font-semibold transition active:scale-[0.97] ${
                          styleIdx === i
                            ? "bg-brand text-white"
                            : "border border-white/10 bg-dark-card text-white/70"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </section>
              )}
          </main>
        )}

      {step === "loading" && (
          <main
            key="loading"
            className="anim-fade flex min-h-[calc(100dvh-52px)] flex-col items-center justify-center px-5 pb-16"
          >
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
            <div className="mt-2 h-5">
              <p key={phraseIdx} className="anim-fade text-[13px] text-white/55">
                {config.loadingPhrases[phraseIdx]}
              </p>
            </div>
          </main>
        )}

      {step === "result" && (
          <main
            key="result"
            className="anim-rise px-5 pt-4 pb-[max(env(safe-area-inset-bottom),24px)]"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-dark-card">
              <img
                src={config.resultImage}
                alt={config.styles[activeStyle]}
                className="h-full w-full object-cover"
                style={{ filter: STYLE_FILTERS[activeStyle] }}
              />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur">
                <Sparkles size={13} className="text-white" />
                <span className="text-[12px] font-semibold">
                  {config.resultBadge}
                </span>
              </div>
            </div>

            <p className="mt-5 text-center text-[17px] font-bold">
              {config.styles[activeStyle]}
            </p>
            <p className="mt-1 text-center text-[13px] text-white/55">
              {config.resultSub}
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {config.styles.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  aria-label={s}
                  onClick={() => setStyleIdx(i)}
                  className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg transition ${
                    activeStyle === i ? "ring-2 ring-brand" : "opacity-60"
                  }`}
                >
                  <img
                    src={config.resultImage}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: STYLE_FILTERS[i] }}
                  />
                </button>
              ))}
            </div>

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
                  navigate(`/vendors/${encodeURIComponent(config.vendorCategory)}`)
                }
                className="h-12 rounded-xl border border-white/10 bg-dark-card text-[13px] font-semibold text-white/85 transition active:scale-[0.98]"
              >
                {config.vendorLinkLabel}
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
              onClick={() => setStep("loading")}
              className={`h-[52px] w-full rounded-xl text-[15px] font-bold transition ${
                canSynthesize
                  ? "bg-brand text-white active:scale-[0.98]"
                  : "bg-dark-card text-white/30"
              }`}
            >
              합성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
