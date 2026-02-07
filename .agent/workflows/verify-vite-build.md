---
description: Vite 빌드에서 환경변수가 제대로 포함되었는지 검증하는 방법
---

# Vite 빌드 환경변수 검증

Vite는 `import.meta.env.VITE_*` 환경변수를 빌드 시점에 **실제 값으로 하드코딩**합니다.
그래서 minified된 빌드 파일에서는 `VITE_SUPABASE_URL` 같은 문자열을 검색해도 찾을 수 없습니다.

## 검증 방법

1. **빌드 실행**
   ```powershell
   npm run build
   ```

2. **환경변수 값으로 직접 검색** (환경변수 이름이 아님!)
   ```powershell
   # .env 파일에서 실제 값 확인
   cat .env
   
   # 빌드 파일에서 실제 값(예: supabase URL의 일부)으로 검색
   grep "eifhkmafouyotgqsessx" dist/assets/*.js
   ```

3. **grep이 실패하면 직접 파일 내용 확인**
   - minified 파일은 한 줄에 모든 코드가 있어서 grep이 실패할 수 있음
   - `view_file`로 빌드된 JS 파일의 80~100줄 사이 확인
   - Supabase 클라이언트 초기화 코드 근처에서 하드코딩된 URL/Key 확인

## 흔한 실수

❌ `grep "VITE_SUPABASE_URL"` - 환경변수 이름은 빌드 후 존재하지 않음
❌ `grep "import.meta.env"` - 빌드 시 치환되므로 존재하지 않음
✅ `grep "실제URL값"` 또는 직접 파일 내용 확인

## 환경변수가 undefined로 빌드된 경우

빌드 파일에서 `createClient(void 0, void 0)` 같은 패턴이 보이면:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 변수 이름이 `VITE_` 접두사로 시작하는지 확인
3. `.env` 파일 인코딩이 UTF-8인지 확인 (BOM 없이)
