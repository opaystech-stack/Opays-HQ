import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, MapPin, Clock, ChevronLeft, ChevronRight,
  CalendarDays, Calendar, List, X, FileText,
} from 'lucide-react';
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
  created_by?: string | null;
  created_at?: string | null;
}

type ViewMode = 'month' | 'week' | 'list';

type EventType = 'briefing' | 'commercial' | 'review' | 'meeting' | 'social' | 'default';

const EVENT_TYPES: { key: EventType; label: string }[] = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'review', label: 'Revue' },
  { key: 'meeting', label: 'Réunion' },
  { key: 'social', label: 'Social' },
  { key: 'default', label: 'Autre' },
];

const WRITE_ROLES = ['admin', 'ceo', 'coo', 'cto'];

const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKDAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function getEventType(title: string, description?: string | null): EventType {
  const t = (title + ' ' + (description ?? '')).toLowerCase();
  if (t.includes('briefing') || t.includes('standup') || t.includes('daily')) return 'briefing';
  if (t.includes('commercial') || t.includes('vente') || t.includes('client') || t.includes('deal')) return 'commercial';
  if (t.includes('review') || t.includes('revue') || t.includes('build') || t.includes('sprint')) return 'review';
  if (t.includes('meeting') || t.includes('réunion') || t.includes('sync') || t.includes('1:1')) return 'meeting';
  if (t.includes('social') || t.includes('afterwork') || t.includes('team') || t.includes('lunch')) return 'social';
  return 'default';
}

function getEventTypeClass(type: EventType): string {
  return `event-type-${type}`;
}

function getEventDotClass(type: EventType): string {
  return `event-dot-${type}`;
}

function getTypeBadgeClass(type: EventType): string {
  const map: Record<EventType, string> = {
    briefing: 'badge-blue',
    commercial: 'badge-green',
    review: 'badge-orange',
    meeting: 'badge-purple',
    social: 'badge-pink',
    default: 'badge-gray',
  };
  return map[type] || 'badge-gray';
}

