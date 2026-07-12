// 크로스 프로모션 대상 앱 목록 (config 배열).
// 앞으로 앱이 늘면 여기에 항목만 추가하면 배너가 자동 노출된다.
// href 는 안정 커스텀 도메인(fineboll.com 서브도메인). (사주 자신은 목록에서 제외)

export interface PromoApp {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  href: string;
  /** 배너 아이콘 배경 힌트 컬러 */
  color: string;
}

export const PROMOS: PromoApp[] = [
  {
    id: "chemicheck",
    emoji: "💞",
    title: "궁합이 궁금하다면?",
    desc: "이름·생일로 보는 케미체크",
    href: "https://chemicheck.fineboll.com",
    color: "#ff5db1",
  },
  {
    id: "goodday",
    emoji: "📅",
    title: "좋은 날이 궁금하다면?",
    desc: "이사·결혼 택일 추천 좋은날",
    href: "https://goodday.fineboll.com",
    color: "#c99a5b",
  },
];
