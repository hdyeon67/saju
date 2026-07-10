"use client";

import { useEffect, useRef } from "react";

/**
 * 카카오 애드핏 광고 단위.
 * - <ins class="kakao_ad_area"> 를 만들고, 그 뒤에 ba.min.js 를 붙여 채운다.
 *   (스크립트가 로드되면 아직 안 채워진 kakao_ad_area 를 처리)
 * - 광고가 채워지기 전에는 표시되지 않는다(빈 공간 유지).
 * - localhost 등 미등록 도메인에서는 광고가 나오지 않는다(정상). 실제 노출은 배포 도메인에서.
 *
 * ⚠️ width/height 는 애드핏에서 만든 광고 단위의 실제 규격과 일치해야 채워진다.
 */
export function AdFit({
  unit,
  width,
  height,
  className = "",
}: {
  unit: string;
  width: number;
  height: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));

    const script = document.createElement("script");
    script.async = true;
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";

    container.appendChild(ins);
    container.appendChild(script);
  }, [unit, width, height]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width, height, maxWidth: "100%" }}
    />
  );
}
