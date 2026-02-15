"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchSlackRealtimeToken } from "./actions";
import { SlackDialog, SlackFormValues } from "./dialog";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "slack-execution",
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const [open, setOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => {
    setOpen(true);
  };

  const handleSubmit = (values: SlackFormValues) => {
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
  const description = nodeData?.content
    ? `Send message: ${nodeData.content.substring(0, 30)}${nodeData.content.length > 30 ? '...' : ''}`
    : "No content configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        name="Slack"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />

      <SlackDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";
