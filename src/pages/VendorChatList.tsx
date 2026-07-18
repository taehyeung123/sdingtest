import { useNavigate } from "react-router-dom";
import { ClipboardList, Store } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VendorThumb from "../components/VendorThumb";
import { useApp } from "../store/AppContext";
import { vendorById } from "../data/vendors";
import { formatTime } from "../lib/utils";

// 업체 채팅 리스트 — 체크리스트에 업체명이 등록된 항목만 노출
export default function VendorChatList() {
  const navigate = useNavigate();
  const { items, vendorChats } = useApp();

  const rows = items.filter((it) => it.vendor?.vendorName && it.category);

  return (
    <div className="min-h-dvh bg-white pb-10">
      <PageHeader title="업체 채팅" onBack={() => navigate(-1)} />

      <p className="anim-fade mx-5 mt-3 rounded-xl bg-tint px-3.5 py-2.5 text-[12px] leading-relaxed text-brand">
        베타 데모 화면이에요. 실제 업체와 연결되지 않은 mock 채팅이에요.
      </p>

      {rows.length === 0 ? (
        <div className="anim-rise flex flex-col items-center px-5 pt-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-brand">
            <Store size={28} strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[15px] font-bold">아직 등록한 업체가 없어요</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
            체크리스트에서 업체를 등록하면
            <br />
            여기서 바로 채팅할 수 있어요
          </p>
          <button
            type="button"
            onClick={() => navigate("/checklist")}
            className="mt-5 flex items-center gap-1.5 rounded-xl bg-brand px-5 py-3 text-[14px] font-bold text-white transition active:scale-[0.98]"
          >
            <ClipboardList size={16} />
            체크리스트에서 업체 등록하기
          </button>
        </div>
      ) : (
        <div className="anim-rise mt-2 flex flex-col">
          {rows.map((item) => {
            const vendor = item.vendor!;
            const linked = vendor.linkedVendorId
              ? vendorById(vendor.linkedVendorId)
              : undefined;
            const thread = vendorChats[item.id] ?? [];
            const last = thread[thread.length - 1];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/vendor-chat/${item.id}`)}
                className="flex items-center gap-3 px-5 py-3.5 text-left transition active:bg-black/[0.03]"
              >
                <VendorThumb
                  category={item.category!}
                  thumbnailUrl={linked?.thumbnailUrl}
                  className="h-[52px] w-[52px] rounded-full"
                  iconSize={20}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-bold">
                      {vendor.vendorName}
                    </span>
                    <StatusBadge status={vendor.status} />
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-sub">
                    {last ? last.text : "대화를 시작해보세요"}
                  </span>
                </span>
                {last && (
                  <span className="shrink-0 self-start pt-1 text-[11px] text-faint">
                    {formatTime(last.timestamp)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
