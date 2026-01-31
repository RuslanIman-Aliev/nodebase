import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}
const Page = async ({ params }: PageProps) => {
  const { executionId } = await params;
  await requireAuth();

  return <>Execution id {executionId}</>;
};

export default Page;
