"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  status?: NodeStatus
}

export const BaseTriggerNode = ({
  icon: Icon,
  name,
  description,
  children,
  onSettings,
  onDoubleClick,
  id,
  status = 'initial',
}: BaseTriggerNodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = () => {
    setNodes((nodes) => {
      const updatedNodes = nodes.filter((node) => node.id !== id);
      return updatedNodes;
    });
    setEdges((edges) => {
      const updatedEdges = edges.filter(
        (edge) => edge.source !== id && edge.target !== id,
      );
      return updatedEdges;
    });
  };
  return (
    <WorkflowNode
      name={name}
      description={description}
      onDelete={handleDelete}
      onSettings={onSettings}
    >
      <NodeStatusIndicator status={status} variant="border" className="rounded-l-2xl">
        <BaseNode
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
          status={status}
        >
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={`${name} icon`} width={16} height={16} />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}
            {children}
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseTriggerNode.displayName = "BaseTriggerNode";
