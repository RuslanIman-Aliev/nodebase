import { channel, topic } from "@inngest/realtime";

export const slackRequestChannel = channel("slack-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
