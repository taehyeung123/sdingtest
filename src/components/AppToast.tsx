import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../store/AppContext";

export default function AppToast() {
  const { toastMessage } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key={toastMessage}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="max-w-[380px] rounded-full bg-ink/90 px-4 py-2.5 text-center text-[13px] font-medium text-white shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
