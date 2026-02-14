"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { geminiRequestChannel } from "@/inngest/channels/gemini";

export type GeminiToken = Realtime.Token<
  typeof  geminiRequestChannel,
  ["status"]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiRequestChannel(),
    topics: ["status"],
  });

  return token;
}
