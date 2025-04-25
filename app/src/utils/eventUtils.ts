import { eventProps } from "../types";

export const normalizeEvents = (events: any[]): eventProps[] =>
  events.map((e) => ({
    month: e.month,
    date: e.date,
    miqaats: e.miqaats.map((m: any) => ({
      title: m.title,
      description: m.description,
      phase: m.phase as "day" | "night", 
      priority: m.priority,
      year: m.year,
    })),
  }));