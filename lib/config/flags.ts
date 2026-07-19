// 기능 플래그 — env 로 제어. NEXT_PUBLIC_* 만 클라이언트 노출.

// ── Analytics (analytics-spec.md) ────────────────────────
/** PostHog 프로젝트 키(퍼블리시 가능). 없으면 계측 비활성 */
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
/** PostHog 호스트 (US 클라우드 기본) */
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
/** Cloudflare Web Analytics 토큰(보조). 없으면 비활성 */
export const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ?? "";
