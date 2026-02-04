import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflows.getMany>;

export const prefetchWorkflows = async (params: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

export const prefetchWorkflow = async (id: string) => {
  return prefetch(trpc.workflows.getOne.queryOptions({ id }));
};
