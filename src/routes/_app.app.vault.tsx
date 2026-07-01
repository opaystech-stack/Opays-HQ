import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  FileSignature,
  Users,
  Megaphone,
  X,
  File,
  FolderClosed,
  DollarSign,
  CalendarDays,
} from 'lucide-react';
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

interface Contract {
  id: string;
  project_name: string | null;
  url: string;
  version: string | null;
  signed_at: string | null;
}

interface Billing {
  id: string;
  project_name: string | null;
  amount_total: number;
  amount_paid: number;
  status: string;
  due_date: string | null;
}

const BILLING_BADGE: Record<string, string> = {
  PENDING: 'badge-orange',
  PARTIAL: 'badge-blue',
  PAID: 'badge-green',
};

const BILLING_PROGRESS_COLOR: Record<string, string> = {
  PENDING: 'orange',
  PARTIAL: 'blue',
  PAID: 'green',
};

interface FolderDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  color: string;
}

const FOLDERS: FolderDef[] = [
  {
    id: 'contrats',
    label: 'Contrats',
    icon: <FileSignature size={24} />,
    iconClass: 'blue',
    color: 'var(--primary)',
  },
  {
    id: 'factures',
    label: 'Factures',
    icon: <FileText size={24} />,
    iconClass: 'green',
    color: '#22c55e',
  },
  {
    id: 'rh',
    label: 'RH',
    icon: <Users size={24} />,
    iconClass: 'purple',
    color: '#a855f7',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Megaphone size={24} />,
    iconClass: 'orange',
    color: '#f59e0b',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText size={20} />;
  if (['doc', 'docx'].includes(ext ?? '')) return <FileText size={20} />;
  if (['xls', 'xlsx', 'csv'].includes(ext ?? '')) return <FileText size={20} />;
  return <File size={20} />;
}

function VaultPage() {
  const { user } = useUser();
  const canUpload = !!user?.role_name && UPLOAD_ROLES.includes(user.role_name);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
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

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      const { error } = await apiUploadDocument(file);
      setUploading(false);
      setPreviewFile(null);
      if (error) {
        toast.error('Upload impossible', { description: error });
        return;
      }
      toast.success('Document téléversé');
      await load();
    },
    [load],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setPreviewFile(file);
      }
    },
    [],
  );

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreviewFile(f);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  }, []);

  const confirmUpload = useCallback(() => {
    if (previewFile) upload(previewFile);
  }, [previewFile, upload]);

  const cancelPreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const getFolderContracts = useCallback(
    (folderId: string) => {
      // Simple categorization based on folder
      if (folderId === 'contrats') return contracts;
      if (folderId === 'factures') return contracts; // fallback: show all
      if (folderId === 'rh') return contracts;
      if (folderId === 'marketing') return contracts;
      return contracts;
    },
    [contracts],
  );

  const getFolderBilling = useCallback(
    (folderId: string) => {
      if (folderId === 'factures') return billing;
      return [];
    },
    [billing],
  );

  const activeContracts = activeFolder ? getFolderContracts(activeFolder) : contracts;
  const activeBilling = activeFolder ? getFolderBilling(activeFolder) : billing;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Coffre-fort & Documents
        </h1>
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
          }}
        >
          Contrats signés, factures et documents internes
        </p>
      </div>

      {/* Grille de dossiers catégorisés */}
      <div className="vault-folder-grid">
        {FOLDERS.map((folder) => {
          const count =
            folder.id === 'factures'
              ? billing.length
              : contracts.length;
          return (
            <button
              key={folder.id}
              className={`vault-folder-card ${activeFolder === folder.id ? 'active' : ''}`}
              onClick={() =>
                setActiveFolder(
                  activeFolder === folder.id ? null : folder.id,
                )
              }
              style={{ border: 'none', fontFamily: 'inherit' }}
            >
              <div className={`vault-folder-icon ${folder.iconClass}`}>
                {folder.icon}
              </div>
              <div className="vault-folder-name">{folder.label}</div>
              <div className="vault-folder-count">
                {count} document{count !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone d'upload améliorée avec aperçu */}
      {canUpload && (
        <div>
          <div
            className={`vault-drop ${dragOver ? 'vault-drop-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !previewFile && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <Upload size={22} style={{ opacity: 0.6 }} />
            <span>
              {uploading
                ? 'Téléversement…'
                : 'Glissez un document ici, ou cliquez pour parcourir'}
            </span>
            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={onFileSelect}
            />
          </div>

          {/* Aperçu du fichier avant upload */}
          {previewFile && (
            <div className="vault-preview">
              <div className="vault-preview-icon">
                {getFileIcon(previewFile.name)}
              </div>
              <div className="vault-preview-info">
                <div className="vault-preview-name">{previewFile.name}</div>
                <div className="vault-preview-size">
                  {formatFileSize(previewFile.size)}
                </div>
              </div>
              <button
                className="vault-preview-remove"
                onClick={cancelPreview}
                title="Annuler"
              >
                <X size={16} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={confirmUpload}
                disabled={uploading}
              >
                {uploading ? 'Téléversement…' : 'Confirmer'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenu principal : deux colonnes */}
      <div className="vault-docs-grid">
        {/* Colonne Contrats / Documents */}
        <div className="card">
          <div className="vault-section-header">
            <div className="card-title">
              {activeFolder
                ? FOLDERS.find((f) => f.id === activeFolder)?.label ??
                  'Documents'
                : 'Tous les documents'}
            </div>
            <span className="vault-section-count">
              {activeContracts.length}
            </span>
          </div>
          {loading ? (
            <div className="kanban-empty">Chargement…</div>
          ) : activeContracts.length === 0 ? (
            <div className="kanban-empty">Aucun document</div>
          ) : (
            <div className="activity-list">
              {activeContracts.map((c) => (
                <div
                  key={c.id}
                  className="activity-item"
                  style={{ alignItems: 'center' }}
                >
                  <FileText size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
                  <div className="activity-content">
                    <div className="activity-text" style={{ fontWeight: 600 }}>
                      {c.project_name || 'Document'}
                    </div>
                    <div className="activity-time">
                      {c.version || '—'}
                      {c.signed_at
                        ? ` · signé le ${new Date(c.signed_at).toLocaleDateString('fr-FR')}`
                        : ''}
                    </div>
                  </div>
                  <a
                    className="btn btn-ghost btn-sm"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne Facturation enrichie */}
        <div className="card">
          <div className="vault-section-header">
            <div className="card-title">Facturation</div>
            <span className="vault-section-count">{activeBilling.length}</span>
          </div>
          {loading ? (
            <div className="kanban-empty">Chargement…</div>
          ) : activeBilling.length === 0 ? (
            <div className="kanban-empty">Aucune facture</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Progression</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {activeBilling.map((b) => {
                  const pct =
                    b.amount_total > 0
                      ? Math.min(
                          Math.round(
                            (b.amount_paid / b.amount_total) * 100,
                          ),
                          100,
                        )
                      : 0;
                  const progressColor =
                    BILLING_PROGRESS_COLOR[b.status] ?? 'orange';
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          {b.project_name || '—'}
                        </div>
                        {b.due_date && (
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--muted-foreground)',
                              marginTop: '0.125rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <CalendarDays size={10} />
                            Échéance :{' '}
                            {new Date(b.due_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                          {b.amount_total.toLocaleString('fr-FR')} $
                        </div>
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          payé {b.amount_paid.toLocaleString('fr-FR')} $
                        </div>
                      </td>
                      <td>
                        <div className="billing-progress">
                          <div className="billing-progress-bar">
                            <div
                              className={`billing-progress-fill ${progressColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="billing-progress-text">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${BILLING_BADGE[b.status] ?? 'badge-gray'}`}
                        >
                          {b.status === 'PENDING'
                            ? 'En attente'
                            : b.status === 'PARTIAL'
                              ? 'Partiel'
                              : b.status === 'PAID'
                                ? 'Payé'
                                : b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
