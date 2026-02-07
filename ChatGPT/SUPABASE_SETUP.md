# Supabase 가입/프로젝트/설정 지침 (필수)

이 프로젝트는 **정적 프론트**이므로 Supabase의 **RLS(Row Level Security)** 설정이 핵심입니다.

---

## 1) Supabase 가입 & 프로젝트 만들기
1. Supabase에 가입/로그인
2. **New project** 생성
3. 프로젝트 생성 후 좌측 메뉴에서:
   - **Project Settings → API**
     - `Project URL` (VITE_SUPABASE_URL)
     - `anon public` 키 (VITE_SUPABASE_ANON_KEY)
   를 확인합니다.

---

## 2) Auth(매직링크) 설정
좌측 **Authentication → Providers → Email**에서:
- Email provider 활성화
- “Confirm email”은 취향(보통 켜두는 편이 안전)
- Magic link 사용 가능

### Redirect URLs 등록 (중요)
좌측 **Authentication → URL Configuration**에서:
- `Site URL` : 배포 주소(예: https://your-site.vercel.app)
- `Redirect URLs` 에 아래를 추가
  - 로컬: `http://localhost:5173`
  - 배포: 배포된 도메인들

> 여기 설정이 없으면 매직링크 클릭 후 로그인 완료가 안 될 수 있어요.

---

## 3) DB 테이블 + RLS 생성
좌측 **SQL Editor**로 가서 아래 파일 내용을 실행:
- `supabase/sql/01_schema.sql`

실행 후 확인:
- Table Editor에 `notes_messages` 테이블이 생김
- `notes_messages`의 RLS가 켜져 있음
- Policy가 4개(select/insert/update/delete) 생성됨

---

## 4) 환경변수 설정 (.env)
프로젝트 루트에서:

1) `.env.example` → `.env`로 복사  
2) 아래 값을 채우기

- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: anon public key

---

## 5) 정상 동작 체크
1. `npm run dev`로 실행
2. 이메일 입력 → “로그인 링크 보내기”
3. 받은 메일에서 링크 클릭 → 자동 로그인
4. 메모 전송 → 새로고침해도 남아있으면 성공

---

## Troubleshooting
- 로그인 링크 클릭했는데 다시 로그인 화면이 뜸:
  - Supabase의 Redirect URLs에 현재 주소가 빠졌을 가능성이 큼
- insert/select 에러:
  - RLS 정책이 없거나, auth.uid()가 null(로그인 안함)인 상태일 수 있음
- 로컬에서만 되고 배포에서 안 됨:
  - 배포 도메인을 Redirect URLs에 추가했는지 확인
  - 배포 환경변수에 VITE_SUPABASE_*가 들어갔는지 확인
