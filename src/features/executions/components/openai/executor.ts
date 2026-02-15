import type { NodeExecutor } from "@/features/executions/types";
import { openAiRequestChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
  publish,
}) => {
  await publish(
    openAiRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      openAiRequestChannel().status({
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
      openAiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("User prompt is required to generate text");
  }

  if (!data.credentialId) {
    await publish(
      openAiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Credential ID is required to authenticate with OpenAI",
    );
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
      openAiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    
    throw new NonRetriableError("Credential not found");
  }

  const openAi = createOpenAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openAi(data.model || "gpt-4"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openAiRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName || "openAiResponse"]: { aiResponse: text },
    };
  } catch (error) {
    await publish(
      openAiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
