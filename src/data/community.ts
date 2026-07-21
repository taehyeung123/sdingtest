import type { CommunityPost } from "../types";
import { USER_NAME } from "../lib/wedding";

// 커뮤니티 시드 게시글 mock — 전부 가상 인물/후기이며 실제 이용자 데이터가 아니다.
// 내(로그인 사용자) 닉네임은 lib/wedding의 USER_NAME과 통일해 마이페이지 활동 내역과 이어진다.
export { USER_NAME as MY_NICKNAME };

export const SEED_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    category: "후기",
    author: "지은맘",
    authorBadge: "D+12 새댁",
    title: "더채플앳청담 실제 후기 남겨요 (feat. 사진 多)",
    body:
      "고민 많이 하다가 정찰제라는 말에 끌려서 계약했는데 결과적으로 정말 만족했어요. 담당 실장님도 친절하시고 하객 동선도 넓어서 좋았습니다. 추가금 하나도 없었던 게 제일 좋았어요!",
    imageUrls: ["/mock/hall-1.jpg"],
    vendorTag: { vendorId: "v-hall-1", vendorName: "더채플앳청담", category: "웨딩홀" },
    likeCount: 128,
    comments: [
      {
        id: uidLike("c1a"),
        author: "예비신랑준",
        text: "저도 여기 상담받았는데 후기 보니 더 끌리네요 감사합니다",
        timestamp: "2026-07-10T09:20:00+09:00",
      },
      {
        id: uidLike("c1b"),
        author: "곧결혼해요",
        text: "정찰가 실제로 딱 그 금액이었나요?",
        timestamp: "2026-07-10T11:02:00+09:00",
      },
    ],
    timestamp: "2026-07-09T20:15:00+09:00",
  },
  {
    id: "post-2",
    category: "고민상담",
    author: "웨딩고민중",
    authorBadge: "D-96 예비신부",
    title: "드레스 투어 몇 곳 정도 다녀오셨어요?",
    body:
      "이번 주말에 드레스 투어 예약했는데 처음이라 감이 안 잡혀요. 다들 몇 곳 정도 보고 결정하셨나요? 하루에 몇 곳까지 가능한지도 궁금해요.",
    imageUrls: [],
    likeCount: 34,
    comments: [
      {
        id: uidLike("c2a"),
        author: "6개월차예신",
        text: "저는 3곳 봤는데 하루에 2곳이 체력적으로 딱 좋았어요",
        timestamp: "2026-07-15T14:40:00+09:00",
      },
    ],
    timestamp: "2026-07-15T13:05:00+09:00",
  },
  {
    id: "post-3",
    category: "정보공유",
    author: "정보요정",
    authorBadge: "D-40 예비신부",
    title: "스드메 계약 전에 꼭 체크할 것 3가지 정리했어요",
    body:
      "1) 원본 사진 제공 여부와 매수 2) 헬퍼 실장 지정 가능한지 3) 앨범 추가 제작 시 단가. 이 세 개만 미리 물어봐도 나중에 추가금 스트레스가 확 줄어요.",
    imageUrls: [],
    likeCount: 261,
    comments: [
      {
        id: uidLike("c3a"),
        author: "결혼준비1일차",
        text: "저장했습니다 정말 감사해요",
        timestamp: "2026-06-28T10:00:00+09:00",
      },
      {
        id: uidLike("c3b"),
        author: "예비신랑",
        text: "헬퍼 실장 얘기 완전 공감이요 저희도 당일에 바뀌어서 당황했어요",
        timestamp: "2026-06-28T12:30:00+09:00",
      },
      {
        id: uidLike("c3c"),
        author: "곧결혼해요",
        text: "앨범 추가 단가는 진짜 업체마다 차이 크더라고요",
        timestamp: "2026-06-29T08:11:00+09:00",
      },
    ],
    timestamp: "2026-06-27T19:45:00+09:00",
  },
  {
    id: "post-4",
    category: "자유",
    author: USER_NAME,
    authorBadge: "D-183 예비신부",
    title: "청첩장 모임 첫 발송 완료! 너무 떨려요",
    body:
      "드디어 청첩장 인쇄까지 끝내고 오늘 가장 친한 친구들한테 첫 발송했어요. 실감이 안 나면서도 너무 설레네요 다들 화이팅입니다",
    imageUrls: [],
    likeCount: 19,
    comments: [
      {
        id: uidLike("c4a"),
        author: "지은맘",
        text: "축하드려요! 저도 그때가 제일 설렜던 것 같아요",
        timestamp: "2026-07-08T21:00:00+09:00",
      },
    ],
    timestamp: "2026-07-08T20:30:00+09:00",
  },
  {
    id: "post-5",
    category: "후기",
    author: "르블랑러버",
    authorBadge: "D+3 새댁",
    title: "르블랑 스튜디오 촬영 후기 (인생샷 건졌어요)",
    body:
      "실장님이 포즈를 정말 잘 잡아주셔서 어색함 없이 촬영했어요. 원본도 넉넉하게 주셔서 셀렉하는 재미가 있었습니다. 재촬영 없이 한 번에 만족한 케이스예요.",
    imageUrls: ["/mock/dress-2.jpg", "/mock/dress-1.jpg"],
    vendorTag: { vendorId: "v-studio-1", vendorName: "르블랑 스튜디오", category: "스튜디오" },
    likeCount: 97,
    comments: [],
    timestamp: "2026-07-05T16:20:00+09:00",
  },
  {
    id: "post-6",
    category: "고민상담",
    author: "예산고민",
    authorBadge: "D-210 예비신부",
    title: "혼주님 의견이랑 저희 의견이 달라서 고민이에요",
    body:
      "웨딩홀은 저희가 원하는 곳으로 하고 싶은데 부모님은 다른 곳을 원하셔서 조율 중이에요. 다들 이런 부분 어떻게 풀어가셨나요.",
    imageUrls: [],
    likeCount: 52,
    comments: [
      {
        id: uidLike("c6a"),
        author: "먼저결혼한선배",
        text: "저희는 예산은 부모님, 분위기는 저희 기준으로 나눠서 정했어요",
        timestamp: "2026-07-02T22:10:00+09:00",
      },
    ],
    timestamp: "2026-07-02T21:00:00+09:00",
  },
  {
    id: "post-7",
    category: "정보공유",
    author: "AI덕후예신",
    authorBadge: "D-150 예비신부",
    title: "AI 드레스 합성 진짜 도움 많이 됐어요",
    body:
      "드레스샵 가기 전에 AI로 미리 스타일 잡고 갔더니 상담이 훨씬 빨랐어요. 시간 아끼고 싶으신 분들께 추천!",
    imageUrls: ["/mock/dress-1.jpg"],
    likeCount: 143,
    comments: [
      {
        id: uidLike("c7a"),
        author: "웨딩고민중",
        text: "오 저도 해봐야겠어요 정보 감사합니다",
        timestamp: "2026-06-20T13:00:00+09:00",
      },
    ],
    timestamp: "2026-06-20T11:30:00+09:00",
  },
  {
    id: "post-8",
    category: "자유",
    author: "곧결혼해요",
    authorBadge: "D-58 예비신부",
    title: "결혼 준비 중 스트레스 푸는 나만의 방법",
    body:
      "저는 준비하다 지치면 예신 커뮤니티 후기 글 읽으면서 힘 얻어요. 다들 자기만의 스트레스 해소법 있으신가요?",
    imageUrls: [],
    likeCount: 41,
    comments: [],
    timestamp: "2026-06-15T09:00:00+09:00",
  },
];

// 시드 댓글 id — 고정 문자열이라 매 렌더마다 안정적이다
function uidLike(seed: string): string {
  return `seed-${seed}`;
}
