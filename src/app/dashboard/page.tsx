import DashboardOverview from '@/components/DashboardOverview';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { data: leads },
    { data: projectsData },
    { data: allProjects },
    { data: taskData },
    { data: logs },
  ] = await Promise.all([
    supabase.from('leads').select('potential_value, status'),
    supabase
      .from('projects')
      .select('id, title, status, due_date, branch, leads(company_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('projects').select('id, branch'),
    supabase.from('tasks').select('id, status'),
    supabase.from('equity_vesting_logs').select('shares_unlocked'),
  ]);

  const pipelineValue = leads?.reduce((acc, lead) => acc + Number(lead.potential_value || 0), 0) || 0;
  const auditCount = leads?.filter((lead) => lead.status === 'AUDIT_PENDING').length || 0;
  const totalVested = logs?.reduce((acc, log) => acc + Number(log.shares_unlocked || 0), 0) || 0;
  const studioCount = allProjects?.filter((project) => project.branch === 'STUDIO').length || 0;
  const labsCount = allProjects?.filter((project) => project.branch === 'LABS').length || 0;
  const totalCount = Math.max(allProjects?.length || 0, 1);
  const recentProjects = (projectsData || []).map((project) => ({
    ...project,
    leads: Array.isArray(project.leads) ? project.leads[0] || null : project.leads,
  }));

  return (
    <DashboardOverview
      initialStats={{
        pipeline: pipelineValue,
        leads: leads?.length || 0,
        audits: auditCount,
        vesting: totalVested,
        projects: allProjects?.length || 0,
        tasks: taskData?.filter((task) => task.status !== 'DONE').length || 0,
        studioShare: Math.round((studioCount / totalCount) * 100),
        labsShare: Math.round((labsCount / totalCount) * 100),
      }}
      initialProjects={recentProjects}
    />
  );
}
