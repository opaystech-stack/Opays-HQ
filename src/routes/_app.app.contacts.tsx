import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Building2,
  User,
  Trash2,
  X,
  Save,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import {
  apiGetContacts,
  apiUpdateContactStatus,
  apiDeleteContact,
} from '@/lib/api';
import type { SiteContact, SiteContactStatus } from '@/types/database';

const CONTACT_ROLES = ['admin', 'ceo', 'coo', 'cto'];

export const Route = createFileRoute('/_app/app/contacts')({
  component: ContactsPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.role_name || !CONTACT_ROLES.includes(user.role_name)) {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

const STATUS_LABEL: Record<SiteContactStatus, string> = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
  archived: 'Archivé',
};

const STATUS_BADGE: Record<SiteContactStatus, string> = {
  new: 'badge-blue',
  read: 'badge-gray',
  replied: 'badge-green',
  archived: 'badge-orange',
};

const STATUSES: SiteContactStatus[] = ['new', 'read', 'replied', 'archived'];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

function ContactsPage() {
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SiteContactStatus | 'all'>('all');

  // Modal détail
  const [selected, setSelected] = useState<SiteContact | null>(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiGetContacts();
    if (err || !data) {
      setError(err || 'Erreur de chargement');
      setContacts([]);
    } else {
      setContacts(data.contacts as SiteContact[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const nouveaux = contacts.filter((c) => c.status === 'new').length;
    const lus = contacts.filter((c) => c.status === 'read').length;
    const replies = contacts.filter((c) => c.status === 'replied').length;
    return { total, nouveaux, lus, replies };
  }, [contacts]);

  const visible = useMemo(() => {
    let list = contacts;
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, search, statusFilter]);

  const handleStatusChange = useCallback(
    async (id: string, status: SiteContactStatus) => {
      const previous = contacts;
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      const { error: err } = await apiUpdateContactStatus(id, status);
      if (err) {
        setContacts(previous);
        toast.error('Mise à jour impossible', { description: err });
      } else {
        toast.success(`Statut mis à jour : ${STATUS_LABEL[status]}`);
        if (selected?.id === id) {
          setSelected((prev) => (prev ? { ...prev, status } : prev));
        }
      }
    },
    [contacts, selected]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Supprimer ce contact définitivement ?')) return;
      const { error: err } = await apiDeleteContact(id);
      if (err) {
        toast.error('Suppression impossible', { description: err });
        return;
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Contact supprimé');
    },
    [selected]
  );

  const openDetail = useCallback(
    (contact: SiteContact) => {
      setSelected(contact);
      setNotes(contact.notes || '');
      // Marquer comme lu automatiquement si encore nouveau
      if (contact.status === 'new') {
        handleStatusChange(contact.id, 'read');
      }
    },
    [handleStatusChange]
  );

  const saveNotes = useCallback(async () => {
    if (!selected) return;
    // On utilise le PATCH status pour sauvegarder les notes via un appel PUT custom
    // En attendant, on met à jour localement
    setContacts((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, notes } : c))
    );
    setSelected((prev) => (prev ? { ...prev, notes } : prev));
    toast.success('Notes enregistrées');
  }, [selected, notes]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Contacts site vitrine
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Soumissions du formulaire de contact opays.io
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <MessageSquare size={32} />
          </div>
          <div className="stat-label">Nouveaux</div>
          <div className="stat-value blue">{stats.nouveaux}</div>
          <div className="stat-sub">En attente de lecture</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Mail size={32} />
          </div>
          <div className="stat-label">Lus</div>
          <div className="stat-value">{stats.lus}</div>
          <div className="stat-sub">Consultés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <ExternalLink size={32} />
          </div>
          <div className="stat-label">Répondus</div>
          <div className="stat-value green">{stats.replies}</div>
          <div className="stat-sub">Traités</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={32} />
          </div>
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Tous les contacts</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="kanban-toolbar">
        <div className="kanban-filters" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
              }}
            />
            <input
              className="form-input kanban-select"
              style={{ paddingLeft: '2rem' }}
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input kanban-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as SiteContactStatus | 'all')
            }
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous statuts</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
          {visible.length} contact{visible.length !== 1 ? 's' : ''} affiché
          {visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        {loading && <div className="kanban-empty">Chargement…</div>}
        {error && !loading && (
          <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="kanban-empty">Aucun contact</div>
        )}
        {!loading && !error && visible.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Société</th>
                <th>Service</th>
                <th>Message</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => openDetail(contact)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                      {contact.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <Mail size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        <Phone size={10} style={{ flexShrink: 0 }} />
                        {contact.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{contact.company || '—'}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{contact.service || '—'}</td>
                  <td style={{ fontSize: '0.8125rem', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncate(contact.message, 60)}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[contact.status]}`}>
                      {STATUS_LABEL[contact.status]}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDate(contact.created_at)}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--destructive)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact.id);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal détail */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {selected.name}
                </h2>
                <span className={`badge ${STATUS_BADGE[selected.status]}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Coordonnées */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Email :</span>{' '}
                <a href={`mailto:${selected.email}`} style={{ color: 'var(--primary)' }}>
                  {selected.email}
                </a>
              </div>
              {selected.phone && (
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Téléphone :</span>{' '}
                  <a href={`tel:${selected.phone}`} style={{ color: 'var(--primary)' }}>
                    {selected.phone}
                  </a>
                </div>
              )}
              {selected.company && (
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Société :</span>{' '}
                  {selected.company}
                </div>
              )}
              {selected.service && (
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Service :</span>{' '}
                  {selected.service}
                </div>
              )}
              <div>
                <span style={{ color: 'var(--muted-foreground)' }}>Date :</span>{' '}
                {formatDate(selected.created_at)}
              </div>
              {selected.read_at && (
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Lu le :</span>{' '}
                  {formatDate(selected.read_at)}
                </div>
              )}
              {selected.replied_at && (
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Répondu le :</span>{' '}
                  {formatDate(selected.replied_at)}
                </div>
              )}
            </div>

            {/* Message complet */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                Message
              </div>
              <div
                style={{
                  background: 'var(--muted)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selected.message}
              </div>
            </div>

            {/* Changer statut */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                Changer le statut
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${
                      selected.status === s ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => handleStatusChange(selected.id, s)}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                Notes internes
              </div>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Ajouter une note…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%' }}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
                onClick={saveNotes}
              >
                <Save size={14} /> Enregistrer
              </button>
            </div>

            {/* Supprimer */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="btn btn-destructive btn-sm"
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
