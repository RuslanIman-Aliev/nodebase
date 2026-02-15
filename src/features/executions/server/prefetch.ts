import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.executions.getMany>;

export const prefetchExecutions = async (params: Input) => {
  return prefetch(trpc.executions.getMany.queryOptions(params));
};

export const prefetchExecution = async (id: string) => {
  return prefetch(trpc.executions.getOne.queryOptions({ id }));
};
