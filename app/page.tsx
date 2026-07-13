"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  CalendarDays,
  Compass,
  Utensils,
  Gem,
  Clock,
  CloudSun,
  Star,
  Download,
  Share2,
  Link2,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdFit } from "@/components/adfit";
import { CrossPromo } from "@/components/cross-promo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { SajuData } from "@/lib/saju";

type Calendar = "solar" | "lunar";
type Gender = "male" | "female";

// 드롭다운 옵션: 년(최근→과거), 월
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1930 + 1 }, (_, i) => THIS_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 오방색 (청·적·황·백·흑) — 장식용
const OBANG = ["#2E6FB7", "#C8102E", "#E6B422", "#F2EAD9", "#2A2A2A"];

// 시기별 운세 섹션(달력 아이콘으로 구분 표시)
const TIME_SECTIONS = ["오늘", "이번 주", "이번주", "이번 달", "이번달", "올해", "내년"];

// 로딩 중 번갈아 보여줄 문구
const LOADING_MSGS = [
  "사주팔자를 펼치는 중…",
  "오행(木·火·土·金·水)의 균형을 살피는 중…",
  "천간과 지지의 기운을 읽는 중…",
  "십신의 관계를 헤아리는 중…",
  "운의 흐름을 정리하는 중…",
];

/** 선택한 년·월·달력에 맞는 일수 (음력은 최대 30일) */
function daysInMonth(year: number, month: number, calendar: Calendar) {
  if (calendar === "lunar") return 30;
  return new Date(year, month, 0).getDate(); // month의 0일 = 이전 달 말일
}

