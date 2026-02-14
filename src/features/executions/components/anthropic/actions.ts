"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { anthropicRequestChannel } from "@/inngest/channels/anthropic";

export type AnthropicToken = Realtime.Token<
  typeof  anthropicRequestChannel,
  ["status"]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: anthropicRequestChannel(),
    topics: ["status"],
  });

  return token;
}
