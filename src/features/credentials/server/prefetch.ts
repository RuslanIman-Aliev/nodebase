import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.credentials.getMany>;

export const prefetchCredentials = async (params: Input) => {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
};

export const prefetchCredential = async (id: string) => {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
};
