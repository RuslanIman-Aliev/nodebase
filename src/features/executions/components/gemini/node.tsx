"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiRealtimeToken } from "./actions";
import { GeminiDialog, GeminiFormValues } from "./dialog";

type GeminiNodeData = {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
  variableName?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "gemini-execution",
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const [open, setOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => {
    setOpen(true);
  };

  const handleSubmit = (values: GeminiFormValues) => {
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
    ? `${nodeData.model || "gemini-2.5-pro"}`
    : "No model configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />

      <GeminiDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
