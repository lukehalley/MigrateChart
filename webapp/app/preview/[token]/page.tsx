import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase-server';
import Home from '@/app/[token]/page';

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  // Check authentication server-side
  const user = await getUser();
  const { token } = await params;

  if (!user) {
    redirect(`/admin/login?redirect=/preview/${token}`);
  }

  // Render the token page at /preview/[token] URL
  // TokenContext will detect we're on a preview route
  return <Home />;
}
