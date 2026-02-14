import { channel, topic } from "@inngest/realtime";

export const anthropicRequestChannel = channel("anthropic-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
