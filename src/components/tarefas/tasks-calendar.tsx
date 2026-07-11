"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Card } from "@/components/ui/card";
import {
  TaskDialog,
  type Task,
  type TaskCategory,
  type TaskDialogTarget,
} from "@/components/tarefas/task-dialog";

export function TasksCalendar({
  tasks,
  categories,
}: {
  tasks: Task[];
  categories: TaskCategory[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<TaskDialogTarget | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setTarget(null);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const events = useMemo(
    () =>
      tasks.map((task) => ({
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
    [tasks, categoryById],
  );

  function openCreate(dateStr: string) {
    setTarget({ mode: "create", date: dateStr });
    dialogRef.current?.showModal();
  }

  function openEdit(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setTarget({ mode: "edit", task });
    dialogRef.current?.showModal();
  }

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
        eventClick={(info: EventClickArg) => openEdit(info.event.id)}
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
    </Card>
  );
}
