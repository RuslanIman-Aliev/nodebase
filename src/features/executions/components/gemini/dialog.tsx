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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const AVAILABLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2-pro",
  "gemini-2-flash",
  "gemini-2.5-pro-100k",
  "gemini-2.5-flash",
] as const;

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string(),
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    ),
});

interface GeminiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiFormValues>;
}
export type GeminiFormValues = z.infer<typeof formSchema>;
export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: GeminiDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      model: defaultValues.model || "gemini-2.5-pro",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      variableName: defaultValues.variableName || "",
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        model: defaultValues.model || "gemini-2.5-pro",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
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
          <DialogTitle>Gemini</DialogTitle>
          <DialogDescription>
            Configure settings for the Gemini API here. This request allows you
            to start the workflow manually from the dashboard or via an API
            call.
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
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      {...field}
                    />
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                      placeholder={`You are a helpful assistant`}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {"{{variables}}"} for simple values or{" "}
                    {"{{json variable}}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                      placeholder={`Summarize the following text: {{input.text}}`}
                    />
                  </FormControl>
                  <FormDescription>
                    The promt to send to Gemini. Use {"{{variables}}"} for
                    simple values or {"{{json variable}}"} to stringify objects.
                    You can also use {`{{${watchVariableName}.text}}`} to
                    reference the response from this node in the prompt.
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
