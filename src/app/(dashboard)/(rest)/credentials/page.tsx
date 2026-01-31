import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return <>Credentials</>;
};

export default Page;
