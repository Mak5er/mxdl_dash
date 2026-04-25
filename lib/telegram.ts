import "server-only";

type TelegramResponse = {
  ok: boolean;
  description?: string;
};

const TELEGRAM_TIMEOUT_MS = 10_000;

export async function sendTelegramMessage(userId: number, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      ok: false,
      error: "TELEGRAM_BOT_TOKEN is not configured.",
    };
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          chat_id: userId,
          text: message,
          disable_web_page_preview: true,
        }),
      },
    );
    clearTimeout(timeout);
    timeout = undefined;
    const data = (await response.json()) as TelegramResponse;

    if (!response.ok || !data.ok) {
      console.error("Telegram sendMessage failed", {
        status: response.status,
        description: data.description,
      });
      return {
        ok: false,
        error: data.description ?? "Telegram rejected the message.",
      };
    }

    return { ok: true, error: null };
  } catch (error) {
    console.error("Telegram sendMessage request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      error: "Telegram request failed.",
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
