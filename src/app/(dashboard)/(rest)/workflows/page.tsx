import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  
  return <>Workflows</>;
};

export default Page;
