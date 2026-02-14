import { channel, topic } from "@inngest/realtime";

export const geminiRequestChannel = channel("gemini-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
