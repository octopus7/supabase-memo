# Supabase 설정 가이드

Supabase를 처음 사용하시는 분을 위한 단계별 설정 가이드입니다.

---

## 1단계: Supabase 계정 생성

1. [https://supabase.com](https://supabase.com) 접속
2. **Start your project** 버튼 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일로 가입

---

## 2단계: 새 프로젝트 생성

1. 대시보드에서 **New Project** 클릭
2. 다음 정보 입력:
   - **Name**: `memo-app` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (메모해두세요!)
   - **Region**: `Northeast Asia (Tokyo)` 선택 (한국에서 가장 가까움)
3. **Create new project** 클릭
4. 프로젝트 생성까지 약 2분 소요

---

## 3단계: 데이터베이스 테이블 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. 아래 SQL을 복사해서 붙여넣기:

```sql
-- 메모 테이블 생성
CREATE TABLE memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 본인 메모만 조회 가능
CREATE POLICY "Users can view own memos" ON memos
  FOR SELECT USING (auth.uid() = user_id);

-- 본인 메모만 생성 가능
CREATE POLICY "Users can insert own memos" ON memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 메모만 삭제 가능
CREATE POLICY "Users can delete own memos" ON memos
  FOR DELETE USING (auth.uid() = user_id);
```

4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. "Success. No rows returned" 메시지 확인

---

## 4단계: 인증 설정

1. 왼쪽 메뉴에서 **Authentication** → **Providers** 클릭
2. **Email** 항목 확인:
   - **Enable Email provider**: 켜져있는지 확인
   - **Confirm email**: 테스트용으로 **끄기** 권장 (나중에 켜세요)

---

## 5단계: API 키 확인

1. 왼쪽 메뉴에서 **Project Settings** (톱니바퀴 아이콘) 클릭
2. **API** 탭 클릭
3. 다음 두 값을 복사해서 `app.js`에 붙여넣기:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJI...` (긴 문자열)

```javascript
// app.js 상단에 붙여넣기
const SUPABASE_URL = 'https://xxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJI...여기에_anon_key_붙여넣기';
```

---

## 완료! 🎉

이제 브라우저에서 `index.html`을 열면 메모장을 사용할 수 있습니다.

### 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| 로그인이 안 됨 | API 키가 올바른지 확인 |
| 메모가 저장 안 됨 | SQL Editor에서 테이블 생성 확인 |
| CORS 에러 | 로컬 서버로 실행 (`python -m http.server 8080`) |
