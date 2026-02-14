"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchOpenAiRealtimeToken } from "./actions";
import { OpenAiDialog, OpenAiFormValues } from "./dialog";

type OpenAiNodeData = {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variableName?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "openai-execution",
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const [open, setOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => {
    setOpen(true);
  };

  const handleSubmit = (values: OpenAiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.model
    ? `${nodeData.model || "openai-gpt-4"}`
    : "No model configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />

      <OpenAiDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";
