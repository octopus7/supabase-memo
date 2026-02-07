# 📝 메모장 (Opus)

Supabase 기반 채팅 형식 웹 메모장

## 기술 스택

- **프론트엔드**: Vite + React + TypeScript
- **백엔드**: Supabase (Database + Auth)
- **스타일**: Vanilla CSS

## 시작하기

### 1. Supabase 설정

[SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고

### 2. API 키 입력

`src/lib/supabase.ts` 수정:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. 실행

```powershell
cd Opus
npm install
npm run dev
```

## 라이선스

MIT
