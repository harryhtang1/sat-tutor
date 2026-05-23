"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const CELL = 7;
const GAP = 2;
// Month label row height: 8px font + GAP below = 10px
const MONTH_ROW_H = 8 + GAP;

interface DayEntry {
  dateStr: string | null; // null = invisible padding (pre-Jan or post-Dec overflow)
  count: number;
  isFuture: boolean;
}

function cellBg(count: number, isFuture: boolean): string {
  if (isFuture) return "bg-gray-100";
  if (count === 0) return "bg-gray-100";
  if (count <= 5) return "bg-green-200";
  if (count <= 15) return "bg-green-400";
  return "bg-green-600";
}

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function Heatmap() {
  const { userId, isLoaded } = useAuth();
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    async function load() {
      const year = new Date().getFullYear();
      const { data } = await supabase
        .from("daily_completions")
        .select("completed_date, questions_answered")
        .eq("user_id", userId)
        .gte("completed_date", `${year}-01-01`);

      const map: Record<string, number> = {};
      for (const row of data ?? []) {
        map[row.completed_date] = (map[row.completed_date] ?? 0) + row.questions_answered;
      }
      setActivityMap(map);
      setReady(true);
    }

    load();
  }, [isLoaded, userId]);

  const now = new Date();
  const year = now.getFullYear();
  const todayStr = toLocalDateStr(now);

  // Grid starts on the Sunday of the week containing Jan 1
  const jan1 = new Date(year, 0, 1);
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const dec31 = new Date(year, 11, 31);

  // Build flat list: gridStart → Dec 31
  const allDays: DayEntry[] = [];
  const cur = new Date(gridStart);
  while (cur <= dec31) {
    if (cur.getFullYear() !== year) {
      // Dec days from the previous year: transparent placeholder
      allDays.push({ dateStr: null, count: 0, isFuture: false });
    } else {
      const dateStr = toLocalDateStr(cur);
      allDays.push({
        dateStr,
        count: activityMap[dateStr] ?? 0,
        isFuture: dateStr > todayStr,
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  // Pad last partial week so columns are even
  while (allDays.length % 7 !== 0) {
    allDays.push({ dateStr: null, count: 0, isFuture: false });
  }

  // Chunk into columns of 7 (Sun → Sat)
  const weeks: DayEntry[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Month labels: keyed by the first column where a new in-year month begins.
  // Use the first non-null day of the column so pre-Jan padding never triggers "Dec".
  const monthLabels: Record<number, string> = {};
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const first = week.find((d) => d.dateStr !== null);
    if (first?.dateStr) {
      const month = new Date(first.dateStr + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        monthLabels[col] = MONTHS[month];
        lastMonth = month;
      }
    }
  });

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Activity
      </p>

      {!ready ? (
        <div className="h-14 animate-pulse rounded-lg bg-gray-50" />
      ) : (
        <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>

          {/* Day-of-week labels */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              paddingTop: MONTH_ROW_H,
              flexShrink: 0,
              width: 22,
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  height: CELL,
                  lineHeight: `${CELL}px`,
                  fontSize: 8,
                  color: "#9ca3af",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", flexDirection: "column" }}>

            {/* Month labels row */}
            <div style={{ display: "flex", gap: GAP, marginBottom: GAP }}>
              {weeks.map((_, col) => (
                <div
                  key={col}
                  style={{
                    width: CELL,
                    flexShrink: 0,
                    fontSize: 8,
                    lineHeight: "8px",
                    color: "#9ca3af",
                    overflow: "visible",
                    whiteSpace: "nowrap",
                  }}
                >
                  {monthLabels[col] ?? ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, col) => (
                <div key={col} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {week.map((day, row) => {
                    if (!day.dateStr) {
                      return (
                        <div key={row} style={{ width: CELL, height: CELL, flexShrink: 0 }} />
                      );
                    }
                    const isToday = day.dateStr === todayStr;
                    return (
                      <div
                        key={row}
                        title={day.isFuture ? `${day.dateStr}: No activity yet` : `${day.dateStr}: ${day.count} question${day.count !== 1 ? "s" : ""}`}
                        className={cellBg(day.count, day.isFuture)}
                        style={{
                          width: CELL,
                          height: CELL,
                          flexShrink: 0,
                          borderRadius: 1,
                          ...(isToday && {
                            outline: "1px solid #3b82f6",
                            outlineOffset: 1,
                          }),
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 3,
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 8, color: "#9ca3af" }}>Less</span>
              {[0, 3, 8, 20].map((n) => (
                <div
                  key={n}
                  className={cellBg(n, false)}
                  style={{ width: CELL, height: CELL, borderRadius: 1, flexShrink: 0 }}
                />
              ))}
              <span style={{ fontSize: 8, color: "#9ca3af" }}>More</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
