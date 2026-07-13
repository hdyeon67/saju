import { PROMOS, type PromoApp } from "@/lib/config/promos";

/**
 * 맥락형 추천 — 풀이의 특정 섹션(예: "연애와 궁합") 바로 뒤에 자연스럽게 삽입.
 * data-noimg 로 표시해 결과 저장/공유 이미지 캡처에서는 제외된다.
 */
export function InlinePromo({ promo }: { promo: PromoApp }) {
  return (
    <a
      href={promo.href}
      target="_blank"
      rel="noopener noreferrer"
      data-noimg="1"
      className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 transition hover:bg-muted"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `${promo.color}22` }}
      >
        {promo.emoji}
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium text-foreground">
          {promo.anchorCopy ?? promo.name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {promo.anchorDesc}
        </span>
      </span>
      <span className="text-muted-foreground text-sm">→</span>
    </a>
  );
}

/** 하단 패밀리 줄 — 모든 앱을 작은 칩으로. 앱이 늘어도 도배되지 않고 "우리 서비스 모음"으로 읽힌다. */
export function CrossPromo() {
  if (PROMOS.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-muted-foreground text-center text-[11px] tracking-[0.14em]">
        EDEN APPWORKS의 다른 서비스
      </p>
      <div className="grid grid-cols-3 gap-2">
        {PROMOS.map((p) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition hover:bg-muted"
          >
            <span
              className="flex size-8 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${p.color}22` }}
            >
              {p.emoji}
            </span>
            <span className="text-foreground text-xs font-medium">{p.name}</span>
            <span className="text-muted-foreground text-[11px]">{p.tag}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
