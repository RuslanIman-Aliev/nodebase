"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface StripeTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: StripeTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params?.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard!");
    } catch (err) {
      toast.error(
        "Failed to copy webhook URL: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for the Stripe trigger here. This trigger allows
            you to start the workflow when a Stripe event occurs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook Url</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe account</li>
              <li>Go to Webhooks settings</li>
              <li>
                {" "}
                Click add endpoint and paste the webhook URL above, then click
                &quot;Next&quot;
              </li>
              <li>Select events to listen for</li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.event}}"}
                </code>
                - The Stripe event data
              </li>
    
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.event.metadata}}"}
                </code>
                - The metadata of the Stripe event
              </li>


              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.amount}}"}
                </code>
                - The amount of the Stripe event
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
