import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return <>Executions</>;
};

export default Page;
