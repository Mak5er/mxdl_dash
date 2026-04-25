"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type SendMessageFormProps = {
  userId: number;
};

export function SendMessageForm({ userId }: SendMessageFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus(null);

        if (!window.confirm(`Send this Telegram message to ${userId}?`)) {
          return;
        }

        setLoading(true);
        const response = await fetch("/api/admin/send-message", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId, message }),
        });
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setLoading(false);

        if (!response.ok) {
          setStatus(data?.error ?? "Message failed.");
          return;
        }

        setMessage("");
        setStatus("Message sent.");
      }}
    >
      <textarea
        className="min-h-32 w-full resize-y border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/40"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={1500}
        placeholder="Write a short admin message..."
        required
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-600">{message.length}/1500</span>
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="inline-flex items-center gap-2 border border-white bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {loading ? "Sending" : "Send"}
        </button>
      </div>
      {status ? <div className="text-sm text-zinc-400">{status}</div> : null}
    </form>
  );
}

