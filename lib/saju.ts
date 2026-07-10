/**
 * 사주 계산 모듈
 *
 * 사용자 입력(생년월일/시간/양음력/성별)을 받아
 * 만세력 라이브러리로 사주팔자(년·월·일·시주)를 계산한다.
 * - 음력 입력이면 먼저 양력으로 변환한 뒤 계산한다.
 * - 태어난 시간을 모르면 시주(hour)는 null로 둔다.
 */
import {
  calculateSaju,
  lunarToSolar,
  type SajuResult,
} from "@fullstackfamily/manseryeok";

export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar";

/** 프론트에서 넘어오는 원본 입력 */
export interface SajuInput {
  year: number;
  month: number;
  day: number;
  /** 0~23. null/undefined = 시간 모름 */
  hour?: number | null;
  /** 0~59 */
  minute?: number | null;
  calendar: CalendarType;
  /** 음력 윤달 여부 */
  isLeapMonth?: boolean;
  gender: Gender;
}

export interface Pillar {
  /** 년주/월주/일주/시주 */
  label: string;
  /** 한글 간지 (예: 갑자) */
  hangul: string;
  /** 한자 간지 (예: 甲子) */
  hanja: string;
}

/** 계산된 사주 결과 (프롬프트 및 화면 표시에 사용) */
export interface SajuData {
  gender: Gender;
  /** 실제 계산에 사용된 양력 날짜 */
  solarDate: { year: number; month: number; day: number };
  /** 입력한 태어난 시각 (모르면 null) */
  birthTime: { hour: number; minute: number } | null;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null;
  };
  /** 일간(日干) — 일주의 첫 글자. 사주 해석의 기준이 되는 '나' */
  dayMaster: string;
  /** 경도/시간 보정이 적용됐는지 */
  isTimeCorrected: boolean;
}

/**
 * 입력을 사주팔자로 계산한다.
 * @throws 지원 범위(1900~2050) 밖이거나 유효하지 않은 날짜면 라이브러리가 에러를 던진다.
 */
export function computeSaju(input: SajuInput): SajuData {
  // 1) 음력이면 양력으로 변환
  let sYear = input.year;
  let sMonth = input.month;
  let sDay = input.day;

  if (input.calendar === "lunar") {
    const converted = lunarToSolar(
      input.year,
      input.month,
      input.day,
      input.isLeapMonth ?? false
    );
    sYear = converted.solar.year;
    sMonth = converted.solar.month;
    sDay = converted.solar.day;
  }

  // 2) 시간 유무 판단
  const hasTime = input.hour !== null && input.hour !== undefined;
  const hour = hasTime ? input.hour! : undefined;
  const minute = hasTime ? input.minute ?? 0 : undefined;

  // 3) 사주팔자 계산 (기본 시간 보정 적용)
  const r: SajuResult = calculateSaju(sYear, sMonth, sDay, hour, minute);

  const pillars: SajuData["pillars"] = {
    year: { label: "년주", hangul: r.yearPillar, hanja: r.yearPillarHanja },
    month: { label: "월주", hangul: r.monthPillar, hanja: r.monthPillarHanja },
    day: { label: "일주", hangul: r.dayPillar, hanja: r.dayPillarHanja },
    hour:
      r.hourPillar && r.hourPillarHanja
        ? { label: "시주", hangul: r.hourPillar, hanja: r.hourPillarHanja }
        : null,
  };

  return {
    gender: input.gender,
    solarDate: { year: sYear, month: sMonth, day: sDay },
    birthTime: hasTime ? { hour: hour!, minute: minute! } : null,
    pillars,
    dayMaster: r.dayPillar.charAt(0),
    isTimeCorrected: r.isTimeCorrected,
  };
}
