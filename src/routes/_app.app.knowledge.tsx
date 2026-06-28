import { createFileRoute } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';

export const Route = createFileRoute('/_app/app/knowledge')({
  component: KnowledgePage,
});

function KnowledgePage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Base de connaissances</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Articles et documentation par rôle
        </p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <BookOpen size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3, color: 'var(--muted-foreground)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
          Module Knowledge — à venir (Phase 3)
        </p>
      </div>
    </div>
  );
}
