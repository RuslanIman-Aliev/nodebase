"use client"

import { ErrorView, LoadingView } from "@/components/entity-components"
import { useSuspanseWorkflow } from "@/features/workflows/hooks/use-workflows"

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />
}

export const EditorError = () => {
  return <ErrorView message="Failed to load editor." />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const {data: workflow} = useSuspanseWorkflow(workflowId)

  return <div>Editor - {workflow?.name}</div>
}