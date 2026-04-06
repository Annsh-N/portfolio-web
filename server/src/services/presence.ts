import type { PresencePayload, PresenceScheduleEntry, PresenceSnapshot, PresenceStatus } from "../../../shared/types.js";

const TIME_ZONE = "America/Indiana/Indianapolis";

type DailyPresenceBlock = {
  start: string;
  end: string;
  status: PresenceStatus;
};

const statusCopy: Record<
  PresenceStatus,
  {
    label: string;
    note: string;
  }
> = {
  sleeping: {
    label: "Sleeping",
    note: "Most likely away from the keyboard and charging back up for the next build sprint.",
  },
  in_class: {
    label: "In class",
    note: "Probably in lecture mode at Purdue, trading commits for notes and problem sets.",
  },
  coding_away: {
    label: "Coding away",
    note: "At the desk building, debugging, or polishing some backend-heavy system.",
  },
  gym: {
    label: "Gym",
    note: "Away from the desk for a lift before getting back to the terminal.",
  },
};

const dailySchedule: Record<number, DailyPresenceBlock[]> = {
  0: [
    { start: "00:00", end: "09:30", status: "sleeping" },
    { start: "09:30", end: "13:00", status: "coding_away" },
    { start: "13:00", end: "14:30", status: "gym" },
    { start: "14:30", end: "23:30", status: "coding_away" },
    { start: "23:30", end: "24:00", status: "sleeping" },
  ],
  1: [
    { start: "00:00", end: "07:30", status: "sleeping" },
    { start: "07:30", end: "08:30", status: "coding_away" },
    { start: "08:30", end: "11:20", status: "in_class" },
    { start: "11:20", end: "18:10", status: "coding_away" },
    { start: "18:10", end: "19:30", status: "gym" },
    { start: "19:30", end: "23:30", status: "coding_away" },
    { start: "23:30", end: "24:00", status: "sleeping" },
  ],
  2: [
    { start: "00:00", end: "07:45", status: "sleeping" },
    { start: "07:45", end: "09:30", status: "coding_away" },
    { start: "09:30", end: "12:20", status: "in_class" },
    { start: "12:20", end: "18:15", status: "coding_away" },
    { start: "18:15", end: "19:30", status: "gym" },
    { start: "19:30", end: "23:30", status: "coding_away" },
    { start: "23:30", end: "24:00", status: "sleeping" },
  ],
  3: [
    { start: "00:00", end: "07:30", status: "sleeping" },
    { start: "07:30", end: "10:00", status: "coding_away" },
    { start: "10:00", end: "12:00", status: "in_class" },
    { start: "12:00", end: "18:00", status: "coding_away" },
    { start: "18:00", end: "19:15", status: "gym" },
    { start: "19:15", end: "23:30", status: "coding_away" },
    { start: "23:30", end: "24:00", status: "sleeping" },
  ],
  4: [
    { start: "00:00", end: "07:45", status: "sleeping" },
    { start: "07:45", end: "09:30", status: "coding_away" },
    { start: "09:30", end: "12:20", status: "in_class" },
    { start: "12:20", end: "18:15", status: "coding_away" },
    { start: "18:15", end: "19:30", status: "gym" },
    { start: "19:30", end: "23:30", status: "coding_away" },
    { start: "23:30", end: "24:00", status: "sleeping" },
  ],
  5: [
    { start: "00:00", end: "08:00", status: "sleeping" },
    { start: "08:00", end: "10:30", status: "coding_away" },
    { start: "10:30", end: "12:20", status: "in_class" },
    { start: "12:20", end: "17:30", status: "coding_away" },
    { start: "17:30", end: "18:45", status: "gym" },
    { start: "18:45", end: "23:45", status: "coding_away" },
    { start: "23:45", end: "24:00", status: "sleeping" },
  ],
  6: [
    { start: "00:00", end: "09:00", status: "sleeping" },
    { start: "09:00", end: "12:30", status: "coding_away" },
    { start: "12:30", end: "14:00", status: "gym" },
    { start: "14:00", end: "23:45", status: "coding_away" },
    { start: "23:45", end: "24:00", status: "sleeping" },
  ],
};

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatLocalClock(value: string): string {
  const [rawHours, rawMinutes] = value.split(":").map(Number);
  const minutes = Number.isNaN(rawMinutes) ? 0 : rawMinutes;
  const normalizedHours = rawHours % 24;
  const suffix = normalizedHours >= 12 ? "PM" : "AM";
  const hours = normalizedHours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getLocalParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);

  return {
    weekdayIndex: weekdayIndex >= 0 ? weekdayIndex : 0,
    minutes: hour * 60 + minute,
  };
}

function getCurrentTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getCurrentBlock(date: Date) {
  const { weekdayIndex, minutes } = getLocalParts(date);
  const schedule = dailySchedule[weekdayIndex] ?? dailySchedule[0];
  const block =
    schedule.find((entry) => {
      const start = parseMinutes(entry.start);
      const end = parseMinutes(entry.end);
      return minutes >= start && minutes < end;
    }) ?? schedule[0];

  return {
    weekdayIndex,
    block,
    schedule,
  };
}

function getNextChangeLabel(date: Date): string {
  const { weekdayIndex, block, schedule } = getCurrentBlock(date);
  const currentIndex = schedule.indexOf(block);
  const nextIndex = currentIndex + 1;

  if (nextIndex < schedule.length) {
    const nextBlock = schedule[nextIndex];
    return `Next: ${statusCopy[nextBlock.status].label} at ${formatLocalClock(nextBlock.start)}`;
  }

  const nextDayIndex = (weekdayIndex + 1) % 7;
  const nextDayBlock = dailySchedule[nextDayIndex][0];
  return `Next: ${statusCopy[nextDayBlock.status].label} ${weekdayIndex === 6 ? "tomorrow" : weekdayNames[nextDayIndex]} at ${formatLocalClock(nextDayBlock.start)}`;
}

export function getPresenceSnapshot(date = new Date()): PresenceSnapshot {
  const { block } = getCurrentBlock(date);

  return {
    status: block.status,
    label: statusCopy[block.status].label,
    note: statusCopy[block.status].note,
    currentTimeLabel: getCurrentTimeLabel(date),
    nextChangeLabel: getNextChangeLabel(date),
    timezone: TIME_ZONE,
    updatedAt: date.toISOString(),
  };
}

function getPresenceSchedule(): PresenceScheduleEntry[] {
  return weekdayNames.flatMap((weekday, weekdayIndex) =>
    (dailySchedule[weekdayIndex] ?? []).map((block) => ({
      weekday,
      start: block.start,
      end: block.end,
      status: block.status,
      label: statusCopy[block.status].label,
      note: statusCopy[block.status].note,
    })),
  );
}

export function getPresencePayload(date = new Date()): PresencePayload {
  return {
    current: getPresenceSnapshot(date),
    schedule: getPresenceSchedule(),
  };
}
