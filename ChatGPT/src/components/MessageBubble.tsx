import React from "react";
import { format } from "date-fns";

type Props = {
  content: string;
  createdAt: string;
};

export default function MessageBubble({ content, createdAt }: Props) {
  const d = new Date(createdAt);
  return (
    <div className="row">
      <div>
        <div className="bubble">{content}</div>
        <div className="meta">{format(d, "yyyy-MM-dd HH:mm")}</div>
      </div>
    </div>
  );
}