function getTypeLabel(type: EventType): string {
  return EVENT_TYPES.find((t) => t.key === type)?.label ?? 'Autre';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getMonthName(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // Returns 0=Monday ... 6=Sunday
  const d = new Date(year, month, 1);
  return (d.getDay() + 6) % 7;
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function CalendarPage() {
  const { user } = useUser();
  const canWrite = !!user?.role_name && WRITE_ROLES.includes(user.role_name);

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('month');

  // Navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    return d;
  });

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<EventType>('default');

  // Detail popover
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

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

  // ─── Navigation ────────────────────────────────────────

  const goPrev = useCallback(() => {
    if (view === 'month') {
      if (currentMonth === 0) {
        setCurrentYear((y) => y - 1);
        setCurrentMonth(11);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else if (view === 'week') {
      setCurrentWeekStart((d) => {
        const prev = new Date(d);
        prev.setDate(prev.getDate() - 7);
        return prev;
      });
    }
  }, [view, currentMonth]);

  const goNext = useCallback(() => {
    if (view === 'month') {
      if (currentMonth === 11) {
        setCurrentYear((y) => y + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    } else if (view === 'week') {
      setCurrentWeekStart((d) => {
        const next = new Date(d);
        next.setDate(next.getDate() + 7);
        return next;
      });
    }
  }, [view, currentMonth]);

  const goToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    setCurrentWeekStart(monday);
  }, []);

  // ─── Create / Delete ───────────────────────────────────

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !start) return;

      const payload: Record<string, unknown> = {
        title: title.trim(),
        start_time: start,
        event_type: eventType,
      };
      if (description.trim()) payload.description = description.trim();
      if (end) payload.end_time = end;
      if (location.trim()) payload.location = location.trim();

      const { error } = await apiCreateEvent(payload);
      if (error) {
        toast.error('Création impossible', { description: error });
        return;
      }
      setTitle('');
      setDescription('');
      setStart('');
      setEnd('');
      setLocation('');
      setEventType('default');
      setFormOpen(false);
      toast.success('Événement ajouté');
      await load();
    },
    [title, description, start, end, location, eventType, load],
  );

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await apiDeleteEvent(id);
    if (error) {
      toast.error('Suppression impossible', { description: error });
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
    toast.success('Événement supprimé');
  }, []);

  // ─── Helpers ───────────────────────────────────────────

  const eventsForDay = useCallback(
    (year: number, month: number, day: number): CalEvent[] => {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return events.filter((ev) => ev.start_time.slice(0, 10) === key);
    },
    [events],
  );

  const eventsForDate = useCallback(
    (date: Date): CalEvent[] => {
      const key = date.toISOString().slice(0, 10);
      return events.filter((ev) => ev.start_time.slice(0, 10) === key);
    },
    [events],
  );

  const eventsForWeek = useCallback(
    (weekStart: Date): Map<string, CalEvent[]> => {
      const map = new Map<string, CalEvent[]>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        map.set(key, events.filter((ev) => ev.start_time.slice(0, 10) === key));
      }
      return map;
    },
    [events],
  );

  // ─── Navigation label ──────────────────────────────────

  const navLabel = useMemo(() => {
    if (view === 'month') {
      return getMonthName(currentYear, currentMonth);
    }
    if (view === 'week') {
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      const s = currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const e = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `Sem. ${getWeekNumber(currentWeekStart)} — ${s} - ${e}`;
    }
    return 'Tous les événements';
  }, [view, currentYear, currentMonth, currentWeekStart]);

  // ─── Render: Month View ────────────────────────────────

  function renderMonthView() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrev = getDaysInMonth(prevYear, prevMonth);

    const cells: React.ReactNode[] = [];

    // Empty cells for days before the 1st
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      cells.push(
        <div key={`prev-${day}`} className="calendar-day-cell other-month">
          <span className="calendar-day-number">{day}</span>
        </div>,
      );
    }

    // Actual month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = eventsForDay(currentYear, currentMonth, day);
      const todayClass = isToday(currentYear, currentMonth, day) ? 'today' : '';
      const maxVisible = 3;

      cells.push(
        <div key={`cur-${day}`} className={`calendar-day-cell ${todayClass}`}>
          <span className="calendar-day-number">{day}</span>
          {dayEvents.slice(0, maxVisible).map((ev) => {
            const type = getEventType(ev.title, ev.description);
            return (
              <div
                key={ev.id}
                className={`calendar-day-event ${getEventTypeClass(type)}`}
                onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                title={ev.title}
              >
                {formatTime(ev.start_time)} {ev.title}
              </div>
            );
          })}
          {dayEvents.length > maxVisible && (
            <span
              className="calendar-day-more"
              onClick={(e) => { e.stopPropagation(); setSelectedEvent(dayEvents[maxVisible]); }}
            >
              +{dayEvents.length - maxVisible} autres
            </span>
          )}
        </div>,
      );
    }

    // Fill remaining cells
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      cells.push(
        <div key={`next-${day}`} className="calendar-day-cell other-month">
          <span className="calendar-day-number">{day}</span>
        </div>,
      );
    }

    return (
      <div className="calendar-month-grid">
        {WEEKDAYS_SHORT.map((wd) => (
          <div key={wd} className="calendar-weekday-header">{wd}</div>
        ))}
        {cells}
      </div>
    );
  }

  // ─── Render: Week View ────────────────────────────────

  function renderWeekView() {
    const weekMap = eventsForWeek(currentWeekStart);
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h to 20h

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div>
        {/* Week day headers */}
        <div className="calendar-week-header-row">
          <div className="calendar-week-header-cell" style={{ background: 'var(--card)' }}></div>
          {weekDays.map((d, i) => {
            const isToday_ = isToday(d.getFullYear(), d.getMonth(), d.getDate());
            return (
              <div key={i} className={`calendar-week-header-cell ${isToday_ ? 'today' : ''}`}>
                {WEEKDAYS_SHORT[i]}
                <span className="day-num">{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="calendar-week-grid" style={{ borderTop: 'none', borderRadius: 0 }}>
          {hours.map((h) => (
            <div key={`time-${h}`} className="calendar-week-time">
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
          {weekDays.map((d, di) => {
            const key = d.toISOString().slice(0, 10);
            const dayEvents = weekMap.get(key) || [];
            const isToday_ = isToday(d.getFullYear(), d.getMonth(), d.getDate());

            return (
              <div key={`col-${di}`}>
                {hours.map((h) => {
                  const slotEvents = dayEvents.filter((ev) => {
                    const evHour = new Date(ev.start_time).getHours();
                    return evHour === h;
                  });
                  return (
                    <div
                      key={`${di}-${h}`}
                      className={`calendar-week-cell ${isToday_ ? 'today' : ''}`}
                    >
                      {slotEvents.map((ev) => {
                        const type = getEventType(ev.title, ev.description);
                        return (
                          <div
                            key={ev.id}
                            className={`calendar-day-event ${getEventTypeClass(type)}`}
                            onClick={() => setSelectedEvent(ev)}
                            title={ev.title}
                          >
                            {formatTime(ev.start_time)} {ev.title}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Render: List View ─────────────────────────────────

  function renderListView() {
    if (grouped.length === 0) {
      return <div className="card kanban-empty">Aucun événement planifié.</div>;
    }
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {grouped.map((day) => (
          <div key={day.date} className="card">
            <div className="card-header">
              <div className="card-title">{day.label}</div>
            </div>
            <div className="activity-list">
              {day.events.map((ev) => {
                const type = getEventType(ev.title, ev.description);
                return (
                  <div
                    key={ev.id}
                    className="activity-item"
                    style={{ alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setSelectedEvent(ev as CalEvent)}
                  >
                    <div
                      className={`badge ${getTypeBadgeClass(type)}`}
                      style={{ flexShrink: 0 }}
                    >
                      {getTypeLabel(type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text" style={{ fontWeight: 600 }}>{ev.title}</div>
                      <div className="activity-time">
                        {formatTime(ev.start_time)}
                        {ev.end_time && <> — {formatTime(ev.end_time)}</>}
                        {ev.location && <> · <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {ev.location}</>}
                      </div>
                    </div>
                    {canWrite && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render: Create Form ──────────────────────────────

  function renderCreateForm() {
    if (!canWrite) return null;
    if (!formOpen) {
      return (
        <div style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Nouvel événement
          </button>
        </div>
      );
    }

    return (
      <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleCreate}>
        <div className="card-header">
          <div className="card-title">Nouvel événement</div>
        </div>

        <div className="calendar-form-grid">
          <div className="calendar-form-full">
            <div className="form-group">
              <label className="form-label">Titre *</label>
              <input
                className="form-input"
                placeholder="Titre de l'événement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Début *</label>
            <input
              className="form-input"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fin</label>
            <input
              className="form-input"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lieu</label>
            <input
              className="form-input"
              placeholder="Salle, lien, adresse…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="calendar-form-full">
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Description ou ordre du jour…"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical', minHeight: '2.5rem' }}
              />
            </div>
          </div>

          <div className="calendar-form-full">
            <label className="form-label">Type d'événement</label>
            <div className="calendar-form-type-select">
              {EVENT_TYPES.map((t) => (
                <div
                  key={t.key}
                  className={`calendar-type-chip ${t.key} ${eventType === t.key ? 'selected' : ''}`}
                  onClick={() => setEventType(t.key)}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="calendar-form-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormOpen(false)}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim() || !start}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </form>
    );
  }

  // ─── Render: Event Detail Modal ────────────────────────

  function renderEventDetail() {
    if (!selectedEvent) return null;
    const ev = selectedEvent;
    const type = getEventType(ev.title, ev.description);

    return (
      <div className="calendar-event-detail" onClick={() => setSelectedEvent(null)}>
        <div className="calendar-event-detail-card" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h3>{ev.title}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEvent(null)}>
              <X size={16} />
            </button>
          </div>

          <div className={`badge ${getTypeBadgeClass(type)}`} style={{ marginBottom: '0.75rem' }}>
            {getTypeLabel(type)}
          </div>

          <div className="detail-row">
            <Clock size={14} />
            <span>
              {formatDate(ev.start_time)} · {formatTime(ev.start_time)}
              {ev.end_time && <> — {formatTime(ev.end_time)}</>}
            </span>
          </div>

          {ev.location && (
            <div className="detail-row">
              <MapPin size={14} />
              <span>{ev.location}</span>
            </div>
          )}

          {ev.description && (
            <div className="detail-row" style={{ alignItems: 'flex-start' }}>
              <FileText size={14} style={{ marginTop: '0.125rem' }} />
              <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{ev.description}</span>
            </div>
          )}

          {canWrite && (
            <div className="detail-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(ev.id)}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Calendrier d'équipe</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Briefings, points commerciaux et revues de build
        </p>
      </div>

      {/* Navigation + View Toggle */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button className="calendar-nav-btn" onClick={goPrev} title="Précédent">
            <ChevronLeft size={18} />
          </button>
          <span className="calendar-header-title">{navLabel}</span>
          <button className="calendar-nav-btn" onClick={goNext} title="Suivant">
            <ChevronRight size={18} />
          </button>
          <button className="btn btn-outline btn-sm" onClick={goToday}>
            Aujourd'hui
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="calendar-view-toggle">
            <button
              className={`calendar-view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
              title="Vue mois"
            >
              <CalendarDays size={14} /> Mois
            </button>
            <button
              className={`calendar-view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
              title="Vue semaine"
            >
              <Calendar size={14} /> Semaine
            </button>
            <button
              className={`calendar-view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="Vue liste"
            >
              <List size={14} /> Liste
            </button>
          </div>
        </div>
      </div>

      {/* Create form */}
      {renderCreateForm()}

      {/* Content */}
      {loading ? (
        <div className="card kanban-empty">Chargement…</div>
      ) : view === 'month' ? (
        renderMonthView()
      ) : view === 'week' ? (
        renderWeekView()
      ) : (
        renderListView()
      )}

      {/* Event detail modal */}
      {renderEventDetail()}
    </div>
  );
}
