import { PROMOS } from "@/lib/config/promos";

/** 결과 하단 크로스 프로모션 배너 (config 배열 기반) */
export function CrossPromo() {
  if (PROMOS.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs text-muted-foreground">이런 것도 있어요</p>
      {PROMOS.map((p) => (
        <a
          key={p.id}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition hover:bg-muted"
        >
          <span
            className="flex size-9 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: `${p.color}22` }}
          >
            {p.emoji}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-foreground">
              {p.title}
            </span>
            <span className="block text-xs text-muted-foreground">{p.desc}</span>
          </span>
          <span className="text-muted-foreground">→</span>
        </a>
      ))}
    </div>
  );
}
