import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { fetchStripeTriggerRealtimeToken } from "./actions";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);
  const handleOpenSettings = () => {
    setOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "stripe-trigger-execution",
    topic: "status",
    refreshToken: fetchStripeTriggerRealtimeToken,
  });

  return (
    <>
      <StripeTriggerDialog open={open} onOpenChange={setOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe Trigger"
        description="When payment made"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

StripeTriggerNode.displayName = "StripeTriggerNode";
