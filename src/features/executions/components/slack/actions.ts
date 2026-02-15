"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { slackRequestChannel } from "@/inngest/channels/slack";

export type SlackToken = Realtime.Token<typeof slackRequestChannel, ["status"]>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: slackRequestChannel(),
    topics: ["status"],
  });

  return token;
}
