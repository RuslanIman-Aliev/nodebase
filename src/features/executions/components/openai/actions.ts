"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openAiRequestChannel } from "@/inngest/channels/openai";

export type OpenAiToken = Realtime.Token<
  typeof  openAiRequestChannel,
  ["status"]
>;

export async function fetchOpenAiRealtimeToken(): Promise<OpenAiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: openAiRequestChannel(),
    topics: ["status"],
  });

  return token;
}