export default function Home() {
  // 폼 상태
  const [calendar, setCalendar] = useState<Calendar>("solar");
  const [gender, setGender] = useState<Gender>("male");
  const [year, setYear] = useState("1990");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [unknownTime, setUnknownTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");

  // 선택 가능한 '일' 목록 (년/월/달력에 따라 달라짐)
  const dayOptions = useMemo(() => {
    const n = daysInMonth(Number(year), Number(month), calendar);
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [year, month, calendar]);

  // 월/년/달력이 바뀌어 현재 '일'이 범위를 넘으면 마지막 날로 보정
  useEffect(() => {
    const n = daysInMonth(Number(year), Number(month), calendar);
    if (Number(day) > n) setDay(String(n));
  }, [year, month, calendar, day]);

  // 결과 상태
  const [loading, setLoading] = useState(false);
  const [saju, setSaju] = useState<SajuData | null>(null);
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");

  // 이미지로 저장/공유할 결과 영역
  const resultRef = useRef<HTMLDivElement>(null);

  // 화면 단계: 입력 ↔ 결과 (세션 상태만, 새로고침하면 초기화)
  const [stage, setStage] = useState<"input" | "result">("input");

  // 브라우저 뒤로가기 → 입력 화면으로 복귀
  useEffect(() => {
    const onPop = () => setStage("input");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 외부(케미체크 등)에서 ?y=&m=&d=&cal= 로 들어오면 생년월일 프리필
  // (성별·태어난 시각은 사용자가 확인 후 계산)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const y = sp.get("y");
    const m = sp.get("m");
    const d = sp.get("d");
    const cal = sp.get("cal");
    if (cal === "lunar" || cal === "solar") setCalendar(cal);
    if (y && /^\d{4}$/.test(y)) setYear(y);
    if (m && Number(m) >= 1 && Number(m) <= 12) setMonth(String(Number(m)));
    if (d && Number(d) >= 1 && Number(d) <= 31) setDay(String(Number(d)));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 결과 화면으로 전환 + 뒤로가기용 히스토리 추가
    setStage("result");
    window.history.pushState({ stage: "result" }, "");
    window.scrollTo({ top: 0 });
    setLoading(true);
    setError("");
    setSaju(null);
    setReading("");

    try {
      const res = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar,
          gender,
          year: Number(year),
          month: Number(month),
          day: Number(day),
          isLeapMonth: calendar === "lunar" ? isLeapMonth : false,
          hour: unknownTime ? null : Number(hour),
          minute: unknownTime ? null : Number(minute),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "요청 처리 중 오류가 발생했습니다.");
      }

      // 사주 계산 결과: 헤더(base64 UTF-8 JSON)
      const header = res.headers.get("X-Saju-Data");
      if (header) {
        const bytes = Uint8Array.from(atob(header), (c) => c.charCodeAt(0));
        setSaju(JSON.parse(new TextDecoder().decode(bytes)) as SajuData);
      }

      // 본문: 풀이 스트리밍
      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setReading((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 좌우 세로 광고 (데스크톱 넓은 화면 전용, 본문 바깥 여백에 배치) — 애드핏 PC 세로 160×600 */}
      <aside className="fixed left-6 top-1/2 hidden -translate-y-1/2 xl:block">
        <AdFit unit="DAN-ylNqNALGULFpj1lf" width={160} height={600} />
      </aside>
      <aside className="fixed right-6 top-1/2 hidden -translate-y-1/2 xl:block">
        <AdFit unit="DAN-yr976w758Na7Djmz" width={160} height={600} />
      </aside>

      <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-5 py-12 sm:py-16">
        {/* 헤더 */}
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="animate-seal-glow border-primary/70 text-primary flex size-14 items-center justify-center rounded-full border-2">
          <Sparkles className="size-6" />
        </div>
        <h1 className="font-serif text-3xl font-extrabold tracking-[0.18em] text-foreground">
          四柱 사주 풀이
        </h1>
        {/* 오방색 구분선 */}
        <div className="flex items-center gap-1.5">
          {OBANG.map((c) => (
            <span
              key={c}
              className="size-1.5 rounded-full ring-1 ring-white/15"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          생년월일을 입력하면 만세력으로 사주를 계산해 풀이해 드립니다.
        </p>
      </header>

      {/* 입력 단계 */}
      {stage === "input" && (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg tracking-wide">
            생년월일 입력
          </CardTitle>
          <CardDescription>
            정확한 풀이를 위해 태어난 시각과 성별까지 입력해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 양력/음력 + 성별 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>달력</Label>
                <Select
                  value={calendar}
                  onChange={(e) => setCalendar(e.target.value as Calendar)}
                >
                  <option value="solar">양력</option>
                  <option value="lunar">음력</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>성별</Label>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </Select>
              </div>
            </div>

            {/* 년 / 월 / 일 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>년</Label>
                <Select value={year} onChange={(e) => setYear(e.target.value)}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>월</Label>
                <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>일</Label>
                <Select value={day} onChange={(e) => setDay(e.target.value)}>
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}일
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* 음력 윤달 */}
            {calendar === "lunar" && (
              <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                />
                윤달입니다
              </label>
            )}

            {/* 태어난 시각 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>태어난 시각</Label>
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={unknownTime}
                    onChange={(e) => setUnknownTime(e.target.checked)}
                  />
                  시간 모름
                </label>
              </div>
              {!unknownTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">시 (0~23)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">분 (0~59)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={loading} className="mt-1">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  풀이 생성 중…
                </>
              ) : (
                <>
                  <Sparkles />
                  사주 풀이 보기
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {/* 결과 단계 */}
      {stage === "result" && (
        <>
          {/* 뒤로 (브라우저 뒤로가기와 동일) */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1 text-sm transition-colors"
          >
            <ChevronLeft className="size-4" />
            다시 입력하기
          </button>

          {/* 오류 */}
          {error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* 결과 (이미지 저장 대상) */}
          <div ref={resultRef} className="flex flex-col gap-8">
            {saju && <SajuChart saju={saju} />}
            {saju && <TodayFortune saju={saju} />}

            {/* 풀이 (사주 도착 전에도 로딩 애니메이션 표시) */}
            {(loading || reading) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="font-serif text-lg tracking-wide">
                      풀이
                    </CardTitle>
                    {reading && <CopyButton text={reading} label="전체 복사" />}
                  </div>
                </CardHeader>
                <CardContent>
                  {reading ? <Reading text={reading} /> : <LoadingReading />}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 저장 · 공유 */}
          {saju && reading && !loading && (
            <ShareBar targetRef={resultRef} saju={saju} />
          )}

          {/* 크로스 프로모션 (다른 앱 배너) */}
          {saju && reading && !loading && <CrossPromo />}
        </>
      )}

        {/* 모바일 하단 광고 (데스크톱은 좌우 세로광고 사용) — 애드핏 모바일 가로 320×100 */}
        <div className="mt-2 flex justify-center xl:hidden">
          <AdFit unit="DAN-n3FOzavIdDMGOhMa" width={320} height={100} />
        </div>
      </div>
    </>
  );
}

/** 사주팔자 4주를 표로 표시 */
function SajuChart({ saju }: { saju: SajuData }) {
  const cells = [
    { key: "시주", pillar: saju.pillars.hour, mean: "자녀·말년" },
    { key: "일주", pillar: saju.pillars.day, mean: "나·배우자" },
    { key: "월주", pillar: saju.pillars.month, mean: "부모·사회" },
    { key: "년주", pillar: saju.pillars.year, mean: "조상·초년" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg tracking-wide">사주팔자</CardTitle>
        <CardDescription>
          양력 {saju.solarDate.year}년 {saju.solarDate.month}월{" "}
          {saju.solarDate.day}일
          {saju.birthTime
            ? ` · ${String(saju.birthTime.hour).padStart(2, "0")}:${String(
                saju.birthTime.minute
              ).padStart(2, "0")}`
            : " · 시각 미상"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 사주 설명 */}
        <p className="text-muted-foreground mb-4 text-xs leading-6">
          사주팔자는 태어난{" "}
          <span className="text-foreground/80">연·월·일·시</span>를 각각 하늘의
          기운(위, 천간)과 땅의 기운(아래, 지지) 두 글자로 나타낸 여덟 글자예요.
          네 기둥은 각각 아래 삶의 영역을 상징합니다.
        </p>

        <div className="grid grid-cols-4 gap-2 text-center">
          {cells.map(({ key, pillar, mean }, idx) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <span className="text-foreground/80 text-xs font-medium">{key}</span>
              <div className="border-border/60 bg-secondary/40 flex w-full flex-col items-center gap-1 rounded-lg border py-3">
                <span
                  className="mb-0.5 h-1 w-8 rounded-full"
                  style={{ backgroundColor: OBANG[idx] }}
                />
                {pillar ? (
                  <div className="flex flex-col items-center leading-tight">
                    <span className="font-serif text-2xl font-bold text-foreground">
                      {pillar.hanja[0]}
                    </span>
                    <span className="font-serif text-2xl font-bold text-foreground">
                      {pillar.hanja[1]}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-2xl">—</span>
                )}
                <span className="text-muted-foreground text-xs">
                  {pillar ? pillar.hangul : "미상"}
                </span>
              </div>
              <span className="text-muted-foreground/80 text-[11px]">{mean}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── 오늘의 행운 계산용 데이터 ──────────────────────────────

/** 지지(년지) → 십이간지(띠) 해석 */
const ZODIAC: Record<string, { animal: string; emoji: string; desc: string }> = {
  자: {
    animal: "쥐띠",
    emoji: "🐭",
    desc: "영리하고 재치가 넘치며 상황 판단이 무척 빠릅니다. 부지런하고 저축 능력이 뛰어나 실속을 잘 챙기며, 위기 속에서도 기회를 놓치지 않는 강한 생활력을 지녔습니다. 다만 지나친 신중함이 결정을 늦출 수 있으니, 때로는 과감하게 밀어붙이는 결단력이 큰 도움이 됩니다.",
  },
  축: {
    animal: "소띠",
    emoji: "🐮",
    desc: "성실하고 인내심이 강해 한번 시작한 일은 끝까지 해내는 뚝심이 있습니다. 서두르지 않고 꾸준히 쌓아 올리는 성향이라 시간이 지날수록 큰 결실을 맺습니다. 고집이 세 보일 수 있으나, 그 우직함이 곧 신뢰가 되니 유연함을 조금만 더하면 인복이 따릅니다.",
  },
  인: {
    animal: "호랑이띠",
    emoji: "🐯",
    desc: "용맹하고 추진력이 강해 어디서든 리더로 나서는 기질이 있습니다. 정의감이 뚜렷하고 도전을 두려워하지 않아 큰일을 맡을수록 빛을 발합니다. 다만 성급함과 자존심이 화를 부를 수 있으니, 한 박자 쉬어가는 여유가 복을 지켜 줍니다.",
  },
  묘: {
    animal: "토끼띠",
    emoji: "🐰",
    desc: "온화하고 섬세하며 눈치가 빨라 대인관계가 매우 원만합니다. 미적 감각과 배려심이 뛰어나 주변을 편안하게 만드는 재주가 있습니다. 갈등을 피하려다 자기 의견을 못 낼 때가 있으니, 스스로의 목소리를 내는 용기를 기르면 더 크게 성장합니다.",
  },
  진: {
    animal: "용띠",
    emoji: "🐲",
    desc: "기상이 크고 카리스마가 넘쳐 사람들을 자연스럽게 이끕니다. 이상이 높고 추진력이 강해 큰 무대일수록 능력을 발휘합니다. 자존심이 강하고 현실을 건너뛰기 쉬우니, 작은 것을 꾸준히 챙기는 습관이 큰 성공의 밑거름이 됩니다.",
  },
  사: {
    animal: "뱀띠",
    emoji: "🐍",
    desc: "통찰력이 깊고 신중하여 겉으로 드러나지 않아도 판단이 정확합니다. 감정을 절제할 줄 알고 목표를 향해 조용히 나아가는 집중력이 뛰어납니다. 속내를 잘 드러내지 않아 오해를 살 수 있으니, 가까운 이에게 마음을 여는 연습이 관계를 더욱 단단하게 합니다.",
  },
  오: {
    animal: "말띠",
    emoji: "🐴",
    desc: "활동적이고 자유로우며 열정과 추진력이 넘칩니다. 사교성이 좋고 새로운 일에 앞장서 분위기를 밝게 이끄는 힘이 있습니다. 다만 싫증을 빨리 느끼고 마무리가 약할 수 있으니, 끝맺음에 조금만 더 공을 들이면 성과가 오래 남습니다.",
  },
  미: {
    animal: "양띠",
    emoji: "🐑",
    desc: "온순하고 정이 많으며 예술적 감각과 배려심이 뛰어납니다. 남을 잘 챙기고 분위기를 부드럽게 만들어 어디서나 사랑받습니다. 마음이 여려 상처를 잘 받으니, 스스로를 지키는 단단함을 함께 기르면 마음의 평화가 오래 지속됩니다.",
  },
  신: {
    animal: "원숭이띠",
    emoji: "🐵",
    desc: "재주가 많고 머리 회전이 빨라 임기응변과 융통성이 뛰어납니다. 호기심이 왕성하고 손재주가 좋아 무엇을 배우든 금방 익힙니다. 관심이 여기저기 흩어지기 쉬우니, 한 분야에 깊이 파고들면 재능이 곧 전문성으로 꽃핍니다.",
  },
  유: {
    animal: "닭띠",
    emoji: "🐔",
    desc: "부지런하고 꼼꼼하며 계획적으로 움직여 빈틈이 적습니다. 책임감이 강하고 자기 관리가 철저해 맡은 일에서 인정을 받습니다. 완벽을 추구하다 스스로와 남에게 엄격해질 수 있으니, 너그러움을 더하면 인간관계가 한결 편안해집니다.",
  },
  술: {
    animal: "개띠",
    emoji: "🐶",
    desc: "의리 있고 정직하여 한번 맺은 인연을 소중히 지키는 사람입니다. 성실하고 헌신적이라 주변의 깊은 신뢰를 얻습니다. 걱정이 많고 남을 지나치게 챙기다 지칠 수 있으니, 자신을 위한 시간을 챙기는 것이 오래도록 복을 부릅니다.",
  },
  해: {
    animal: "돼지띠",
    emoji: "🐷",
    desc: "복이 많고 너그러우며 마음이 넉넉해 사람이 따르는 대인배 기질이 있습니다. 순수하고 정직해 한번 믿으면 끝까지 진심을 다합니다. 사람을 잘 믿어 손해를 볼 수 있으니, 사리를 분별하는 눈을 기르면 타고난 복을 온전히 누립니다.",
  },
};

/** 서양 별자리 (양력 생일 기준) */
function westernSign(m: number, d: number): { name: string; emoji: string; desc: string } {
  const t = m * 100 + d;
  if (t >= 120 && t <= 218) return { name: "물병자리", emoji: "♒", desc: "독창적이고 자유로운 사고로 남다른 아이디어를 냅니다." };
  if (t >= 219 && t <= 320) return { name: "물고기자리", emoji: "♓", desc: "감수성이 풍부하고 공감 능력이 뛰어난 낭만가입니다." };
  if (t >= 321 && t <= 419) return { name: "양자리", emoji: "♈", desc: "열정적이고 도전적이며 앞장서는 개척자입니다." };
  if (t >= 420 && t <= 520) return { name: "황소자리", emoji: "♉", desc: "끈기 있고 안정적이며 감각이 뛰어난 실속파입니다." };
  if (t >= 521 && t <= 621) return { name: "쌍둥이자리", emoji: "♊", desc: "재치 있고 호기심 많아 소통에 능한 팔방미인입니다." };
  if (t >= 622 && t <= 722) return { name: "게자리", emoji: "♋", desc: "정이 깊고 가정적이며 사람을 잘 보듬는 따뜻한 성품입니다." };
  if (t >= 723 && t <= 822) return { name: "사자자리", emoji: "♌", desc: "당당하고 카리스마 있어 무대의 주인공이 되는 타입입니다." };
  if (t >= 823 && t <= 922) return { name: "처녀자리", emoji: "♍", desc: "꼼꼼하고 분석적이며 완성도를 중시하는 완벽주의자입니다." };
  if (t >= 923 && t <= 1022) return { name: "천칭자리", emoji: "♎", desc: "균형 감각이 뛰어나고 조화를 이루는 세련된 중재자입니다." };
  if (t >= 1023 && t <= 1121) return { name: "전갈자리", emoji: "♏", desc: "집중력이 강하고 통찰이 깊은 신비로운 승부사입니다." };
  if (t >= 1122 && t <= 1221) return { name: "사수자리", emoji: "♐", desc: "낙천적이고 자유로우며 넓은 세상을 꿈꾸는 모험가입니다." };
  return { name: "염소자리", emoji: "♑", desc: "성실하고 책임감이 강해 목표를 반드시 이루는 노력가입니다." };
}

/** 시드로 뽑는 행운 항목 후보 */
const FOODS = ["따뜻한 국밥", "비빔밥", "김밥", "칼국수", "삼겹살", "초밥", "떡볶이", "샐러드", "향긋한 커피", "제철 과일", "치킨", "파스타", "순두부찌개", "냉면"];
const ITEMS = ["손수건", "향수", "작은 노트", "반지", "우산", "책 한 권", "이어폰", "머플러", "지갑", "만년필", "작은 화분", "열쇠고리", "향초", "팔찌"];
const TIMES = ["오전 7~9시", "오전 9~11시", "정오 무렵", "오후 1~3시", "오후 3~5시", "저녁 6~8시", "밤 9~11시"];
const WEATHERS = ["맑고 화창한 날", "구름이 살짝 낀 날", "선선한 바람 부는 날", "촉촉한 비 오는 날", "포근하게 흐린 날"];

/** 오행 → 색/방향 */
const ELEMENTS = {
  목: { name: "초록·청색", hex: "#2E8B57", dir: "동쪽" },
  화: { name: "붉은색", hex: "#C8102E", dir: "남쪽" },
  토: { name: "노란색", hex: "#E6B422", dir: "중앙" },
  금: { name: "흰색·금색", hex: "#E9E2CE", dir: "서쪽" },
  수: { name: "검정·남색", hex: "#2E3A59", dir: "북쪽" },
} as const;
const ELEMENT_KEYS = ["목", "화", "토", "금", "수"] as const;

/** 문자열 → 정수 해시 */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** 시드 기반 난수 생성기 (같은 시드 → 같은 결과) */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 행운 항목 한 칸 (아이콘 또는 색 스와치 + 라벨/값) */
function FortuneTile({
  icon,
  swatch,
  label,
  value,
}: {
  icon?: React.ReactNode;
  swatch?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/50 flex items-center gap-2.5 rounded-lg border p-3">
      {swatch ? (
        <span
          className="size-7 shrink-0 rounded-full ring-1 ring-white/25"
          style={{ backgroundColor: swatch }}
        />
      ) : (
        <span className="text-primary shrink-0">{icon}</span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="text-foreground truncate text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}

/** 오늘의 행운 — 생년월일(사주) + 오늘 날짜로 매일 달라지되 항상 같은 결과 */
function TodayFortune({ saju }: { saju: SajuData }) {
  const now = new Date();
  const dateNum =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  // 시드: 본인 사주 + 오늘 날짜
  const seed =
    (hashStr(saju.pillars.day.hanja + saju.pillars.year.hanja) ^ dateNum) >>> 0;
  const rand = mulberry32(seed);

  // 나의 띠 (년지 = 년주 한글의 두 번째 글자)
  const branch = saju.pillars.year.hangul.charAt(1);
  const zodiac = ZODIAC[branch] ?? {
    animal: "-",
    emoji: "✨",
    desc: "",
  };

  // 오늘의 행운 오행 → 색·방향
  const elKey = ELEMENT_KEYS[Math.floor(rand() * ELEMENT_KEYS.length)];
  const el = ELEMENTS[elKey];

  // 서양 별자리 (양력 생일 기준)
  const sign = westernSign(saju.solarDate.month, saju.solarDate.day);

  // 그 밖의 행운 항목 (시드 기반)
  const food = FOODS[Math.floor(rand() * FOODS.length)];
  const item = ITEMS[Math.floor(rand() * ITEMS.length)];
  const time = TIMES[Math.floor(rand() * TIMES.length)];
  const weather = WEATHERS[Math.floor(rand() * WEATHERS.length)];

  // 행운의 숫자 6개 (1~45, 중복 없이)
  const nums = new Set<number>();
  while (nums.size < 6) nums.add(1 + Math.floor(rand() * 45));
  const luckyNumbers = [...nums].sort((a, b) => a - b);

  // 오늘의 기운 지수 (55~99)
  const score = 55 + Math.floor(rand() * 45);
  const scoreLabel =
    score >= 90 ? "대길(大吉)" : score >= 75 ? "길(吉)" : score >= 62 ? "평온" : "조심";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg tracking-wide">오늘의 행운</CardTitle>
        <CardDescription>
          {now.getFullYear()}년 {now.getMonth() + 1}월 {now.getDate()}일 기준
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* 나의 띠 */}
        <div className="border-border/50 bg-secondary/30 flex items-center gap-3 rounded-lg border p-3">
          <span className="text-3xl leading-none">{zodiac.emoji}</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-serif font-bold text-foreground">
              나의 띠 · {zodiac.animal}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                ({branch})
              </span>
            </span>
            <span className="text-muted-foreground text-sm leading-6">
              {zodiac.desc}
            </span>
          </div>
        </div>

        {/* 별자리 (양력 생일 기준) */}
        <div className="border-border/50 bg-secondary/30 flex items-start gap-3 rounded-lg border p-3">
          <span className="text-2xl leading-none">{sign.emoji}</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-serif font-bold text-foreground">
              별자리 · {sign.name}
            </span>
            <span className="text-muted-foreground text-sm leading-6">
              {sign.desc}
            </span>
          </div>
        </div>

        {/* 행운 항목들 */}
        <div className="grid grid-cols-2 gap-3">
          <FortuneTile swatch={el.hex} label="행운의 색" value={el.name} />
          <FortuneTile
            icon={<Compass className="size-6" />}
            label="행운의 방향"
            value={el.dir}
          />
          <FortuneTile
            icon={<Utensils className="size-6" />}
            label="행운의 음식"
            value={food}
          />
          <FortuneTile
            icon={<Gem className="size-6" />}
            label="행운의 아이템"
            value={item}
          />
          <FortuneTile
            icon={<Clock className="size-6" />}
            label="행운의 시간"
            value={time}
          />
          <FortuneTile
            icon={<CloudSun className="size-6" />}
            label="어울리는 날씨"
            value={weather}
          />
        </div>

        {/* 행운의 숫자 */}
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs">행운의 숫자</span>
          <div className="flex flex-wrap gap-2">
            {luckyNumbers.map((n) => (
              <span
                key={n}
                className="border-primary/60 text-primary bg-primary/10 flex size-9 items-center justify-center rounded-full border font-serif font-bold"
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* 오늘의 기운 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">오늘의 기운</span>
            <span className="text-primary font-medium">
              {scoreLabel} · {score}점
            </span>
          </div>
          <div className="bg-muted/50 h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** 풀이 텍스트를 섹션으로 파싱 */
type Section = { title: string; body: string[] };

function parseReading(text: string): { preamble: string[]; sections: Section[] } {
  const preamble: string[] = [];
  const sections: Section[] = [];
  let cur: Section | null = null;
  for (const raw of text.split("\n")) {
    const t = raw.trim();
    if (!t) continue;
    // 최상위 제목(# ...)은 카드 제목과 중복이라 건너뜀
    if (t.startsWith("# ") && !t.startsWith("## ")) continue;
    if (t.startsWith("## ")) {
      cur = { title: t.replace(/^##\s+/, ""), body: [] };
      sections.push(cur);
    } else if (cur) {
      cur.body.push(t);
    } else {
      preamble.push(t);
    }
  }
  return { preamble, sections };
}

function Paragraph({ text }: { text: string }) {
  if (text.startsWith("※")) {
    return <p className="text-muted-foreground text-xs">{text}</p>;
  }
  return <p className="text-foreground/90">{text}</p>;
}

/** 풀이 렌더 — 섹션별 복사 버튼 포함 */
function Reading({ text }: { text: string }) {
  const { preamble, sections } = parseReading(text);
  return (
    <div className="flex flex-col gap-6">
      {preamble.length > 0 && (
        <div className="flex flex-col gap-2 text-[15px] leading-7">
          {preamble.map((p, i) => (
            <Paragraph key={i} text={p} />
          ))}
        </div>
      )}

      {sections.map((s, i) => {
        const isTime = TIME_SECTIONS.some((k) => s.title.includes(k));
        return (
          <section
            key={i}
            className={
              isTime
                ? "border-primary/25 bg-primary/[0.04] flex flex-col gap-2.5 rounded-lg border p-4"
                : "flex flex-col gap-2.5"
            }
          >
            <div className="border-border/40 flex items-center justify-between gap-2 border-b pb-1.5">
              <h3 className="text-primary flex items-center gap-2 font-serif text-base font-bold">
                {isTime ? (
                  <CalendarDays className="size-4" />
                ) : (
                  <span className="bg-primary inline-block h-4 w-1 rounded-full" />
                )}
                {s.title}
              </h3>
              <CopyButton text={`${s.title}\n\n${s.body.join("\n")}`} />
            </div>
            <div className="flex flex-col gap-2 text-[15px] leading-7">
              {s.body.map((p, j) => (
                <Paragraph key={j} text={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** 클립보드 복사 버튼 */
function CopyButton({ text, label = "복사" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* 클립보드 접근 실패 시 조용히 무시 */
        }
      }}
      className="text-muted-foreground hover:text-primary hover:bg-primary/10 inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "복사됨" : label}
    </button>
  );
}

/** 저장 · 공유 바 — 결과를 이미지로 저장하거나 여러 방법으로 공유 */
function ShareBar({
  targetRef,
  saju,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  saju: SajuData;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateStr = `${saju.solarDate.year}.${saju.solarDate.month}.${saju.solarDate.day}`;
  const shareText = `내 사주 풀이 결과예요! (${dateStr}) 오늘의 행운도 함께 확인해보세요 ✨`;
  const fileName = `사주풀이_${saju.solarDate.year}${String(
    saju.solarDate.month
  ).padStart(2, "0")}${String(saju.solarDate.day).padStart(2, "0")}.png`;

  // 결과 영역을 PNG Blob으로 렌더
  async function makeImage(): Promise<Blob | null> {
    if (!targetRef.current) return null;
    const { toBlob } = await import("html-to-image");
    return toBlob(targetRef.current, {
      pixelRatio: 2,
      backgroundColor: "#15141d",
      cacheBust: true,
    });
  }

  async function handleSave() {
    setBusy(true);
    try {
      const blob = await makeImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("이미지 저장 실패", e);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await makeImage();
      const file = blob
        ? new File([blob], fileName, { type: "image/png" })
        : null;

      if (
        file &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: "사주 풀이", text: shareText });
      } else if (typeof navigator.share === "function") {
        await navigator.share({ title: "사주 풀이", text: shareText, url: location.origin });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${location.origin}`);
        alert("이 브라우저는 공유를 지원하지 않아, 내용을 클립보드에 복사했어요.");
      }
    } catch {
      /* 사용자가 공유를 취소한 경우 등은 조용히 무시 */
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 무시 */
    }
  }

  function handleX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(location.origin)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs">
          이 결과를 저장하거나 공유해 보세요
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline" onClick={handleSave} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Download />}
            이미지 저장
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={busy}>
            <Share2 />
            공유
          </Button>
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? <Check /> : <Link2 />}
            {copied ? "복사됨" : "링크 복사"}
          </Button>
          <Button variant="outline" onClick={handleX}>
            <span className="font-bold">𝕏</span>
            공유
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** 풀이 생성 중 로딩 애니메이션 (회전 링 + 순환 문구 + 스켈레톤) */
function LoadingReading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % LOADING_MSGS.length),
      1800
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* 회전하는 오방색 이중 링 */}
      <div className="relative size-14">
        <div className="border-t-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent [animation-duration:1.3s]" />
        <div className="border-t-accent absolute inset-2 animate-spin rounded-full border-2 border-transparent [animation-direction:reverse] [animation-duration:2s]" />
        <Sparkles className="text-primary absolute inset-0 m-auto size-5 animate-pulse" />
      </div>

      <p className="text-muted-foreground animate-pulse text-sm">
        {LOADING_MSGS[i]}
      </p>

      {/* 스켈레톤 라인 */}
      <div className="w-full max-w-sm space-y-2.5">
        {[92, 78, 85, 66].map((w, n) => (
          <div
            key={n}
            className="bg-muted/50 h-3 animate-pulse rounded"
            style={{ width: `${w}%`, animationDelay: `${n * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
