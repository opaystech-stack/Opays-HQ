import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Sidebar from '@/components/Sidebar';
import ClientSearchWrapper from '@/components/ClientSearchWrapper';
import { ProfileProvider } from '@/lib/ProfileProvider';
import AIChatbotIsland from '@/components/AIChatbotIsland';

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
      <div className="relative flex min-h-screen overflow-hidden bg-[#f8f9fb] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
        <Sidebar />
        <ClientSearchWrapper />
        <main className="relative z-10 flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
        <AIChatbotIsland />
      </div>
    </ProfileProvider>
  );
}
