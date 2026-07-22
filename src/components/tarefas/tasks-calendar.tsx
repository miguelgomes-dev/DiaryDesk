"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Card } from "@/components/ui/card";
import {
  TaskDialog,
  type Task,
  type TaskCategory,
  type TaskDialogTarget,
} from "@/components/tarefas/task-dialog";
import { OccurrenceDialog } from "@/components/tarefas/occurrence-dialog";
import {
  getTaskOccurrences,
  type TaskOccurrence,
} from "@/app/actions/task-occurrences";

export type OtherCalendarEvent = {
  source_id: string;
  title: string;
  start_at: string;
  all_day: boolean;
  source_type: "faculdade" | "trabalho";
};

const OCCURRENCE_ID_PREFIX = "occ:";

function occurrenceId(taskId: string, occurrenceDate: string) {
  return `${OCCURRENCE_ID_PREFIX}${taskId}:${occurrenceDate}`;
}

export function TasksCalendar({
  singleTasks,
  recurringTasks,
  otherEvents,
  categories,
}: {
  singleTasks: Task[];
  recurringTasks: Task[];
  otherEvents: OtherCalendarEvent[];
  categories: TaskCategory[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<TaskDialogTarget | null>(null);

  const occurrenceDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<TaskOccurrence | null>(
    null,
  );

  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([]);
  const visibleRangeRef = useRef<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setTarget(null);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    const dialog = occurrenceDialogRef.current;
    if (!dialog) return;
    const handleClose = () => setSelectedOccurrence(null);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const recurringTaskById = useMemo(
    () => new Map(recurringTasks.map((task) => [task.id, task])),
    [recurringTasks],
  );

  const singleTaskEvents = useMemo(
    () =>
      singleTasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.start_at,
        allDay: task.all_day,
        backgroundColor: task.category_id
          ? categoryById.get(task.category_id)?.color
          : undefined,
        borderColor: task.category_id
          ? categoryById.get(task.category_id)?.color
          : undefined,
        classNames: task.completed_at ? ["opacity-50", "line-through"] : [],
      })),
    [singleTasks, categoryById],
  );

  const occurrenceEvents = useMemo(
    () =>
      occurrences.map((occurrence) => {
        const task = recurringTaskById.get(occurrence.taskId);
        const color = task?.category_id
          ? categoryById.get(task.category_id)?.color
          : undefined;
        return {
          id: occurrenceId(occurrence.taskId, occurrence.occurrenceDate),
          title: occurrence.title,
          start: occurrence.occurrenceDate,
          allDay: true,
          backgroundColor: color,
          borderColor: color,
          classNames:
            occurrence.status === "done"
              ? ["opacity-50", "line-through"]
              : occurrence.status === "skipped"
                ? ["italic", "opacity-60"]
                : [],
        };
      }),
    [occurrences, recurringTaskById, categoryById],
  );

  const otherCalendarEvents = useMemo(
    () =>
      otherEvents.map((event) => ({
        id: `other:${event.source_id}`,
        title: event.title,
        start: event.start_at,
        allDay: event.all_day,
        classNames: ["opacity-70"],
      })),
    [otherEvents],
  );

  const events = useMemo(
    () => [...singleTaskEvents, ...occurrenceEvents, ...otherCalendarEvents],
    [singleTaskEvents, occurrenceEvents, otherCalendarEvents],
  );

  function openCreate(dateStr: string) {
    setTarget({ mode: "create", date: dateStr });
    dialogRef.current?.showModal();
  }

  function openEdit(task: Task) {
    setTarget({ mode: "edit", task });
    dialogRef.current?.showModal();
  }

  function openOccurrence(occurrence: TaskOccurrence) {
    setSelectedOccurrence(occurrence);
    occurrenceDialogRef.current?.showModal();
  }

  function handleEventClick(info: EventClickArg) {
    const id = info.event.id;

    if (id.startsWith(OCCURRENCE_ID_PREFIX)) {
      const [taskId, occurrenceDate] = id.slice(OCCURRENCE_ID_PREFIX.length).split(":");
      const occurrence = occurrences.find(
        (item) => item.taskId === taskId && item.occurrenceDate === occurrenceDate,
      );
      if (occurrence) openOccurrence(occurrence);
      return;
    }

    if (id.startsWith("other:")) {
      return;
    }

    const task =
      singleTasks.find((item) => item.id === id) ?? recurringTaskById.get(id);
    if (task) openEdit(task);
  }

  async function handleDatesSet(info: DatesSetArg) {
    const rangeStart = info.startStr.slice(0, 10);
    const rangeEnd = info.endStr.slice(0, 10);
    visibleRangeRef.current = { start: rangeStart, end: rangeEnd };
    const data = await getTaskOccurrences(rangeStart, rangeEnd);
    setOccurrences(data);
  }

  useEffect(() => {
    const range = visibleRangeRef.current;
    if (!range) return;
    getTaskOccurrences(range.start, range.end).then(setOccurrences);
    // recurringTasks changes after create/edit/delete (revalidatePath) — refetch
    // occurrences for the range already on screen, since FullCalendar's own
    // datesSet only fires when the visible range itself changes, not on props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringTasks]);

  return (
    <Card className="fc-theme">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[ptBrLocale]}
        locale="pt-br"
        height="auto"
        events={events}
        dateClick={(info: DateClickArg) => openCreate(info.dateStr)}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />
      <TaskDialog
        ref={dialogRef}
        target={target}
        categories={categories}
        onClose={() => {
          dialogRef.current?.close();
          setTarget(null);
        }}
      />
      <OccurrenceDialog
        ref={occurrenceDialogRef}
        occurrence={selectedOccurrence}
        onClose={() => {
          occurrenceDialogRef.current?.close();
          setSelectedOccurrence(null);
        }}
        onEditSeries={() => {
          const task = selectedOccurrence
            ? recurringTaskById.get(selectedOccurrence.taskId)
            : null;
          occurrenceDialogRef.current?.close();
          setSelectedOccurrence(null);
          if (task) openEdit(task);
        }}
      />
    </Card>
  );
}
