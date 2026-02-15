import type { NodeExecutor } from "@/features/executions/types";
import { discordRequestChannel } from "@/inngest/channels/discord";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      discordRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Variable name is required to store the response",
    );
  }

  if (!data.content) {
    await publish(
      discordRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Content is required to send message");
  }

  if (!data.webhookUrl) {
    await publish(
      discordRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Webhook URL is required to send message");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });
      return {
        ...context,
        [data.variableName || "discordResponse"]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      discordRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      discordRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
