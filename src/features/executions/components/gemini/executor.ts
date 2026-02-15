import type { NodeExecutor } from "@/features/executions/types";
import { geminiRequestChannel } from "@/inngest/channels/gemini";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
}) => {
  await publish(
    geminiRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      geminiRequestChannel().status({
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
      geminiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("User prompt is required to generate text");
  }

  if (!data.credentialId) {
    await publish(
      geminiRequestChannel().status({
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
      geminiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Credential not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: decrypt(credential.value),
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-2.5-flash"),
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
      geminiRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName || "geminiResponse"]: { aiResponse: text },
    };
  } catch (error) {
    await publish(
      geminiRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
