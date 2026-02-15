"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { discordRequestChannel } from "@/inngest/channels/discord";

export type DiscordToken = Realtime.Token<
  typeof  discordRequestChannel,
  ["status"]
>;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: discordRequestChannel(),
    topics: ["status"],
  });

  return token;
}
