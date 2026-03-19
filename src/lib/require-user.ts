import { auth } from "@/lib/auth";

export async function requireUserId() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return userId;
}

