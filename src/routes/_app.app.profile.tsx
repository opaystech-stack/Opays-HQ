import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { apiGetProfile, apiUpdateProfile } from '@/lib/api';

export const Route = createFileRoute('/_app/app/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { refresh } = useUser();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [google, setGoogle] = useState<{ connected: boolean; scopes?: string | null }>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetProfile();
    if (data) {
      setEmail(data.user.email);
      setFullName(data.user.full_name ?? '');
      setAvatarUrl(data.user.avatar_url ?? '');
      setRoleLabel(data.user.role_label ?? '');
      setGoogle(data.google);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      const { error } = await apiUpdateProfile({ full_name: fullName, avatar_url: avatarUrl });
      setSaving(false);
      if (error) {
        toast.error('Enregistrement impossible', { description: error });
        return;
      }
      toast.success('Profil mis à jour');
      await refresh();
    },
    [fullName, avatarUrl, refresh],
  );

  if (loading) return <div className="card kanban-empty">Chargement…</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mon profil</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{roleLabel}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <form className="card" onSubmit={handleSave}>
          <div className="card-header"><div className="card-title">Informations</div></div>
          <div className="form-group">
            <label className="form-label">Email (lecture seule — identité Google)</label>
            <input className="form-input" value={email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">URL de l'avatar</label>
            <input className="form-input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        <div className="card">
          <div className="card-header"><div className="card-title">Connexion Google</div></div>
          {google.connected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontWeight: 600 }}>
                <ShieldCheck size={18} /> Compte Google connecté
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                Scopes autorisés :
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {(google.scopes ?? '').split(' ').filter(Boolean).map((s) => (
                    <span key={s} className="project-tag">{s.replace('https://www.googleapis.com/auth/', '')}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
              <ShieldAlert size={18} /> Aucun compte Google lié à cette session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
