/**
 * 사주 풀이 생성 모듈 (Anthropic SDK 단일 경로)
 *
 * - `@anthropic-ai/sdk`(fetch 기반)로 Claude Messages API를 직접 호출한다.
 *   → Cloudflare Workers(workerd) 및 Node 양쪽에서 동작.
 * - 인증: 환경변수 `ANTHROPIC_API_KEY` (로컬·배포 공통).
 *   OpenNext가 Cloudflare 시크릿을 process.env 로 주입한다.
 *
 * (구 Agent SDK/구독 토큰 경로는 workerd에서 동작하지 않아 제거함.)
 */
import Anthropic from "@anthropic-ai/sdk";
import type { SajuData } from "./saju";

const MODEL = "claude-sonnet-5";

/** 사주 전문가 페르소나 및 출력 형식 지시 */
const SYSTEM_PROMPT = `당신은 사주명리학에 정통한 따뜻하고 통찰력 있는 상담가입니다.
주어진 사주팔자(년주·월주·일주·시주)를 바탕으로 한국어로 풀이를 제공합니다.

작성 원칙:
- 일간(日干)을 '나'의 기준으로 삼고, 오행(목·화·토·금·수)의 균형과 십신 관계를 근거로 해석합니다.
- 근거를 한두 문장으로 쉽게 곁들이되, 전문용어는 괄호로 풀어 설명합니다.
- 단정적 예언이 아니라 경향과 조언으로 서술하고, 따뜻하고 구체적으로 씁니다.
- 앞쪽 성향 섹션(총평~건강)은 각 3~5문장으로 작성합니다.
- 시기별 운세(오늘~내년)는 주어진 '오늘 날짜'를 기준으로, 각 2~3문장의 실질적이고 구체적인 조언으로 작성합니다. 각 시기가 서로 다른 내용이 되도록 합니다.
- 문장은 짧고 명확하게 끊어 가독성을 높입니다.

출력 형식(반드시 이 제목들을 그대로, 이 순서로 사용):
## 총평
## 성격과 기질
## 재물운
## 연애와 궁합
## 직업과 적성
## 건강
## 오늘의 운세
## 이번 주 운세
## 이번 달 운세
## 올해 운세
## 내년 운세

마지막에 한 줄로 다음 안내를 덧붙입니다:
"※ 본 풀이는 참고용이며, 삶의 선택은 당신의 몫입니다."`;

/** SajuData를 사람이 읽는 형태의 프롬프트로 변환 */
export function buildPrompt(saju: SajuData): string {
  const p = saju.pillars;
  const genderKo = saju.gender === "male" ? "남성" : "여성";
  const timeKo = saju.birthTime
    ? `${String(saju.birthTime.hour).padStart(2, "0")}:${String(
        saju.birthTime.minute
      ).padStart(2, "0")}`
    : "모름(시주 제외)";

  // 시기별 운세의 기준이 되는 '오늘' 날짜
  const now = new Date();
  const dow = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  const todayKo = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${dow}요일)`;

  const lines = [
    "다음 사주팔자를 풀이해 주세요.",
    "",
    `- 성별: ${genderKo}`,
    `- 양력 생년월일: ${saju.solarDate.year}년 ${saju.solarDate.month}월 ${saju.solarDate.day}일`,
    `- 태어난 시각: ${timeKo}`,
    `- 일간(나): ${saju.dayMaster}`,
    "",
    "사주팔자:",
    `- 년주: ${p.year.hangul}(${p.year.hanja})`,
    `- 월주: ${p.month.hangul}(${p.month.hanja})`,
    `- 일주: ${p.day.hangul}(${p.day.hanja})`,
    p.hour
      ? `- 시주: ${p.hour.hangul}(${p.hour.hanja})`
      : "- 시주: 없음(태어난 시각 미상)",
    "",
    `오늘 날짜: ${todayKo}`,
    `올해: ${now.getFullYear()}년, 내년: ${now.getFullYear() + 1}년`,
    "위 '오늘 날짜'를 기준으로 오늘·이번 주·이번 달·올해·내년 운세를 각각 작성해 주세요.",
  ];

  return lines.join("\n");
}

/** 인증 수단 확인 (없으면 명확한 에러) */
function assertAuth(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "인증 정보가 없습니다. 환경변수 ANTHROPIC_API_KEY 를 설정하세요."
    );
  }
}

/**
 * 사주 풀이를 스트리밍으로 생성한다. 텍스트 조각(delta)을 순차적으로 yield 한다.
 */
export async function* streamReading(saju: SajuData): AsyncGenerator<string> {
  assertAuth();

  // AI 호출을 미국 리전 고정 프록시(saju-ai-proxy)로 우회한다.
  //   → Cloudflare 홍콩 엣지에서 실행돼도 Anthropic 아웃바운드는 미국에서 나가
  //     지역차단(403 "Request not allowed")을 피한다.
  //   AI_PROXY_URL 미설정(순수 next dev 등)이면 기본 엔드포인트를 그대로 쓴다.
  //   apiKey 는 옵션 미지정 시 SDK가 process.env.ANTHROPIC_API_KEY 를 자동 사용.
  const client = new Anthropic({
    baseURL: process.env.AI_PROXY_URL || undefined,
    defaultHeaders: process.env.AI_PROXY_SECRET
      ? { "x-proxy-secret": process.env.AI_PROXY_SECRET }
      : undefined,
  });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "disabled" }, // 창작성 작업 — 추론 비용/지연 없이 빠르게
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(saju) }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
