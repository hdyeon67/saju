import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 좌하단에 뜨는 Next.js/Turbopack 표시 숨김 (개발 전용 요소)
  devIndicators: false,
  // Agent SDK는 로컬 전용(구독 토큰) 경로에서만 동적 import 되므로
  // 서버 번들에 포함하지 않고 런타임 node_modules에서 불러오게 한다.
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],
};

export default nextConfig;
