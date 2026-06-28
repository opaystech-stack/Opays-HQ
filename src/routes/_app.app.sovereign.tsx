import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, FileText, ExternalLink } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { apiGetSovereign, apiCreateSovereign } from '@/lib/api';

export const Route = createFileRoute('/_app/app/sovereign')({
  component: SovereignPage,
});

interface Research {
  id: string;
  title: string;
  abstract: string | null;
  content_url: string | null;
  author_name: string | null;
  created_at: string;
}

const WRITE_ROLES = ['ceo', 'cto'];

function SovereignPage() {
  const { user } = useUser();
  const canWrite = !!user?.role_name && WRITE_ROLES.includes(user.role_name);

  const [items, setItems] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', abstract: '', content_url: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetSovereign();
    if (data?.research) setItems(data.research as Research[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) return;
      const { error } = await apiCreateSovereign({
        title: form.title.trim(),
        abstract: form.abstract.trim() || undefined,
        content_url: form.content_url.trim() || undefined,
      });
      if (error) {
        toast.error('Publication impossible', { description: error });
        return;
      }
      setForm({ title: '', abstract: '', content_url: '' });
      toast.success('Publication ajoutée');
      await load();
    },
    [form, load],
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Souveraineté — R&D</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Benchmarks LLM locaux, architectures offline et publications de souveraineté
        </p>
      </div>

      {canWrite && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
          <div className="card-header"><div className="card-title">Nouvelle publication</div></div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input className="form-input" style={{ flex: 2, minWidth: '12rem' }} placeholder="Titre *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="form-input" style={{ flex: 2, minWidth: '12rem' }} placeholder="Lien du document" value={form.content_url} onChange={(e) => setForm({ ...form, content_url: e.target.value })} />
          </div>
          <textarea className="form-input" style={{ marginTop: '0.5rem' }} rows={2} placeholder="Résumé" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }} disabled={!form.title.trim()}>
            <Plus size={14} /> Publier
          </button>
        </form>
      )}

      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="card kanban-empty">Aucune publication.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <FileText size={16} /> {r.title}
                  </div>
                  {r.abstract && <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>{r.abstract}</p>}
                  {r.author_name && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>par {r.author_name}</div>}
                </div>
                {r.content_url && (
                  <a className="btn btn-outline btn-sm" href={r.content_url} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} /> Ouvrir
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
