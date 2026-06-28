import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { apiGetCalendar, apiCreateEvent, apiDeleteEvent } from '@/lib/api';
import { groupEventsByDay } from '@/lib/calendar';

export const Route = createFileRoute('/_app/app/calendar')({
  component: CalendarPage,
});

interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
}

const WRITE_ROLES = ['admin', 'ceo', 'coo', 'cto'];

function CalendarPage() {
  const { user } = useUser();
  const canWrite = !!user?.role_name && WRITE_ROLES.includes(user.role_name);

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [location, setLocation] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetCalendar();
    if (data?.events) setEvents(data.events as CalEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => groupEventsByDay(events), [events]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !start) return;
      const { error } = await apiCreateEvent({ title: title.trim(), start_time: start, location: location.trim() || undefined });
      if (error) {
        toast.error('Création impossible', { description: error });
        return;
      }
      setTitle('');
      setStart('');
      setLocation('');
      toast.success('Événement ajouté');
      await load();
    },
    [title, start, location, load],
  );

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await apiDeleteEvent(id);
    if (error) {
      toast.error('Suppression impossible', { description: error });
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Calendrier d'équipe</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Briefings, points commerciaux et revues de build
        </p>
      </div>

      {canWrite && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="form-input" style={{ flex: 2, minWidth: '12rem' }} placeholder="Titre de l'événement" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="form-input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            <input className="form-input" style={{ flex: 1, minWidth: '8rem' }} placeholder="Lieu" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim() || !start}>
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : grouped.length === 0 ? (
        <div className="card kanban-empty">Aucun événement planifié.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {grouped.map((day) => (
            <div key={day.date} className="card">
              <div className="card-header"><div className="card-title">{day.label}</div></div>
              <div className="activity-list">
                {day.events.map((ev) => (
                  <div key={ev.id} className="activity-item" style={{ alignItems: 'center' }}>
                    <div className="activity-content">
                      <div className="activity-text" style={{ fontWeight: 600 }}>{ev.title}</div>
                      <div className="activity-time">
                        {new Date(ev.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {ev.location && (<> · <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {ev.location}</>)}
                      </div>
                    </div>
                    {canWrite && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(ev.id)} aria-label="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
