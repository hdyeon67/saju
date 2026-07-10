/**
 * POST /api/saju
 *
 * 요청 본문(JSON): SajuInput
 * 처리:
 *   1) 만세력으로 사주팔자 계산 (동기, 즉시)
 *   2) 계산 결과를 응답 헤더 X-Saju-Data(base64 JSON)로 전달
 *   3) 응답 본문에는 AI 풀이 텍스트를 스트리밍으로 흘려보냄
 */
import type { NextRequest } from "next/server";
import { computeSaju, type SajuInput } from "@/lib/saju";
import { streamReading } from "@/lib/reading";

// Node 런타임이 필요하다 (Edge 불가).
export const runtime = "nodejs";
// Vercel 함수 최대 실행 시간(초). 스트리밍 풀이가 이 안에 끝나야 한다.
// (Hobby 요금제 한도에 맞춰 60초. 필요 시 상향 가능)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1) 입력 파싱 + 사주 계산
  let sajuData;
  try {
    const body = (await req.json()) as SajuInput;
    sajuData = computeSaju(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "입력이 올바르지 않습니다.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 2) 사주 계산 결과를 헤더에 실어 보낸다 (UTF-8 → base64)
  const sajuHeader = Buffer.from(JSON.stringify(sajuData), "utf-8").toString(
    "base64"
  );

  // 3) 본문은 AI 풀이 스트림
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamReading(sajuData)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류";
        controller.enqueue(
          encoder.encode(`\n\n[오류] 풀이 생성 실패: ${message}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Saju-Data": sajuHeader,
    },
  });
}
