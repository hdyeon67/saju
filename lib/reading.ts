/**
 * 사주 풀이 생성 모듈 (두 가지 인증 경로 지원)
 *
 * 1) 배포/서버리스(Vercel 등): 환경변수 ANTHROPIC_API_KEY 가 있으면
 *    Anthropic SDK(@anthropic-ai/sdk)로 API를 직접 호출한다. (종량 과금)
 *    → 서버리스 환경에서 안정적이고, 여러 사용자를 감당할 수 있다.
 *
 * 2) 로컬 개인용: ANTHROPIC_API_KEY 가 없고 CLAUDE_CODE_OAUTH_TOKEN(구독 토큰)이
 *    있으면 Claude Agent SDK로 호출한다. (내 구독 사용량, 무료에 가까움)
 *
 * 우선순위는 "API 키 우선"이 아니라 "구독 토큰 우선"이다:
 * - 로컬(.env.local)에는 보통 구독 토큰만 있어 무료로 쓰고,
 * - 배포 환경에는 API 키만 넣어 종량으로 서비스한다.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { SajuData } from "./saju";

/** 배포 시 사용할 모델 (사용자 선택: Sonnet) */
const API_MODEL = "claude-sonnet-5";

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
  if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    throw new Error(
      "인증 정보가 없습니다. 배포 환경은 ANTHROPIC_API_KEY, 로컬은 CLAUDE_CODE_OAUTH_TOKEN 을 설정하세요."
    );
  }
}

/** (배포) Anthropic API 직접 호출 — 서버리스에서 안정적 */
async function* streamViaApi(prompt: string): AsyncGenerator<string> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY를 자동으로 읽음
  const stream = client.messages.stream({
    model: API_MODEL,
    max_tokens: 8000,
    thinking: { type: "disabled" }, // 창작성 작업 — 추론 비용/지연 없이 빠르게
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
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

/** (로컬) 구독 토큰 기반 Agent SDK 호출 — 배포 번들에서 제외되도록 동적 import */
async function* streamViaAgentSdk(prompt: string): AsyncGenerator<string> {
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  const response = query({
    prompt,
    options: {
      model: "sonnet",
      systemPrompt: SYSTEM_PROMPT,
      allowedTools: [],
      permissionMode: "bypassPermissions",
      includePartialMessages: true,
    },
  });

  for await (const message of response) {
    if (message.type === "stream_event") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = (message as any).event;
      if (
        event?.type === "content_block_delta" &&
        event?.delta?.type === "text_delta" &&
        typeof event.delta.text === "string"
      ) {
        yield event.delta.text as string;
      }
    }
  }
}

/**
 * 사주 풀이를 스트리밍으로 생성한다. 텍스트 조각(delta)을 순차적으로 yield 한다.
 * - 구독 토큰이 있으면 그것으로(로컬, 무료), 없으면 API 키로(배포, 종량) 호출.
 */
export async function* streamReading(saju: SajuData): AsyncGenerator<string> {
  assertAuth();
  const prompt = buildPrompt(saju);

  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    yield* streamViaAgentSdk(prompt);
  } else {
    yield* streamViaApi(prompt);
  }
}
