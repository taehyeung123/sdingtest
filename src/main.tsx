import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// 문서가 보이는 상태로 부팅됐을 때만 등장 애니메이션 활성화.
// 백그라운드 탭에서 로드되면 애니메이션 없이 콘텐츠를 바로 보여준다.
if (document.visibilityState === "visible") {
  document.documentElement.setAttribute("data-anim", "1");
} else {
  document.addEventListener(
    "visibilitychange",
    () => {
      // 처음 화면에 나타나는 시점 이후의 라우팅부터는 애니메이션 허용
      if (document.visibilityState === "visible") {
        document.documentElement.setAttribute("data-anim", "1");
      }
    },
    { once: true },
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
