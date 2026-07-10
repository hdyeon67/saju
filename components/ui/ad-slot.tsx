/**
 * 광고 자리(placeholder).
 * 실제 광고(애드핏/쿠팡/애드센스) 코드는 나중에 이 자리에 끼워 넣는다.
 * 크기는 className으로 지정한다. (예: 세로광고 h-[600px] w-40)
 */
export function AdSlot({
  label = "광고",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`border-border/40 text-muted-foreground/40 flex items-center justify-center rounded-lg border border-dashed text-[10px] tracking-widest select-none ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
