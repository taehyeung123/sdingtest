import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <motion.div
              className="pointer-events-auto w-full max-w-[430px] rounded-t-[20px] bg-white pb-[max(env(safe-area-inset-bottom),12px)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="h-1 w-9 rounded-full bg-black/12" />
              </div>
              {title && (
                <div className="px-5 pt-2 pb-1 text-[17px] font-bold">{title}</div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
