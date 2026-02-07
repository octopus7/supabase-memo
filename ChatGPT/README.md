# memo-chat-supabase

정적 프론트(React+Vite) + Supabase로 만드는 **혼자 하는 채팅 느낌의 웹 메모장**입니다.  
메시지(메모) 버블 + 작성 날짜/시간을 표시합니다.

## 0) 준비물
- Node.js 18+ 권장
- Supabase 계정/프로젝트

## 1) Supabase 설정
👉 자세한 단계는 **SUPABASE_SETUP.md**를 보세요.

## 2) 로컬 실행
1. 의존성 설치
   ```bash
   npm install
   ```
2. 환경변수 설정
   - `.env.example`을 복사해서 `.env` 생성 후 값 채우기
   ```bash
   cp .env.example .env
   ```
3. 실행
   ```bash
   npm run dev
   ```

## 3) 빌드/배포
```bash
npm run build
npm run preview
```

- Vercel/Netlify/Cloudflare Pages 등에 `dist`를 배포하면 됩니다.
- 배포 주소가 바뀌면 Supabase Auth의 Redirect URL도 함께 추가해 주세요.

## 사용법
- 로그인(매직링크) → 아래 입력창에 메모 작성 → Enter 전송
- Shift+Enter: 줄바꿈

## 폴더
- `supabase/sql/01_schema.sql` : 테이블 + RLS 정책 SQL
