/**
 * saju-ai-proxy — Anthropic API 미국 리전 고정 릴레이
 *
 * 문제: 사주 앱(OpenNext) 워커가 홍콩(HKG) 엣지에서 실행되면 api.anthropic.com 이
 *       지역차단(403 "Request not allowed")을 반환한다. Anthropic은 홍콩 등 일부
 *       리전을 지원하지 않음.
 * 해결: Anthropic 호출을 Durable Object(locationHint: "enam" = 미국동부)에서 수행 →
 *       아웃바운드가 항상 미국(지원 리전)에서 나가 지역차단을 결정적으로 회피.
 *
 * 흐름: 사주 워커 → (이 워커 default fetch) → DO(enam) → api.anthropic.com
 * 인증: 공유 시크릿 헤더 x-proxy-secret 로 무단 릴레이 사용 차단. Anthropic 인증(x-api-key)은
 *       호출자(사주 워커)가 그대로 실어 보내며, 이 프록시는 저장하지 않고 통과만 시킨다.
 */

interface Env {
  US_EGRESS: DurableObjectNamespace;
  PROXY_SECRET?: string;
}

const ANTHROPIC_BASE = "https://api.anthropic.com";

/** 미국동부(enam)에 고정 생성되는 DO — 여기서 Anthropic 호출이 나간다 */
export class UsEgress {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const target = ANTHROPIC_BASE + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("x-proxy-secret");

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
    });

    // 스트리밍(SSE) 응답을 그대로 통과시킨다.
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (env.PROXY_SECRET && request.headers.get("x-proxy-secret") !== env.PROXY_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    const id = env.US_EGRESS.idFromName("us-egress");
    const stub = env.US_EGRESS.get(id, { locationHint: "enam" });
    return stub.fetch(request);
  },
};
