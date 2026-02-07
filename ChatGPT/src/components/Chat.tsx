import React from "react";
import { supabase } from "../lib/supabaseClient";
import MessageBubble from "./MessageBubble";
import { format } from "date-fns";

type Msg = {
  id: string;
  content: string;
  created_at: string;
};

function groupByDay(messages: Msg[]) {
  const groups: { day: string; items: Msg[] }[] = [];
  for (const m of messages) {
    const day = format(new Date(m.created_at), "yyyy-MM-dd");
    const last = groups[groups.length - 1];
    if (!last || last.day !== day) groups.push({ day, items: [m] });
    else last.items.push(m);
  }
  return groups;
}

export default function Chat({ userId }: { userId: string }) {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const chatRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes_messages")
        .select("id, content, created_at")
        .order("created_at", { ascending: true })
        .limit(200);

      if (!mounted) return;
      if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        setMessages([]);
      } else {
        setMessages((data ?? []) as Msg[]);
        setTimeout(() => scrollToBottom(false), 0);
      }
      setLoading(false);
    })();

    // Realtime: 내 메시지 insert만 구독
    const channel = supabase
      .channel("notes_messages_me")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notes_messages",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const row = payload.new as any;
          setMessages((prev) => {
            if (prev.some((p) => p.id === row.id)) return prev;
            return [...prev, { id: row.id, content: row.content, created_at: row.created_at }];
          });
          setTimeout(() => scrollToBottom(true), 0);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const onSend = async () => {
    const v = text.trim();
    if (!v || sending) return;

    setSending(true);
    setText("");

    // optimistic UI: 임시 메시지
    const tempId = `temp_${crypto.randomUUID()}`;
    const temp: Msg = { id: tempId, content: v, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    setTimeout(() => scrollToBottom(true), 0);

    const { data, error } = await supabase
      .from("notes_messages")
      .insert({ content: v })
      .select("id, content, created_at")
      .single();

    if (error) {
      // 실패 롤백
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      // eslint-disable-next-line no-alert
      alert("저장 실패: " + error.message);
      setText(v);
    } else if (data) {
      // temp를 실제 row로 교체 (realtime이 먼저 들어올 수도 있으니 중복 방지)
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === (data as any).id)) return withoutTemp;
        return [...withoutTemp, data as any];
      });
    }

    setSending(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const groups = groupByDay(messages);

  return (
    <>
      <div className="chat" ref={chatRef}>
        {loading ? (
          <div className="notice">불러오는 중…</div>
        ) : messages.length === 0 ? (
          <div className="notice">첫 메모를 남겨보세요. 아래 입력창에 쓰고 Enter!</div>
        ) : (
          groups.map((g) => (
            <div key={g.day}>
              <div className="dayDivider">{g.day}</div>
              {g.items.map((m) => (
                <MessageBubble key={m.id} content={m.content} createdAt={m.created_at} />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="composer">
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="메모를 입력하세요… (Enter 전송 / Shift+Enter 줄바꿈)"
        />
        <button className="btn primary" disabled={sending || text.trim().length === 0} onClick={onSend}>
          {sending ? "…" : "전송"}
        </button>
      </div>
    </>
  );
}
