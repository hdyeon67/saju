"use client";

/**
 * 사이트 하단 푸터 (심플·고급).
 * - 로고는 다크 테마에 튀지 않도록 작은 흰색 칩(브랜드 마크)으로 표시
 * - 브랜드 텍스트는 간결하게: designed & built by eden
 * - 개인정보처리방침 링크 + 재미·참고용 문구
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-border/25 mx-auto w-full max-w-2xl border-t px-5 py-9 text-center">
      {/* 로고 칩 */}
      <span className="ring-black/5 mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-white p-1.5 ring-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="EDEN APPWORKS"
          className="h-full w-full object-contain"
          onError={(e) => {
            const chip = e.currentTarget.closest("span");
            if (chip) chip.style.display = "none";
          }}
        />
      </span>

      {/* 워드마크 */}
      <p className="text-foreground/70 mb-1.5 text-[11px] font-medium tracking-[0.28em]">
        EDEN APPWORKS
      </p>

      <p className="text-muted-foreground text-xs tracking-wide">
        © {year} · designed &amp; built by <span className="text-foreground/70">eden</span>
      </p>
      <p className="text-muted-foreground/70 mt-1.5 text-xs">
        <a
          href="/privacy"
          className="hover:text-primary underline underline-offset-2"
        >
          개인정보처리방침
        </a>
        <span className="mx-1.5">·</span> 본 풀이는 재미·참고용입니다
      </p>
    </footer>
  );
}
