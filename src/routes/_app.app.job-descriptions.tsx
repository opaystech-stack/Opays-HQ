import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { apiGetJobDescriptions, apiCreateJobDescription, apiDeleteJobDescription } from '@/lib/api';

const ADMIN_ROLES = ['ceo', 'cto'];

export const Route = createFileRoute('/_app/app/job-descriptions')({
  component: JobDescriptionsPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !ADMIN_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

interface JobDescription {
  id: string;
  title: string;
  role_name: string | null;
  responsibilities: string | null;
  salary_range: string | null;
  access_level: string | null;
}

function JobDescriptionsPage() {
  const [items, setItems] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', role_name: '', responsibilities: '', salary_range: '', access_level: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetJobDescriptions();
    if (data?.jobDescriptions) setItems(data.jobDescriptions as JobDescription[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) return;
      const { error } = await apiCreateJobDescription({
        title: form.title.trim(),
        role_name: form.role_name.trim() || undefined,
        responsibilities: form.responsibilities.trim() || undefined,
        salary_range: form.salary_range.trim() || undefined,
        access_level: form.access_level.trim() || undefined,
      });
      if (error) {
        toast.error('Création impossible', { description: error });
        return;
      }
      setForm({ title: '', role_name: '', responsibilities: '', salary_range: '', access_level: '' });
      toast.success('Fiche de poste créée');
      await load();
    },
    [form, load],
  );

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await apiDeleteJobDescription(id);
    if (error) {
      toast.error('Suppression impossible', { description: error });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Fiches de poste</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Rôles, responsabilités et structure salariale — CEO / CTO
        </p>
      </div>

      <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
        <div className="card-header"><div className="card-title">Nouvelle fiche</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
          <input className="form-input" placeholder="Intitulé *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="form-input" placeholder="Rôle (ex. engineer)" value={form.role_name} onChange={(e) => setForm({ ...form, role_name: e.target.value })} />
          <input className="form-input" placeholder="Fourchette salariale" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
          <input className="form-input" placeholder="Niveau d'accès" value={form.access_level} onChange={(e) => setForm({ ...form, access_level: e.target.value })} />
        </div>
        <textarea className="form-input" style={{ marginTop: '0.75rem' }} rows={2} placeholder="Responsabilités" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} disabled={!form.title.trim()}>
          <Plus size={14} /> Créer
        </button>
      </form>

      <div className="card">
        {loading ? (
          <div className="kanban-empty">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="kanban-empty">Aucune fiche de poste.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Intitulé</th><th>Rôle</th><th>Salaire</th><th>Accès</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((jd) => (
                <tr key={jd.id}>
                  <td style={{ fontWeight: 600 }}>{jd.title}</td>
                  <td>{jd.role_name || '—'}</td>
                  <td>{jd.salary_range || '—'}</td>
                  <td>{jd.access_level || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(jd.id)} aria-label="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
