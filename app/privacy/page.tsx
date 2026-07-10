import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 사주 풀이",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-6 px-5 py-12 sm:py-16">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-wide">
          개인정보처리방침
        </h1>
        <p className="text-muted-foreground mt-2 text-xs">시행일: 2026년 7월 10일</p>
      </div>

      <div className="text-muted-foreground flex flex-col gap-6 text-sm leading-7">
        <p className="text-foreground/90">
          &lsquo;사주 풀이&rsquo;(이하 &lsquo;서비스&rsquo;)는 이용자의 개인정보를
          중요하게 생각하며, 아래와 같이 개인정보를 처리합니다. 본 서비스는
          회원가입 없이 이용되며, 입력한 정보를 서버에 저장하지 않습니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목 및 방법">
          <p>
            서비스는 사주 계산에 필요한 최소한의 정보만 이용자가 직접 입력하는
            방식으로 수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>수집 항목: 생년월일, 태어난 시각(선택), 성별</li>
            <li>수집하지 않는 항목: 이름, 연락처, 이메일, 계정 정보 등 신원 식별 정보</li>
          </ul>
        </Section>

        <Section title="2. 개인정보의 이용 목적">
          <p>
            수집한 정보는 오직 <b className="text-foreground/80">사주팔자 계산과 풀이·오늘의 운세 생성</b>에만
            사용되며, 그 외 목적으로 이용하지 않습니다.
          </p>
        </Section>

        <Section title="3. 보유 및 이용 기간">
          <p>
            입력한 정보는 요청을 처리하는 시점에만 일시적으로 사용되며,{" "}
            <b className="text-foreground/80">서비스 서버에 별도로 저장·보관하지 않습니다.</b>{" "}
            브라우저를 새로고침하면 입력 정보는 사라집니다.
          </p>
        </Section>

        <Section title="4. 개인정보 처리의 위탁 (AI 풀이 생성)">
          <p>
            풀이 텍스트 생성을 위해, 입력한 사주 정보(생년월일·시각·성별로부터
            계산된 사주팔자)는 AI 언어모델 서비스인{" "}
            <b className="text-foreground/80">Anthropic(Claude API)</b>로 전송되어 처리됩니다.
            해당 처리는 풀이 생성 목적에 한하며, 전송된 정보는 서비스 서버에
            저장되지 않습니다. Anthropic의 데이터 처리 정책은 해당 사의 방침을
            따릅니다.
          </p>
        </Section>

        <Section title="5. 제3자 제공">
          <p>
            서비스는 위 &lsquo;4항&rsquo;의 풀이 생성 처리를 제외하고, 이용자의 정보를
            제3자에게 제공하지 않습니다.
          </p>
        </Section>

        <Section title="6. 쿠키 및 광고">
          <p>
            현재 서비스는 필수적인 동작 외에 별도의 추적 쿠키를 사용하지 않습니다.
            추후 광고 또는 제휴가 도입될 경우, 광고 사업자가 쿠키 등을 사용할 수
            있으며 도입 시 관련 내용을 본 방침에 고지합니다.
          </p>
        </Section>

        <Section title="7. 이용자의 권리">
          <p>
            서비스는 개인정보를 저장하지 않으므로 열람·정정·삭제 대상이 되는
            보관 데이터가 없습니다. 개인정보 처리에 관한 문의는 아래 연락처로
            요청하실 수 있습니다.
          </p>
        </Section>

        <Section title="8. 개인정보 보호책임자 및 문의">
          <ul className="list-none space-y-1">
            <li>운영: EDEN APPWORKS</li>
            <li>문의: (연락처 기재 예정)</li>
          </ul>
        </Section>

        <Section title="9. 고지의 의무">
          <p>
            본 개인정보처리방침의 내용이 변경될 경우, 변경 사항을 본 페이지를
            통해 공지합니다.
          </p>
        </Section>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-foreground font-semibold">{title}</h2>
      {children}
    </section>
  );
}
