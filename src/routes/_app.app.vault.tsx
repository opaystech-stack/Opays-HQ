import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getCurrentUser } from '@/lib/auth';
import { apiGetContracts, apiGetBilling, apiUploadDocument } from '@/lib/api';

const READ_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales'];
const UPLOAD_ROLES = ['ceo', 'cto', 'sales'];

export const Route = createFileRoute('/_app/app/vault')({
  component: VaultPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !READ_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

interface Contract { id: string; project_name: string | null; url: string; version: string | null; signed_at: string | null }
interface Billing { id: string; project_name: string | null; amount_total: number; amount_paid: number; status: string; due_date: string | null }

const BILLING_BADGE: Record<string, string> = { PENDING: 'badge-orange', PARTIAL: 'badge-blue', PAID: 'badge-green' };

function VaultPage() {
  const { user } = useUser();
  const canUpload = !!user?.role_name && UPLOAD_ROLES.includes(user.role_name);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, b] = await Promise.all([apiGetContracts(), apiGetBilling()]);
    if (c.data?.contracts) setContracts(c.data.contracts as Contract[]);
    if (b.data?.billing) setBilling(b.data.billing as Billing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    const { error } = await apiUploadDocument(file);
    setUploading(false);
    if (error) {
      toast.error('Upload impossible', { description: error });
      return;
    }
    toast.success('Document téléversé');
    await load();
  }, [load]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, [upload]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Coffre-fort & Documents</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Contrats signés et suivi de facturation
        </p>
      </div>

      {canUpload && (
        <div
          className={`vault-drop ${dragOver ? 'vault-drop-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <Upload size={22} style={{ opacity: 0.6 }} />
          <span>{uploading ? 'Téléversement…' : 'Glissez un document ici, ou cliquez pour parcourir'}</span>
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Contrats</div></div>
          {loading ? <div className="kanban-empty">Chargement…</div> : contracts.length === 0 ? <div className="kanban-empty">Aucun contrat</div> : (
            <div className="activity-list">
              {contracts.map((c) => (
                <div key={c.id} className="activity-item" style={{ alignItems: 'center' }}>
                  <FileText size={16} style={{ opacity: 0.6 }} />
                  <div className="activity-content">
                    <div className="activity-text" style={{ fontWeight: 600 }}>{c.project_name || 'Document'}</div>
                    <div className="activity-time">{c.version || '—'} {c.signed_at ? `· signé le ${new Date(c.signed_at).toLocaleDateString('fr-FR')}` : ''}</div>
                  </div>
                  <a className="btn btn-ghost btn-sm" href={c.url} target="_blank" rel="noreferrer">Ouvrir</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Facturation</div></div>
          {loading ? <div className="kanban-empty">Chargement…</div> : billing.length === 0 ? <div className="kanban-empty">Aucune facture</div> : (
            <table className="data-table">
              <thead><tr><th>Projet</th><th style={{ textAlign: 'right' }}>Total</th><th style={{ textAlign: 'right' }}>Payé</th><th>Statut</th></tr></thead>
              <tbody>
                {billing.map((b) => (
                  <tr key={b.id}>
                    <td>{b.project_name || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{b.amount_total.toLocaleString('fr-FR')} $</td>
                    <td style={{ textAlign: 'right' }}>{b.amount_paid.toLocaleString('fr-FR')} $</td>
                    <td><span className={`badge ${BILLING_BADGE[b.status] ?? 'badge-gray'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
