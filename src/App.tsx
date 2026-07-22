import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import AppToast from "./components/AppToast";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Checklist from "./pages/Checklist";
import VendorForm from "./pages/VendorForm";
import VendorBrowse from "./pages/VendorBrowse";
import VendorDetail from "./pages/VendorDetail";
import Chat from "./pages/Chat";
import VendorChatList from "./pages/VendorChatList";
import VendorChatRoom from "./pages/VendorChatRoom";
import DressSynthesis from "./pages/DressSynthesis";
import HallSynthesis from "./pages/HallSynthesis";
import Community from "./pages/Community";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import CommunityWrite from "./pages/CommunityWrite";
import MyPage from "./pages/MyPage";

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
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/planner" element={<Dashboard />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/checklist/:itemId/register" element={<VendorForm />} />
          <Route path="/vendors/:category" element={<VendorBrowse />} />
          <Route path="/vendors/:category/:vendorId" element={<VendorDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vendor-chat" element={<VendorChatList />} />
          <Route path="/vendor-chat/:itemId" element={<VendorChatRoom />} />
          <Route path="/ai/dress" element={<DressSynthesis />} />
          <Route path="/ai/hall" element={<HallSynthesis />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:postId" element={<CommunityPostDetail />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <AppToast />
    </AppProvider>
  );
}
