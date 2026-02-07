import React from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import Chat from "./components/Chat";

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container">
      <div className="shell">
        <div className="header">
          <div className="brand">
            <h1>메모 채팅</h1>
            <p>혼자 하는 채팅처럼 기록하기 · Supabase</p>
          </div>
          {session && (
            <button
              className="btn"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              로그아웃
            </button>
          )}
        </div>

        <div className="main">
          {loading ? (
            <div className="authCard">
              <p className="notice">로딩 중…</p>
            </div>
          ) : session ? (
            <Chat userId={session.user.id} />
          ) : (
            <Auth />
          )}
        </div>
      </div>
      <p className="notice" style={{ marginTop: 10 }}>
        처음 설정은 <b>SUPABASE_SETUP.md</b>를 따라가면 돼요.
      </p>
    </div>
  );
}
