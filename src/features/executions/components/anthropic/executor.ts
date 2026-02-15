import type { NodeExecutor } from "@/features/executions/types";
import { anthropicRequestChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
  publish,
}) => {
  await publish(
    anthropicRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Variable name is required to store the response",
    );
  }

  if (!data.userPrompt) {
    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("User prompt is required to generate text");
  }

  if (!data.credentialId) {
    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Credential is required to generate text");
  }
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = data.userPrompt
    ? Handlebars.compile(data.userPrompt)(context)
    : "";

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId!,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Credential not found");
  }

  const anthropic = createAnthropic({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-opus-4-0"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName || "anthropicResponse"]: { aiResponse: text },
    };
  } catch (error) {
    await publish(
      anthropicRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
