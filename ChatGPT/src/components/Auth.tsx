import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSend = async () => {
    setError(null);
    const v = email.trim();
    if (!v) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: v,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? "로그인 링크 전송에 실패했어요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="authCard">
      <h2>로그인</h2>
      <p>
        <b>매직링크</b>로 로그인합니다. 이메일로 받은 링크를 누르면 이 페이지로 돌아오며 자동 로그인돼요.
      </p>

      <div className="rowGap">
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
        />
        <button className="btn primary" disabled={sending} onClick={onSend}>
          {sending ? "전송 중…" : "로그인 링크 보내기"}
        </button>
        {sent && <div className="notice">보냈어요! 이메일에서 로그인 링크를 확인해 주세요.</div>}
        {error && <div className="error">{error}</div>}
        <div className="notice">
          ⚙️ Supabase Auth 설정에서 <b>Redirect URLs</b>에 현재 주소(예: http://localhost:5173)를 추가해야 해요.
        </div>
      </div>
    </div>
  );
}
