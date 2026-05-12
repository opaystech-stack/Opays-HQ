import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Sidebar from '@/components/Sidebar';
import ClientSearchWrapper from '@/components/ClientSearchWrapper';
import { ProfileProvider } from '@/lib/ProfileProvider';
import AIChatbot from '@/components/AIChatbot';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <ProfileProvider initialProfile={profile}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <ClientSearchWrapper />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <AIChatbot />
      </div>
    </ProfileProvider>
  );
}
