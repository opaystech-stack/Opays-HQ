"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Briefcase, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type CalendarEvent = {
  id: string;
  title: string;
  due_date: string;
  type: 'task' | 'project';
  status: string;
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchEvents = async () => {
      const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${getDaysInMonth(currentYear, currentMonth)}`;

      const [{ data: tasks }, { data: projects }] = await Promise.all([
        supabase.from('tasks').select('id, title, due_date, status').gte('due_date', startDate).lte('due_date', endDate),
        supabase.from('projects').select('id, title, due_date, status').gte('due_date', startDate).lte('due_date', endDate),
      ]);

      const mapped: CalendarEvent[] = [
        ...(tasks || []).map((t: any) => ({ ...t, type: 'task' as const })),
        ...(projects || []).map((p: any) => ({ ...p, type: 'project' as const })),
      ];
      setEvents(mapped);
    };
    fetchEvents();
  }, [currentMonth, currentYear, supabase]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === currentMonth && now.getFullYear() === currentYear;

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.due_date === dateStr);
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDay(null);
  };

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600">
              <CalendarIcon size={12} /> Calendrier
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Calendrier d'équipe</h1>
            <p className="max-w-xl text-sm text-slate-500 font-medium">Visualisez les échéances des tâches et projets de l'équipe.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[180px] text-center text-lg font-bold text-slate-900">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* Calendar grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = isCurrentMonth && day === today;
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                        : isToday
                          ? 'border-cyan-100 bg-cyan-50 text-cyan-600'
                          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div key={idx} className={`h-1.5 w-1.5 rounded-full ${e.type === 'task' ? (isSelected ? 'bg-white' : 'bg-emerald-500') : (isSelected ? 'bg-white' : 'bg-violet-500')}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500" /> Tâches
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="h-2 w-2 rounded-full bg-violet-500" /> Projets
              </div>
            </div>
          </div>

          {/* Day detail */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                {selectedDay
                  ? `${selectedDay} ${MONTHS[currentMonth]}`
                  : 'Sélectionnez un jour'}
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                {selectedDayEvents.length} échéance{selectedDayEvents.length !== 1 ? 's' : ''}
              </p>

              <div className="mt-4 space-y-3">
                {selectedDayEvents.length === 0 && (
                  <p className="py-8 text-center text-sm italic text-slate-400 font-medium">Aucune échéance ce jour.</p>
                )}
                {selectedDayEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-white hover:border-slate-200 transition-all">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      event.type === 'task' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {event.type === 'task' ? <CheckCircle2 size={16} /> : <Briefcase size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{event.title}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{event.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-600" />
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Astuce</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-cyan-800 font-medium">
                Ajoutez une date d'échéance à vos tâches et projets pour les voir apparaître ici automatiquement.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
