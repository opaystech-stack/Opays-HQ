import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Phone, User } from 'lucide-react';
import type { Lead, LeadStatus, TaskPriority } from '@/types/database';

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  audit: 'Audit',
  proposal: 'Proposition',
  won: 'Gagné',
  lost: 'Perdu',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#94a3b8',
  contacted: '#3b62d4',
  audit: '#f59e0b',
  proposal: '#8b5cf6',
  won: '#22c55e',
  lost: '#ef4444',
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

const STATUSES: LeadStatus[] = ['new', 'contacted', 'audit', 'proposal', 'won', 'lost'];

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

interface KanbanCardProps {
  lead: Lead;
  isDragging?: boolean;
}

function KanbanCard({ lead, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
        <GripVertical
          size={14}
          style={{
            color: 'var(--muted-foreground)',
            opacity: 0.4,
            marginTop: '0.125rem',
            flexShrink: 0,
            cursor: 'grab',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kanban-card-title">{lead.company_name}</div>
          {lead.contact_name && (
            <div className="kanban-card-contact">
              <User size={11} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
              {lead.contact_name}
            </div>
          )}
          {lead.email && (
            <div className="kanban-card-email">
              <Mail size={10} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
              {lead.email}
            </div>
          )}
        </div>
      </div>

      <div className="kanban-card-meta" style={{ marginTop: '0.5rem' }}>
        {lead.estimated_value != null && lead.estimated_value > 0 && (
          <span className="kanban-card-value">{fmt(lead.estimated_value)} $</span>
        )}
        <span className={`kanban-card-priority ${PRIORITY_CLASS[lead.priority] || 'priority-medium'}`}>
          {PRIORITY_LABEL[lead.priority] || 'Moyenne'}
        </span>
      </div>

      <div className="kanban-card-footer">
        <span className="kanban-card-assignee">
          {lead.assignee_name || 'Non assigné'}
        </span>
        {lead.phone && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
            <Phone size={10} style={{ display: 'inline', marginRight: '0.125rem', verticalAlign: 'middle' }} />
            {lead.phone}
          </span>
        )}
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
}

function KanbanColumn({ status, leads, onDrop }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      const leadId = e.dataTransfer.getData('text/plain');
      if (leadId) onDrop(leadId, status);
    },
    [status, onDrop],
  );

  return (
    <div
      className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: STATUS_COLORS[status],
              display: 'inline-block',
            }}
          />
          {STATUS_LABEL[status]}
        </span>
        <span className="kanban-column-count">{leads.length}</span>
      </div>
      <div className="kanban-column-body">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="kanban-empty" style={{ padding: '1rem 0' }}>
            Aucun lead
          </div>
        )}
      </div>
    </div>
  );
}

interface LeadKanbanProps {
  leads: Lead[];
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

export default function LeadKanban({ leads, onStatusChange }: LeadKanbanProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const columns = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const s of STATUSES) map.set(s, []);
    for (const lead of leads) {
      const col = map.get(lead.status);
      if (col) col.push(lead);
    }
    return map;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    const lead = leads.find((l) => l.id === id);
    if (lead) setActiveLead(lead);
  }, [leads]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveLead(null);
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      // Determine target status from the column the card was dropped on
      let targetStatus: LeadStatus | null = null;

      // Check if dropped over a column (the droppable is the column container)
      if (STATUSES.includes(over.id as LeadStatus)) {
        targetStatus = over.id as LeadStatus;
      } else {
        // Dropped over another card — find that card's status
        const overLead = leads.find((l) => l.id === over.id);
        if (overLead) targetStatus = overLead.status;
      }

      if (targetStatus && targetStatus !== lead.status) {
        onStatusChange(lead, targetStatus);
      }
    },
    [leads, onStatusChange],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={columns.get(status) || []}
            onDrop={(leadId, newStatus) => {
              const lead = leads.find((l) => l.id === leadId);
              if (lead) onStatusChange(lead, newStatus);
            }}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div style={{ opacity: 0.85, transform: 'rotate(3deg)' }}>
            <KanbanCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
