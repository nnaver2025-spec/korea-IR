import type { EventWithCompany } from "@/lib/types";

export interface TelegramAlertResult {
  ok: boolean;
  skipped: boolean;
  errorMessage?: string;
}

export async function sendTelegramAlert(event: EventWithCompany): Promise<TelegramAlertResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
      errorMessage: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured."
    };
  }

  const text = [
    "[Korea IR Calendar]",
    `${event.company.name} (${event.company.ticker})`,
    event.title,
    event.startsAt,
    event.sourceUrl
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: false
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      errorMessage: `Telegram send failed: ${response.status}`
    };
  }

  return {
    ok: true,
    skipped: false
  };
}
