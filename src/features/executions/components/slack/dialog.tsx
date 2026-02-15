"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  webhookUrl: z.string().min(1, "Webhook URL is required"),
  content: z.string().min(1, "Content is required"),
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    ),
});

interface SlackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}
export type SlackFormValues = z.infer<typeof formSchema>;
export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: SlackDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
      variableName: defaultValues.variableName || "",
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
        variableName: defaultValues.variableName || "",
      });
    }
  }, [defaultValues, form, open]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const watchVariableName = form.watch("variableName");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack</DialogTitle>
          <DialogDescription>
            Configure settings for the Slack node. The response from this node
            will be stored in the variable{" "}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a variable name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Static Url or use {"{{variables}}"} for simple values or{" "}
                    {"{{json variable}}"} to stringify objects
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://slack.com/api/webhooks..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The Slack webhook URL to send the message to. You can use a
                    static URL or reference other variables using{" "}
                    {"{{variables}}"} for simple values or {"{{json variable}}"}{" "}
                    to stringify objects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                      placeholder={`Enter the content to send to Slack`}
                    />
                  </FormControl>
                  <FormDescription>
                    The content to send to Slack. Use {"{{variables}}"} for
                    simple values or {"{{json variable}}"} to stringify objects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
