# SDING AI 플래너 — 베타 프로토타입

스딩(SDING) 앱의 5개 탭 중 **AI플래너 탭**만 독립적으로 떼어낸 프론트엔드 프로토타입입니다.
기획 구체화가 목적이며, AI 응답·이미지 합성·업체 DB·사진 업로드는 전부 **mock**으로 동작합니다.
(기준 문서: `AI플래너_베타_기획서.md` v2)

## 실행 방법 (로컬 전용, 배포 없음)

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5199` 접속. 모바일 웹 기준(콘텐츠 최대 너비 430px)이라
브라우저 개발자도구의 모바일 뷰로 보면 가장 자연스럽습니다.

## 화면 구성

| 경로 | 화면 |
|---|---|
| `/` | 대시보드 (D-day, 진행률 도넛, AI 배너, 다음 할 일, 채팅 진입 카드) |
| `/checklist` | 웨딩 체크리스트 (31개 항목 · 8개 그룹) + 업체 처리 바텀시트 |
| `/checklist/:itemId/register` | 업체 등록 폼 (상담중/계약완료, 사진 업로드 mock) |
| `/vendors/:category` | 업체 보러가기 (카테고리별 mock 업체 리스트, 14종) |
| `/chat` | AI 웨딩플래너 채팅방 (키워드 매칭 mock 엔진) |
| `/ai/dress` | AI 드레스 합성 (mock) |
| `/ai/hall` | AI 웨딩홀 합성 (mock) |

## 기술 스택

React 19 + Vite 7 + TypeScript + Tailwind CSS v4 + react-router-dom v7 + lucide-react + framer-motion

## Mock 처리 방식

- **AI 응답**: `src/lib/chatEngine.ts`의 키워드 매칭 스크립트 (자유 대화 아님)
- **이미지 합성**: 미리 준비된 정적 이미지에 스타일별 CSS 필터를 적용해 변형 노출
- **사진 업로드**: `URL.createObjectURL` 로컬 미리보기만 (서버 저장 없음)
- **상태**: 메모리 보관 — 새로고침 시 초기화 (베타 스펙상 허용)

## 참고

- 업체 카테고리는 기획서 v2 기준 **14종** 체계를 사용합니다. 기존 업체 데이터수집 양식(13종)과
  명칭·개수가 다르므로 실제 통합 전에 하나로 맞춰야 합니다.
- 예식일 mock: 2027-01-16, 사용자 mock: 수민님
