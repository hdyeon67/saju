// 홈/기본 공유용 OG 이미지 — 카톡·SNS 링크 미리보기.
//   next/og(satori). 한글 폰트는 ASSETS 의 Pretendard 서브셋을 런타임 fetch 로 로드
//   (Workers 에서 fs 불가 → fetch 사용). 사주 톤: 한지+먹+주사, 여덟 글자(八字) 모티프.
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const FONT_PATH = "/fonts/pretendard-kr-subset.ttf";
const HANJI = "#f5efe1";
const MEOK = "#26221c";
const MEOK_SOFT = "#6b6358";
const JUSA = "#c8352b";
const LINE = "#d9cfb8";

const SIZE = { w: 1200, h: 630 };

let cachedFont: ArrayBuffer | null = null;
async function loadFont(origin: string): Promise<ArrayBuffer | null> {
  if (cachedFont) return cachedFont;
  try {
    const res = await fetch(new URL(FONT_PATH, origin), { cache: "force-cache" });
    if (!res.ok) return null;
    cachedFont = await res.arrayBuffer();
    return cachedFont;
  } catch {
    return null;
  }
}

const OG_HEADERS = {
  "Cache-Control": "public, immutable, no-transform, max-age=31536000, s-maxage=31536000",
};

export async function GET(req: Request): Promise<Response> {
  const font = await loadFont(req.url);
  const fonts = font
    ? [{ name: "Pretendard", data: font, weight: 700 as const, style: "normal" as const }]
    : undefined;

  return new ImageResponse(<BrandCard />, {
    width: SIZE.w,
    height: SIZE.h,
    fonts,
    headers: OG_HEADERS,
  });
}

function BrandCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: HANJI,
        padding: 48,
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          border: `3px solid ${MEOK}`,
          padding: "56px 64px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, color: JUSA, letterSpacing: 6 }}>
            무료 사주 풀이
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 118,
              fontWeight: 700,
              color: MEOK,
              marginTop: 14,
            }}
          >
            사주풀이
          </div>
          <div style={{ display: "flex", fontSize: 36, color: MEOK_SOFT, marginTop: 22 }}>
            생년월일로 뽑는 여덟 글자, 내 사주 리포트
          </div>
          {/* 여덟 글자(八字) 모티프 — 먹 테두리 8칸 */}
          <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  border: `2px solid ${i < 2 ? JUSA : MEOK}`,
                  background: HANJI,
                }}
              />
            ))}
          </div>
        </div>
        {/* 낙관 직인 */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 56,
            top: 48,
            width: 108,
            height: 108,
            alignItems: "center",
            justifyContent: "center",
            border: `5px solid ${JUSA}`,
            borderRadius: 16,
            color: JUSA,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.15,
            textAlign: "center",
            transform: "rotate(-6deg)",
          }}
        >
          사주
        </div>
      </div>
    </div>
  );
}
