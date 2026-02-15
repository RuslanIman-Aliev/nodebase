import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma";
import { topologicalSort } from "@/inngest/utils";
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";
import { anthropicRequestChannel } from "./channels/anthropic";
import { discordRequestChannel } from "./channels/discord";
import { geminiRequestChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openAiRequestChannel } from "./channels/openai";
import { slackRequestChannel } from "./channels/slack";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiRequestChannel(),
      openAiRequestChannel(),
      anthropicRequestChannel(),
      discordRequestChannel(),
      slackRequestChannel()
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is required");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });
      if (!workflow) {
        throw new NonRetriableError(`Workflow with ID ${workflowId} not found`);
      }
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });

      return workflow.userId;
    })
    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        userId,
        publish,
      });
    }
    return { workflowId, result: context };
  },
);
