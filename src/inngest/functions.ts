import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { inngest } from "./client";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: gemini } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a helpful assistant that helps users with their tasks.",
      prompt: "2+2",
      experimental_telemetry:{
        isEnabled:true,
        recordInputs:true,
        recordOutputs:true
      }
    });

     const { steps: openAI } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai("gpt-4o"),
      system: "You are a helpful assistant that helps users with their tasks.",
      prompt: "2+2",
      experimental_telemetry:{
        isEnabled:true,
        recordInputs:true,
        recordOutputs:true
      }
    });

    return {
      gemini,openAI
    }
  },
);
