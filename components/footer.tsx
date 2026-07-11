"use client";

/**
 * 재사용 가능한 푸터 템플릿 (EDEN APPWORKS 공용)
 * ------------------------------------------------------------------
 * ✅ 색/분위기: Tailwind 테마 토큰(--foreground, --muted-foreground, --border,
 *    --primary)만 사용하므로, 서비스마다 테마 값만 바꾸면 자동으로 어울립니다.
 *    (shadcn 계열 토큰을 쓰는 프로젝트라면 그대로 복사해 사용 가능)
 * ✅ 내용: 로고·문구·링크는 전부 props로 교체.
 *
 * 사용 예:
 *   <Footer
 *     links={[{ label: "개인정보처리방침", href: "/privacy" }]}
 *     note="본 풀이는 재미·참고용입니다"
 *   />
 *
 * 다른 서비스 예:
 *   <Footer
 *     logoChipBg="transparent"                     // 투명/밝은 로고면
 *     links={[{ label: "이용약관", href: "/terms" }]}
 *     note="문의: hello@example.com"
 *   />
 */

type FooterLink = { label: string; href: string };

export type FooterProps = {
  /** 스튜디오/브랜드 워드마크 (기본: EDEN APPWORKS) */
  brand?: string;
  /** 제작자 크레딧 (기본: eden) */
  maker?: string;
  /** 로고 이미지 경로. null이면 로고 숨김 (기본: /logo.png) */
  logoSrc?: string | null;
  /** 로고 칩 배경색. 흰 배경 로고는 "#ffffff", 투명/자체배경 로고는 "transparent" (기본: #ffffff) */
  logoChipBg?: string;
  /** 저작권 연도 (기본: 올해) */
  year?: number;
  /** 저작권 줄 전체를 직접 지정하고 싶을 때 (지정 시 brand/maker 무시) */
  copyright?: string;
  /** 하단 링크 (예: 개인정보처리방침, 이용약관) */
  links?: FooterLink[];
  /** 서비스별 안내 문구 (예: 본 풀이는 재미·참고용입니다) */
  note?: string;
  /** 래퍼 추가 클래스 */
  className?: string;
};

export function Footer({
  brand = "EDEN APPWORKS",
  maker = "eden",
  logoSrc = "/logo.png",
  logoChipBg = "#ffffff",
  year = new Date().getFullYear(),
  copyright,
  links = [],
  note,
  className = "",
}: FooterProps) {
  const hasMeta = links.length > 0 || !!note;

  return (
    <footer
      className={`border-border/25 text-muted-foreground mx-auto w-full max-w-2xl border-t px-5 py-9 text-center ${className}`}
    >
      {/* 로고 칩 */}
      {logoSrc && (
        <span
          className="ring-black/5 mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-xl p-1.5 ring-1"
          style={{ backgroundColor: logoChipBg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={brand}
            className="h-full w-full object-contain"
            onError={(e) => {
              const chip = e.currentTarget.closest("span");
              if (chip) chip.style.display = "none";
            }}
          />
        </span>
      )}

      {/* 워드마크 */}
      {brand && (
        <p className="text-foreground/70 mb-1.5 text-[11px] font-medium tracking-[0.28em]">
          {brand}
        </p>
      )}

      {/* 저작권 */}
      <p className="text-xs tracking-wide">
        {copyright ?? (
          <>
            © {year} · designed &amp; built by{" "}
            <span className="text-foreground/70">{maker}</span>
          </>
        )}
      </p>

      {/* 링크 + 안내 문구 */}
      {hasMeta && (
        <p className="text-muted-foreground/70 mt-1.5 text-xs">
          {links.map((link, i) => (
            <span key={link.href}>
              {i > 0 && <span className="mx-1.5">·</span>}
              <a
                href={link.href}
                className="hover:text-primary underline underline-offset-2"
              >
                {link.label}
              </a>
            </span>
          ))}
          {note && (
            <>
              {links.length > 0 && <span className="mx-1.5">·</span>}
              {note}
            </>
          )}
        </p>
      )}
    </footer>
  );
}
