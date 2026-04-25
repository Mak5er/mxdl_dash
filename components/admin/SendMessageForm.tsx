"use client";

import { MessageSquareWarning, Send, X } from "lucide-react";
import { useState } from "react";

type SendMessageFormProps = {
  userId: number;
};

export function SendMessageForm({ userId }: SendMessageFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function sendMessage() {
    setLoading(true);
    setConfirmOpen(false);

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
  }

  return (
    <>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus(null);
          setConfirmOpen(true);
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

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-message-title"
        >
          <div className="max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center border border-[#229ED9]/40 bg-[#229ED9]/10 text-[#8bd9ff]">
                  <MessageSquareWarning className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="send-message-title" className="text-lg font-semibold text-white">
                    Send Telegram message?
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">User {userId}</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center border border-white/10 text-zinc-500 hover:border-white/30 hover:text-white"
                onClick={() => setConfirmOpen(false)}
                aria-label="Close confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 max-h-40 overflow-y-auto border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-300">
              {message}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/30 hover:text-white"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 border border-[#229ED9] bg-[#229ED9] px-4 py-2 text-sm font-semibold text-black hover:border-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={sendMessage}
                disabled={loading}
              >
                <Send className="h-4 w-4" />
                Send message
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
