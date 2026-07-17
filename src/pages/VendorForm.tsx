import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Camera, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useApp } from "../store/AppContext";
import { vendorById } from "../data/vendors";

type FormStatus = "상담중" | "계약완료";

interface PhotoSlotProps {
  label: string;
  url?: string;
  onFile: (file: File) => void;
  onRemove: () => void;
}

// 사진 업로드 슬롯 — 실제 업로드 없이 로컬 미리보기만 (기획서 6.3)
function PhotoSlot({ label, url, onFile, onRemove }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
      </span>
      {url ? (
        <div className="relative aspect-square overflow-hidden rounded-xl bg-field">
          <img src={url} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label={`${label} 제거`}
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white active:scale-95"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d8d8dc] bg-field active:bg-black/[0.02]"
        >
          <Camera size={22} strokeWidth={1.8} className="text-faint" />
          <span className="text-[12px] text-faint">사진 올리기</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default function VendorForm() {
  const { itemId } = useParams<{ itemId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, registerVendor, showToast } = useApp();

  const item = items.find((it) => it.id === itemId);
  const vendorIdParam = searchParams.get("vendorId");
  const pickedVendor = vendorIdParam ? vendorById(vendorIdParam) : undefined;

  // 프리필: 업체 보러가기에서 고른 업체가 있으면 그 값이 우선, 없으면 기존 등록값(수정 모드)
  const [status, setStatus] = useState<FormStatus>(
    item?.vendor?.status === "계약완료" ? "계약완료" : "상담중",
  );
  const [vendorName, setVendorName] = useState(
    pickedVendor?.name ?? item?.vendor?.vendorName ?? "",
  );
  const [memo, setMemo] = useState(item?.vendor?.memo ?? "");
  const [productUrl, setProductUrl] = useState<string | undefined>(
    item?.vendor?.productPhotoUrl,
  );
  const [contractUrl, setContractUrl] = useState<string | undefined>(
    item?.vendor?.contractPhotoUrl,
  );
  const linkedVendorId = pickedVendor?.id ?? item?.vendor?.linkedVendorId;

  // 이 화면에서 생성한 blob URL 추적 — 저장 안 된 것만 언마운트 시 revoke
  const createdUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!item) navigate("/checklist", { replace: true });
  }, [item, navigate]);

  useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  if (!item) return null;

  const releaseUrl = (url?: string) => {
    if (url && createdUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      createdUrls.current.delete(url);
    }
  };

  const makeUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    createdUrls.current.add(url);
    return url;
  };

  const canSave = vendorName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    // 저장되는 URL은 revoke 대상에서 제외 (체크리스트 썸네일에서 계속 사용)
    if (productUrl) createdUrls.current.delete(productUrl);
    if (contractUrl) createdUrls.current.delete(contractUrl);
    const now = new Date();
    const registeredAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    registerVendor(item.id, {
      status,
      vendorName: vendorName.trim(),
      productPhotoUrl: productUrl,
      contractPhotoUrl: contractUrl,
      memo: memo.trim() || undefined,
      linkedVendorId,
      registeredAt,
    });
    showToast(
      status === "계약완료"
        ? `${item.title} 완료! 진행률이 올라갔어요`
        : "상담중으로 저장했어요",
    );
    navigate(`/checklist?highlight=${item.id}`);
  };

  return (
    <div className="min-h-dvh bg-white pb-28">
      <PageHeader title="업체 등록" onBack={() => navigate(-1)} />

      <div className="px-5 pt-5">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 truncate text-[18px] font-bold">{item.title}</h2>
          {item.category && (
            <span className="shrink-0 rounded-md bg-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand">
              {item.category}
            </span>
          )}
        </div>

        <div className="mt-6">
          <span className="mb-1.5 block text-[13px] font-semibold">진행 상태</span>
          <div className="flex rounded-xl bg-field p-1">
            {(["상담중", "계약완료"] as const).map((s) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`h-10 flex-1 rounded-lg text-[14px] transition ${
                    active
                      ? `bg-white font-bold shadow-sm ${
                          s === "상담중" ? "text-consult" : "text-success"
                        }`
                      : "font-medium text-sub"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[13px] font-semibold">업체명</span>
          <input
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            placeholder="업체 이름을 입력해주세요"
            className="h-12 w-full rounded-xl bg-field px-4 text-[14px] outline-none placeholder:text-faint focus:ring-2 focus:ring-brand/40"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <PhotoSlot
            label="상품 사진"
            url={productUrl}
            onFile={(file) => {
              releaseUrl(productUrl);
              setProductUrl(makeUrl(file));
            }}
            onRemove={() => {
              releaseUrl(productUrl);
              setProductUrl(undefined);
            }}
          />
          <PhotoSlot
            label="계약서 사진"
            url={contractUrl}
            onFile={(file) => {
              releaseUrl(contractUrl);
              setContractUrl(makeUrl(file));
            }}
            onRemove={() => {
              releaseUrl(contractUrl);
              setContractUrl(undefined);
            }}
          />
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[13px] font-semibold">메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="견적, 상담 내용 등을 메모해두세요 (선택)"
            className="min-h-[88px] w-full resize-none rounded-xl bg-field p-4 text-[14px] outline-none placeholder:text-faint focus:ring-2 focus:ring-brand/40"
          />
        </label>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <div className="w-full max-w-[430px] border-t border-line bg-white p-4">
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`h-[52px] w-full rounded-xl text-[15px] font-bold transition ${
              canSave
                ? "bg-brand text-white active:scale-[0.98]"
                : "bg-field text-faint"
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
