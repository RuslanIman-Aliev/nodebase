import type { NodeExecutor } from "@/features/executions/types";
import { discordRequestChannel } from "@/inngest/channels/discord";
import { slackRequestChannel } from "@/inngest/channels/slack";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      slackRequestChannel().status({
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
      slackRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Content is required to send message");
  }

  if (!data.webhookUrl) {
    await publish(
      slackRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Webhook URL is required to send message");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          text: content,
        },
      });
      return {
        ...context,
        [data.variableName || "slackResponse"]: {
          text: content,
        },
      };
    });

    await publish(
      slackRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      slackRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
