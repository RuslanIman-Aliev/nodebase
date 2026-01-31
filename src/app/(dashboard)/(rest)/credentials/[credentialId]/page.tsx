import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}
const Page = async ({ params }: PageProps) => {
  const { credentialId } = await params;
  await requireAuth();

  return <>Credential id {credentialId}</>;
};

export default Page;
