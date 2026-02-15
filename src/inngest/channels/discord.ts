import { channel, topic } from "@inngest/realtime";

export const discordRequestChannel = channel("discord-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
