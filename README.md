<div align="center">
  <img src="public/logo.png" alt="EDEN APPWORKS" width="96" height="96" />

  # 四柱 사주 풀이

  생년월일을 입력하면 **만세력으로 사주팔자를 계산**하고, **AI가 자연어로 풀이**해 주는 웹 서비스

  🔗 **Live** · [saju-one-gilt.vercel.app](https://saju-one-gilt.vercel.app)

  ![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
  ![Claude](https://img.shields.io/badge/Claude-Sonnet-D97757?logo=anthropic&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
</div>

---

## ✨ 주요 기능

- **정확한 사주팔자 계산** — 검증된 만세력 라이브러리로 연·월·일·시주(천간·지지)를 산출 (양·음력, 윤달, 시간 미상 지원)
- **AI 종합 풀이** — 성격·재물·연애·직업·건강 + 오늘/이번 주/이번 달/올해/내년 운세를 **실시간 스트리밍**으로 생성
- **오늘의 행운** — 생년월일과 오늘 날짜로 매일 달라지는 띠·별자리·행운의 색/방향/숫자/음식 등을 즉석 계산
- **결과 저장 · 공유** — 결과 전체를 이미지(PNG)로 저장하고 SNS로 공유
- **입력 → 결과 2단계 UX** — 세션 상태 기반, 브라우저 뒤로가기 지원
- **동양풍 디자인** — 단청·오방색 팔레트 + 명조체

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일 | Tailwind CSS v4, shadcn 계열 UI |
| 사주 계산 | `@fullstackfamily/manseryeok` (만세력) |
| AI 풀이 | Anthropic Claude (Sonnet) — 스트리밍 |
| 이미지 저장 | `html-to-image` |
| 배포 | Vercel |

## 🧩 동작 방식

```
[브라우저]  생년월일 입력
     │  POST /api/saju
     ▼
[Next.js API Route (Node)]
     ├─ 만세력 라이브러리로 사주팔자 계산  → 응답 헤더로 전달
     └─ 사주팔자 + 오늘 날짜를 Claude에 전달 → 풀이를 스트리밍으로 반환
     ▼
[브라우저]  사주팔자 · 오늘의 행운(즉시) + 풀이(실시간 스트리밍) 표시
```

- **계산은 AI가 아니라 규칙 기반 라이브러리**가 담당 → 사주팔자는 항상 정확
- **AI는 해석(풀이)만** 담당 → 자연스럽고 풍부한 텍스트
- 인증은 **로컬(구독 토큰)** 과 **배포(API 키)** 두 경로를 자동 선택

## 🚀 로컬 실행

```bash
# 1) 의존성 설치
npm install

# 2) 인증 설정 (.env.local)
#    로컬: 구독 토큰   → claude setup-token 으로 발급
#    또는: API 키      → console.anthropic.com
#    .env.local.example 를 참고해 값 채우기

# 3) 실행
npm run dev   # http://localhost:3000
```

> ⚠️ Windows에서 **프로젝트 경로에 한글이 있으면** Next.js가 크래시할 수 있습니다. 영문 경로에서 실행하세요.

## 📁 폴더 구조

```
app/
  page.tsx            # 입력/결과 화면 (2단계 UX)
  api/saju/route.ts   # 사주 계산 + 풀이 스트리밍
  privacy/page.tsx    # 개인정보처리방침
lib/
  saju.ts             # 만세력 래핑 (입력 → 사주팔자)
  reading.ts          # 프롬프트 구성 + Claude 호출 (구독/API 이중 경로)
components/            # UI 컴포넌트 (Card, Select, Footer, AdSlot 등)
```

---

<div align="center">
  <sub>designed &amp; built by <b>eden</b> · EDEN APPWORKS</sub>
</div>
