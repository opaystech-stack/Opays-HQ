import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Megaphone,
  Eye,
  Download,
  Copy,
  Check,
  FileText,
  Layout,
  X,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import {
  apiGetMarketingTemplates,
  apiCreateMarketingTemplate,
  apiUpdateMarketingTemplate,
  apiDeleteMarketingTemplate,
} from '@/lib/api';
import type { MarketingTemplate } from '@/types/database';

const MARKETING_ROLES = ['ceo', 'sales'];

export const Route = createFileRoute('/_app/app/marketing')({
  component: MarketingPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !MARKETING_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

const CATEGORIES = ['email', 'social', 'landing', 'sms', 'print'];

const CATEGORY_LABEL: Record<string, string> = {
  email: 'Email',
  social: 'Réseaux sociaux',
  landing: 'Landing page',
  sms: 'SMS',
  print: 'Print',
};

const CATEGORY_COLORS: Record<string, string> = {
  email: '#3b62d4',
  social: '#8b5cf6',
  landing: '#22c55e',
  sms: '#f59e0b',
  print: '#ec4899',
};

function MarketingPage() {
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Editor
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState('');

  // New template form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    description: '',
    category: 'email',
    content: '',
    variables: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetMarketingTemplates();
    if (err || !data) {
      setError(err || 'Erreur de chargement des templates');
      setTemplates([]);
    } else {
      setTemplates(data.templates as MarketingTemplate[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (q) {
        const hay = `${t.name} ${t.description ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      return true;
    });
  }, [templates, search, categoryFilter]);

  // Open editor for a template
  const openEditor = useCallback((template: MarketingTemplate) => {
    setEditingTemplate(template);
    const initial: Record<string, string> = {};
    template.variables.forEach((v) => {
      initial[v] = `{{${v}}}`;
    });
    setVariableValues(initial);
    setPreviewContent(template.content);
  }, []);

  // Update preview when variable values change
  const updateVariable = useCallback(
    (key: string, value: string) => {
      const updated = { ...variableValues, [key]: value };
      setVariableValues(updated);
      if (editingTemplate) {
        let content = editingTemplate.content;
        for (const [k, v] of Object.entries(updated)) {
          content = content.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        }
        setPreviewContent(content);
      }
    },
    [editingTemplate, variableValues],
  );

  // Copy to clipboard
  const copyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
      toast.success('Contenu copié dans le presse-papier');
    } catch {
      toast.error('Impossible de copier');
    }
  }, [previewContent]);

  // Download as text file
  const downloadContent = useCallback(() => {
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingTemplate?.name ?? 'template'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier téléchargé');
  }, [previewContent, editingTemplate]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newForm.name.trim() || !newForm.content.trim()) return;
      setSubmitting(true);
      const variables = newForm.variables
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      const { error: err } = await apiCreateMarketingTemplate({
        name: newForm.name.trim(),
        description: newForm.description.trim() || undefined,
        category: newForm.category,
        content: newForm.content,
        variables,
      });
      setSubmitting(false);
      if (err) {
        toast.error('Création impossible', { description: err });
        return;
      }
      setNewForm({ name: '', description: '', category: 'email', content: '', variables: '' });
      setShowNewForm(false);
      toast.success('Template créé');
      await load();
    },
    [newForm, load],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Supprimer ce template ?')) return;
      const { error: err } = await apiDeleteMarketingTemplate(id);
      if (err) {
        toast.error('Suppression impossible', { description: err });
        return;
      }
      toast.success('Template supprimé');
      await load();
    },
    [load],
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Marketing</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Templates de communication et campagnes
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewForm((v) => !v)}>
          <Plus size={14} /> Nouveau template
        </button>
      </div>

      {/* New template form */}
      {showNewForm && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
          <div className="card-header">
            <div className="card-title">Nouveau template</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input className="form-input" placeholder="Nom *" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} required />
            <input className="form-input" placeholder="Description" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
            <select className="form-input" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_LABEL[c]}</option>))}
            </select>
            <input className="form-input" placeholder="Variables (séparées par des virgules, ex: nom,entreprise)" value={newForm.variables} onChange={(e) => setNewForm({ ...newForm, variables: e.target.value })} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <textarea
              className="form-input"
              placeholder="Contenu du template (utilisez {{variable}} pour les champs dynamiques)"
              value={newForm.content}
              onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
              rows={6}
              style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !newForm.name.trim() || !newForm.content.trim()}>
            {submitting ? 'Création…' : 'Créer le template'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="kanban-toolbar">
        <div className="kanban-filters" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input className="form-input kanban-select" style={{ paddingLeft: '2rem' }} placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input kanban-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filtrer par catégorie">
            <option value="all">Toutes catégories</option>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_LABEL[c]}</option>))}
          </select>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
          {visible.length} template{visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Template grid */}
      {loading && <div className="kanban-empty">Chargement…</div>}
      {error && !loading && <div style={{ color: '#ef4444' }}>{error}</div>}
      {!loading && !error && visible.length === 0 && <div className="kanban-empty">Aucun template</div>}

      {!loading && !error && visible.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
            gap: '1rem',
          }}
        >
          {visible.map((template) => (
            <div key={template.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Preview area */}
              <div
                style={{
                  height: '8rem',
                  background: 'var(--muted)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border)',
                }}
              >
                {template.preview_url ? (
                  <img
                    src={template.preview_url}
                    alt={template.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    <Layout size={32} style={{ opacity: 0.4, marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.75rem' }}>Aperçu</div>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: CATEGORY_COLORS[template.category] || 'var(--muted-foreground)',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  {CATEGORY_LABEL[template.category] || template.category}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{template.name}</div>
                {template.description && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    {template.description}
                  </div>
                )}
                {template.variables.length > 0 && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    Variables : {template.variables.join(', ')}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => openEditor(template)}>
                  <Eye size={12} /> Utiliser
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(template.id)} style={{ color: '#ef4444' }}>
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editingTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setEditingTemplate(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '48rem', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <FileText size={16} /> {editingTemplate.name}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingTemplate(null)}>
                <X size={14} />
              </button>
            </div>

            {/* Variables */}
            {editingTemplate.variables.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Variables
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: '0.5rem' }}>
                  {editingTemplate.variables.map((v) => (
                    <div key={v}>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.125rem' }}>
                        {v}
                      </label>
                      <input
                        className="form-input"
                        value={variableValues[v] || ''}
                        onChange={(e) => updateVariable(v, e.target.value)}
                        placeholder={`Valeur pour ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Aperçu
              </div>
              <div
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  minHeight: '6rem',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                }}
              >
                {previewContent}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={copyContent}>
                <Copy size={12} /> Copier
              </button>
              <button className="btn btn-outline btn-sm" onClick={downloadContent}>
                <Download size={12} /> Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
