import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 사주 풀이",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 px-5 py-12 sm:py-16">
      <h1 className="font-serif text-2xl font-bold tracking-wide">
        개인정보처리방침
      </h1>

      <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-7">
        <p className="text-foreground/90">
          본 문서는 준비 중입니다. 아래는 현재 서비스의 개인정보 처리 방식 요약이며,
          정식 방침은 곧 보완될 예정입니다.
        </p>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground font-semibold">수집 항목</h2>
          <p>사주 계산을 위한 생년월일·태어난 시각·성별. (이름·연락처 등은 받지 않습니다.)</p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground font-semibold">이용 목적</h2>
          <p>입력한 정보는 사주팔자 계산과 풀이 생성에만 사용됩니다.</p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground font-semibold">보관</h2>
          <p>
            입력 정보는 별도로 서버에 저장하지 않으며, 풀이 생성 요청 처리 후
            보관하지 않습니다.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h2 className="text-foreground font-semibold">광고 · 제휴</h2>
          <p>
            추후 광고(쿠키 기반) 또는 제휴 링크가 도입될 수 있으며, 도입 시 관련
            고지를 이 페이지에 추가합니다.
          </p>
        </section>

        <p className="text-muted-foreground/80 text-xs">
          문의: (연락처 기재 예정)
        </p>
      </div>

      <a
        href="/"
        className="text-primary hover:text-primary/80 text-sm underline underline-offset-2"
      >
        ← 처음으로
      </a>
    </div>
  );
}
