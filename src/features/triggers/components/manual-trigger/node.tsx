import { NodeProps } from "@xyflow/react"
import { MousePointerIcon } from "lucide-react"
import { memo, useState } from "react"
import { BaseTriggerNode } from "../base-trigger-node"
import { ManualTriggerDialog } from "./dialog"

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false)
  const handleOpenSettings = () => {
    setOpen(true)
  }

  const nodeStatus = "loading"
  return (
    <>
    <ManualTriggerDialog open={open} onOpenChange={setOpen} />
    <BaseTriggerNode {...props} icon={MousePointerIcon} name="When clicking 'Execute Workflow'" 
    status={nodeStatus} 
    onSettings={handleOpenSettings}
    onDoubleClick={handleOpenSettings}
    />
    </>
  )
})

ManualTriggerNode.displayName = "ManualTriggerNode"