import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();

  const handleClick = () => {
    executeWorkflow.mutate({ id: workflowId });
  };
  return (
    <Button
      size={"lg"}
      onClick={handleClick}
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon />
      Execute Workflow
    </Button>
  );
};
