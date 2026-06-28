import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronUp, Plus } from 'lucide-react';
import { apiGetIdeas, apiCreateIdea, apiVoteIdea } from '@/lib/api';

export const Route = createFileRoute('/_app/app/ideas')({
  component: IdeasPage,
});

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: 'TECH' | 'SALES' | 'OPS' | 'OTHER';
  votes: number;
  status: string;
  author_name: string | null;
}

const CATEGORY_BADGE: Record<string, string> = {
  TECH: 'badge-blue',
  SALES: 'badge-green',
  OPS: 'badge-orange',
  OTHER: 'badge-gray',
};

function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Idea['category']>('TECH');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetIdeas();
    if (data?.ideas) setIdeas(data.ideas as Idea[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      const { error } = await apiCreateIdea({ title: title.trim(), description: description.trim() || undefined, category });
      if (error) {
        toast.error('Création impossible', { description: error });
        return;
      }
      setTitle('');
      setDescription('');
      setCategory('TECH');
      toast.success('Idée publiée');
      await load();
    },
    [title, description, category, load],
  );

  const handleVote = useCallback(async (id: string) => {
    // Optimiste : +1 immédiat, tri recalculé au rechargement léger.
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)));
    const { error } = await apiVoteIdea(id);
    if (error) {
      toast.error('Vote impossible', { description: error });
      await load();
    }
  }, [load]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Boîte à idées</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Proposez et votez pour les meilleures idées
        </p>
      </div>

      <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ flex: 2, minWidth: '12rem' }} placeholder="Votre idée…" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="form-input" style={{ flex: 3, minWidth: '12rem' }} placeholder="Description (optionnelle)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select className="form-input kanban-select" value={category} onChange={(e) => setCategory(e.target.value as Idea['category'])}>
            <option value="TECH">Tech</option>
            <option value="SALES">Sales</option>
            <option value="OPS">Ops</option>
            <option value="OTHER">Autre</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim()}>
            <Plus size={14} /> Publier
          </button>
        </div>
      </form>

      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : ideas.length === 0 ? (
        <div className="card kanban-empty">Aucune idée pour l'instant.</div>
      ) : (
        <div className="ideas-grid">
          {ideas.map((idea) => (
            <div key={idea.id} className="card idea-card">
              <button className="idea-vote" onClick={() => handleVote(idea.id)} aria-label="Voter">
                <ChevronUp size={16} />
                <span>{idea.votes}</span>
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{idea.title}</span>
                  <span className={`badge ${CATEGORY_BADGE[idea.category]}`}>{idea.category}</span>
                </div>
                {idea.description && <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.375rem' }}>{idea.description}</p>}
                {idea.author_name && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>par {idea.author_name}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
