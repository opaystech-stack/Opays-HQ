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
      <div className="relative flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_24%),linear-gradient(180deg,_#040712_0%,_#090d19_100%)] text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />
        <Sidebar />
        <ClientSearchWrapper />
        <main className="relative z-10 flex-1 overflow-y-auto">
          {children}
        </main>
        <AIChatbot />
      </div>
    </ProfileProvider>
  );
}
