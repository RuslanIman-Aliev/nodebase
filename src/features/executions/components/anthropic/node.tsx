"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchAnthropicRealtimeToken } from "./actions";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";

type AnthropicNodeData = {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
  variableName?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "anthropic-execution",
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const [open, setOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => {
    setOpen(true);
  };

  const handleSubmit = (values: AnthropicFormValues) => {
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
    ? `${nodeData.model || "anthropic-opus-4"}`
    : "No model configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />

      <AnthropicDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
