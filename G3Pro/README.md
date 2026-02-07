# Supabase 설정 가이드

이 프로젝트는 Supabase를 백엔드로 사용합니다. 정상적인 작동을 위해 다음 단계를 따라 설정을 완료해 주세요.

## 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com/)에 로그인하고 **New Project**를 생성합니다.
2. Database Password를 안전한 곳에 저장해 둡니다.

## 2. API 키 확인
1. 프로젝트 대시보드에서 **Project Settings** (톱니바퀴 아이콘) -> **API**로 이동합니다.
2. `Project URL`과 `anon public` 키를 복사합니다.

## 3. 코드에 키 적용
`script.js` 파일을 열고 상단의 변수 값을 교체합니다.

```javascript
const SUPABASE_URL = '여기에_Project_URL_붙여넣기';
const SUPABASE_ANON_KEY = '여기에_anon_public_key_붙여넣기';
```

## 4. 데이터베이스 테이블 생성
Supabase 대시보드의 **SQL Editor**로 이동하여 아래 SQL을 실행합니다.

```sql
-- demos 테이블 생성
create table public.memos (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  content text null,
  constraint memos_pkey primary key (id)
);

-- RLS (Row Level Security) 설정 (간단한 테스트를 위해 모든 접근 허용)
-- 주의: 실제 서비스에서는 인증된 사용자만 접근하도록 정책을 설정해야 합니다.
alter table public.memos enable row level security;

create policy "Enable all access for all users"
on "public"."memos"
as permissive
for all
to public
using (true)
with check (true);
```

이제 `index.html`을 브라우저에서 열면 메모를 작성하고 저장할 수 있습니다!
