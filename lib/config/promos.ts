// 크로스 프로모션 대상 앱 목록 (config 배열).
// 앞으로 앱이 늘면 여기에 항목만 추가하면 된다.
//  - 하단 "다른 서비스" 패밀리 줄에는 모든 앱이 자동 노출 (name·tag 사용)
//  - anchorSection 을 지정하면, 풀이의 해당 섹션 바로 뒤에 "맥락형 추천"도 노출
// href 는 안정 커스텀 도메인(fineboll.com 서브도메인). (사주 자신은 목록에서 제외)

export interface PromoApp {
  id: string;
  /** 앱 이름 (패밀리 칩) — 예: "케미체크" */
  name: string;
  /** 짧은 분류 (패밀리 칩) — 예: "궁합" */
  tag: string;
  emoji: string;
  /** 아이콘 배경 힌트 컬러 */
  color: string;
  href: string;
  /** 이 풀이 섹션 뒤에 맥락형 추천을 붙인다 (예: "연애와 궁합"). 없으면 패밀리 줄에만 노출 */
  anchorSection?: string;
  /** 맥락형 추천 제목 문구 */
  anchorCopy?: string;
  /** 맥락형 추천 부제 (앱 한 줄 소개) */
  anchorDesc?: string;
}

export const PROMOS: PromoApp[] = [
  {
    id: "chemicheck",
    name: "케미체크",
    tag: "궁합",
    emoji: "💞",
    color: "#ff5db1",
    href: "https://chemicheck.fineboll.com",
    anchorSection: "연애와 궁합",
    anchorCopy: "이 궁합, 더 정확히 보고 싶다면",
    anchorDesc: "케미체크 · 두 사람 이름·생일로 확인",
  },
  {
    id: "goodday",
    name: "좋은날",
    tag: "택일",
    emoji: "📅",
    color: "#c99a5b",
    href: "https://goodday.fineboll.com",
    anchorSection: "내년 운세",
    anchorCopy: "좋은 날을 미리 잡고 싶다면",
    anchorDesc: "좋은날 · 이사·결혼 택일 추천",
  },
  {
    // 맥락 앵커 없이 하단 "다른 서비스" 패밀리 줄에만 노출 (사주 풀이 섹션과 매칭되는 맥락 없음)
    id: "shinjo",
    name: "신조어 판독기",
    tag: "언어나이",
    emoji: "🗣️",
    color: "#a24bff",
    href: "https://shinjo.fineboll.com",
  },
];

/** 풀이 섹션 제목에 맞는 맥락형 추천 앱을 찾는다 (섹션당 최대 1개) */
export function promoForSection(title: string): PromoApp | undefined {
  return PROMOS.find((p) => p.anchorSection && title.includes(p.anchorSection));
}
