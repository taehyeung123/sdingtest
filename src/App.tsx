import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import AppToast from "./components/AppToast";
import Dashboard from "./pages/Dashboard";
import Checklist from "./pages/Checklist";
import VendorForm from "./pages/VendorForm";
import VendorBrowse from "./pages/VendorBrowse";
import Chat from "./pages/Chat";
import VendorChatList from "./pages/VendorChatList";
import VendorChatRoom from "./pages/VendorChatRoom";
import DressSynthesis from "./pages/DressSynthesis";
import HallSynthesis from "./pages/HallSynthesis";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-[0_0_32px_rgba(0,0,0,0.08)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/checklist/:itemId/register" element={<VendorForm />} />
          <Route path="/vendors/:category" element={<VendorBrowse />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vendor-chat" element={<VendorChatList />} />
          <Route path="/vendor-chat/:itemId" element={<VendorChatRoom />} />
          <Route path="/ai/dress" element={<DressSynthesis />} />
          <Route path="/ai/hall" element={<HallSynthesis />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
      <AppToast />
    </AppProvider>
  );
}
