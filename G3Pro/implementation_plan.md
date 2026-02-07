# Supabase 정적 웹 메모장 구현 계획

## 사용자 요구사항 분석
1. **기술 스택**: Supabase + Static HTML/JS/CSS.
2. **UX**: 혼자서 대화하는 채팅방 느낌 (나의 메시지 + 날짜/시간).
3. **언어**: 한국어.

## 아키텍처
- **Frontend**: Pure HTML, CSS, Vanilla JavaScript. (프레임워크 없이 가볍게 구현하여 "Static" 특성 강조)
- **Backend (BaaS)**: Supabase
  - **Database**: PostgreSQL (`memos` 테이블)
  - **API**: `supabase-js` 클라이언트를 CDN으로 로드하여 사용.

## 데이터베이스 스키마 (Supabase)
### `memos` 테이블
| 컬럼명 | 타입 | 설명 |
|---|---|---|
| id | uuid | 기본키 (Primary Key) |
| content | text | 메모 내용 |
| created_at | timestamp | 작성 시간 (default: now()) |

## UI/UX 디자인
- **전체 테마**: 깔끔하고 모던한 채팅 앱 스타일 (예: 카카오톡, iMessage, Telegram 등 참고).
- **메인 화면**:
  - **헤더**: "나만의 메모장" 타이틀.
  - **대화창**: 스크롤 가능한 영역. 최신 메모가 아래에 쌓임.
    - **메시지 버블**: 우측 정렬 (사용자가 나 자신뿐이므로). 컨텐츠와 그 아래 작은 글씨로 날짜 표시.
  - **입력창**: 하단 고정. 텍스트 입력 + 전송 버튼.

## 구현 단계
### 1. 프로젝트 구조 생성
- `G3Pro/index.html`: 메인 구조.
- `G3Pro/style.css`: 채팅 UI 스타일링.
- `G3Pro/script.js`: 데이터 로직 (파일명 변경: app.js -> script.js).

### 2. Supabase 연동
- HTML 헤더에 CDN 스크립트 추가.
- `G3Pro/script.js`에서 `createClient` 초기화.
- API 키와 URL은 코드 내 변수로 관리하거나, 데모용으로는 `config.js` 등으로 분리.

### 3. 기능 구현
- **Load**: 페이지 로드 시 기존 메모 `select` 하여 렌더링.
- **Add**: 전송 버튼 클릭 시 `insert` 후 UI에 추가.
- **Realtime (옵션)**: `subscribe`를 통해 다른 탭에서도 동기화 되도록 구현 고려.

## 검증 계획 (Verification Plan)
- [ ] 로컬에서 `index.html`을 브라우저로 열어서 정상 작동 확인.
- [ ] 메모 입력 후 새로고침 시 데이터 유지 확인 (Supabase 연동 확인).
- [ ] UI가 채팅처럼 자연스러운지 확인 (스크롤, 줄바꿈 등).
