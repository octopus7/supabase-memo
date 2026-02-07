# Supabase 웹 메모장 구현 가이드

이 문서는 Supabase + React + TypeScript + Vite로 채팅형 메모장 웹앱을 처음부터 구현하는 방법을 설명합니다.

---

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Styling**: Vanilla CSS (다크 테마, 그라데이션)
- **배포**: Cloudflare Workers/Pages
- **라이브러리**: date-fns (날짜), JSZip (백업)

---

## 주요 기능

1. **회원가입/로그인** - Supabase Auth (이메일/비밀번호)
2. **메모 CRUD** - 채팅 버블 형태의 메모 입력/표시
3. **무한 스크롤** - 위로 스크롤시 이전 메모 로딩
4. **날짜 구분선** - 오늘/어제/날짜별 구분
5. **주차별 백업** - 텍스트/ZIP 다운로드

---

## 1단계: 프로젝트 생성

```powershell
# Vite + React + TypeScript 프로젝트 생성
npx create-vite@latest memo-app --template react-ts
cd memo-app

# 의존성 설치
npm install @supabase/supabase-js date-fns jszip
npm install -D @types/node
```

---

## 2단계: Supabase 설정

### 2.1 Supabase 프로젝트 생성
1. https://supabase.com 접속 → 로그인
2. "New Project" 클릭
3. 프로젝트명, 비밀번호, 리전 설정 후 생성

### 2.2 memos 테이블 생성

SQL Editor에서 실행:

```sql
CREATE TABLE memos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS (Row Level Security) 활성화
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 본인 메모만 조회 가능
CREATE POLICY "Users can view own memos"
ON memos FOR SELECT
USING (auth.uid() = user_id);

-- 본인 메모만 생성 가능
CREATE POLICY "Users can insert own memos"
ON memos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_memos_user_created ON memos(user_id, created_at DESC);
```

### 2.3 API 키 확인
- Project Settings → API
- `Project URL`과 `anon/public` 키 복사

---

## 3단계: 환경 변수 설정

### .env (git에서 제외)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### .env.example (커밋용)
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### .gitignore에 추가
```
.env
.env.local
.env.*.local
```

---

## 4단계: 파일 구조

```
src/
├── components/
│   ├── AuthForm.tsx      # 로그인/회원가입 폼
│   ├── MemoList.tsx      # 메모 목록 (무한 스크롤)
│   ├── MemoInput.tsx     # 메모 입력
│   └── BackupPage.tsx    # 주차별 백업
├── lib/
│   └── supabase.ts       # Supabase 클라이언트
├── App.tsx               # 메인 앱
├── main.tsx              # 엔트리포인트
└── styles.css            # 전체 스타일
```

---

## 5단계: 핵심 코드 구현

### 5.1 src/lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Memo {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}
```

### 5.2 src/App.tsx 핵심 기능
- `supabase.auth.getSession()` - 세션 확인
- `supabase.auth.onAuthStateChange()` - 인증 상태 변경 감지
- `supabase.from('memos').select()` - 메모 조회
- `supabase.from('memos').insert()` - 메모 추가
- 페이지네이션: `.range(0, PAGE_SIZE - 1)`
- 오래된 메모 로딩: `.lt('created_at', oldestMemo.created_at)`

### 5.3 src/components/AuthForm.tsx 핵심 기능
- `supabase.auth.signUp()` - 회원가입
- `supabase.auth.signInWithPassword()` - 로그인
- 회원가입/로그인 토글 UI

### 5.4 src/components/MemoList.tsx 핵심 기능
- 스크롤 이벤트로 무한 스크롤 구현
- `scrollTop < 100` 일 때 이전 메모 로딩
- 날짜 구분선 표시 (오늘/어제/날짜)
- date-fns 사용: `isToday()`, `isYesterday()`, `format()`

### 5.5 src/components/BackupPage.tsx 핵심 기능
- 주차 시작일 계산 (월요일 기준)
- 주차별 메모 그룹화
- 단일 선택: `.txt` 다운로드
- 복수 선택: JSZip으로 `.zip` 다운로드

---

## 6단계: 스타일링 핵심

### CSS 변수 (다크 테마)
```css
:root {
    --bg-primary: #0f0f23;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #16213e;
    --accent: #6366f1;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --bubble-bg: #3730a3;
}
```

### 주요 스타일 요소
- `.app-container` - 최대 600px, 중앙 정렬
- `.memo-bubble` - 그라데이션 배경, 둥근 모서리
- `.header` - sticky 포지션
- 반응형: `@media (max-width: 480px)`

---

## 7단계: 빌드 및 배포

### 로컬 테스트
```powershell
npm run dev
```

### 프로덕션 빌드
```powershell
npm run build
```

### Cloudflare Pages 배포
```powershell
npx wrangler pages deploy dist --project-name=memo-app
```

---

## 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] memos 테이블 + RLS 정책 설정
- [ ] .env 파일에 API 키 설정
- [ ] supabase.ts 클라이언트 설정
- [ ] AuthForm 컴포넌트 (회원가입/로그인)
- [ ] MemoList 컴포넌트 (무한 스크롤)
- [ ] MemoInput 컴포넌트 (메모 입력)
- [ ] BackupPage 컴포넌트 (주차별 백업)
- [ ] App.tsx 통합
- [ ] 다크 테마 스타일링
- [ ] 빌드 및 배포
