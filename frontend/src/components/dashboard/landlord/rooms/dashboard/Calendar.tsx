"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import EditIcon from "../../../../../assets/icons/edit.svg"
import Button from "../../../../Button";

type DateVal = { year: number; month: number; day: number } | null;

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const toJS = (v: DateVal) => (v ? new Date(v.year, v.month, v.day) : null);

const same = (a: DateVal, b: DateVal) =>
  !!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function fmt(v: DateVal) {
  if (!v) return "";
  return new Date(v.year, v.month, v.day).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function MiniCalendar({
  start,
  end,
  onStartChange,
  onEndChange,
  selecting,
  setSelecting,
}: any) {
  const today = new Date();

  const MIN_YEAR = today.getFullYear();
  const MIN_MONTH = 0;

  const [viewYear, setViewYear] = useState(
    start?.year ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    start?.month ?? today.getMonth()
  );

  const [hovering, setHovering] = useState<DateVal>(null);

  const prevMonth = () => {
    if (viewYear === MIN_YEAR && viewMonth === MIN_MONTH) return;

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y: number) => y - 1);
    } else {
      setViewMonth((m: number) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y: number) => y + 1);
    } else {
      setViewMonth((m: number) => m + 1);
    }
  };

  const handleClick = (day: number) => {
    const clicked = { year: viewYear, month: viewMonth, day };

    const clickedDate = new Date(viewYear, viewMonth, day);
    const minDate = new Date(MIN_YEAR, 0, 1);

    if (clickedDate < minDate) return;

    if (selecting === "start") {
      onStartChange(clicked);
      onEndChange(null);
      setSelecting("end");
    } else {
      const c = new Date(viewYear, viewMonth, day);
      const s = toJS(start);

      if (s && c < s) {
        onStartChange(clicked);
        onEndChange(null);
      } else {
        onEndChange(clicked);
        setSelecting("start");
      }
    }
  };

  const effectiveEnd =
    end ?? (selecting === "end" && hovering ? hovering : null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isPrevDisabled =
    viewYear === MIN_YEAR && viewMonth === MIN_MONTH;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center transition bg-[#f9fafb] text-[#6B0F2B] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="relative -top-[1px] font-bold text-sm leading-none">
            {"<"}
          </span>
        </button>

        <p className="text-sm font-bold text-gray-700 leading-none flex items-center">
          {MONTHS_FULL[viewMonth]} {viewYear}
        </p>

        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center transition bg-[#f9fafb] text-[#6B0F2B]"
        >
          <span className="relative -top-[1px] font-bold text-sm leading-none">
            {">"}
          </span>
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-300">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-8" />;

          const date = { year: viewYear, month: viewMonth, day };

          const isStart = same(start, date);
          const isEnd = same(effectiveEnd, date);

          const inRange =
            start &&
            effectiveEnd &&
            (() => {
              const t = new Date(viewYear, viewMonth, day).getTime();
              const s = toJS(start)!.getTime();
              const e = toJS(effectiveEnd)!.getTime();
              return t > Math.min(s, e) && t < Math.max(s, e);
            })();

          const disabled =
            selecting === "end" &&
            start &&
            new Date(viewYear, viewMonth, day) < toJS(start)!;

          return (
            <div
              key={i}
              className="relative flex items-center justify-center h-8"
              onMouseEnter={() => !disabled && setHovering(date)}
              onMouseLeave={() => setHovering(null)}
            >
              {inRange && (
                <div className="absolute inset-y-1 left-0 right-0 bg-[#6B0F2B]/10" />
              )}

              {isStart && effectiveEnd && !same(start, effectiveEnd) && (
                <div className="absolute inset-y-1 left-1/2 right-0 bg-[#6B0F2B]/10" />
              )}

              {isEnd && start && !same(start, effectiveEnd) && (
                <div className="absolute inset-y-1 left-0 right-1/2 bg-[#6B0F2B]/10" />
              )}

              <button
                disabled={!!disabled}
                onClick={() => handleClick(day)}
                className={[
                  "relative z-10 w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition",
                  isStart || isEnd
                    ? "bg-[#6B0F2B] text-white" : inRange
                    ? "text-[#6B0F2B]" : disabled
                    ? "text-gray-200 cursor-not-allowed" : "text-gray-600 hover:bg-[#6B0F2B]/10 hover:text-[#6B0F2B]",
                ].join(" ")}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ApplicationPeriod() {
  const [savedStart, setSavedStart] = useState<DateVal>(null);
  const [savedEnd, setSavedEnd] = useState<DateVal>(null);
  const [draftStart, setDraftStart] = useState<DateVal>(null);
  const [draftEnd, setDraftEnd] = useState<DateVal>(null);
  const [editing, setEditing] = useState(false);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setEditing(false);
    }
    if (editing) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [editing]);

  const openEdit = () => {
    setDraftStart(savedStart);
    setDraftEnd(savedEnd);
    setSelecting("start");
    setEditing(true);
  };

  const handleSave = () => {
    if (!draftStart || !draftEnd) return;
    setSavedStart(draftStart);
    setSavedEnd(draftEnd);
    setEditing(false);
  };

  const isSet = !!savedStart && !!savedEnd;
  const canSave = !!draftStart && !!draftEnd;

  const totalDays = isSet
    ? Math.round((toJS(savedEnd)!.getTime() - toJS(savedStart)!.getTime()) / 86400000) + 1
    : null;

  return (
    <div ref={ref} className="relative w-full">

      {/* ── Saved State Card ── */}
      {isSet ? (
        <div className="bg-[#6B0F2B] rounded-2xl overflow-hidden">
          {/* Top label row */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays size={13} className="text-white/60" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                Application Period
              </span>
            </div>
            <button
              onClick={openEdit}
              className="group flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-white transition"
            >
              <img src={EditIcon} alt="edit" className="w-3 h-3 brightness-0 invert opacity-70 group-hover:opacity-100 transition" />
              Edit
            </button>
          </div>

          {/* Date range display */}
          <div className="flex items-stretch gap-0 px-4 pb-3">
            {/* Start */}
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Start</p>
              <p className="text-[13px] font-bold text-white leading-tight">
                {MONTHS_SHORT[savedStart!.month]} {savedStart!.day}
              </p>
              <p className="text-[10px] text-white/50">{savedStart!.year}</p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center px-2">
              <ArrowRight size={14} className="text-white/40" />
            </div>

            {/* End */}
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">End</p>
              <p className="text-[13px] font-bold text-white leading-tight">
                {MONTHS_SHORT[savedEnd!.month]} {savedEnd!.day}
              </p>
              <p className="text-[10px] text-white/50">{savedEnd!.year}</p>
            </div>
          </div>

          {/* Duration bar */}
          <div className="bg-black/20 px-4 py-2 flex items-center justify-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <p className="text-[10px] font-bold text-white/70">
              {totalDays} days open for applications
            </p>
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>

      ) : (
        /* ── Unset State ── */
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-[#6B0F2B]" />
              <span className="text-[10px] text-[#9A7080] font-bold uppercase tracking-wider">
                Application Period
              </span>
            </div>
          </div>
          <button
            onClick={openEdit}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#6B0F2B]/40 hover:bg-[#6B0F2B]/3 transition"
          >
            <CalendarDays size={18} className="text-gray-300" />
            <span className="text-[11px] font-semibold text-gray-400">Set Application Period</span>
          </button>
        </div>
      )}

      {/* ── Popover Calendar ── */}
      {editing && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-3">
          {/* Arrow tip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />

          {/* Date pills */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Start Date", val: draftStart, key: "start" as const },
              { label: "End Date",   val: draftEnd,   key: "end"   as const },
            ].map(({ label, val, key }) => (
              <button
                key={key}
                onClick={() => setSelecting(key)}
                className={[
                  "p-2 rounded-xl text-left transition border-2",
                  selecting === key
                    ? "border-[#6B0F2B] bg-[#6B0F2B]/5"
                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                ].join(" ")}
              >
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={["text-[11px] font-bold", val ? "text-[#6B0F2B]" : "text-gray-300"].join(" ")}>
                  {val ? `${MONTHS_SHORT[val.month]} ${val.day}, ${val.year}` : "Select…"}
                </p>
              </button>
            ))}
          </div>

          {/* Calendar */}
          <MiniCalendar
            start={draftStart}
            end={draftEnd}
            onStartChange={setDraftStart}
            onEndChange={setDraftEnd}
            selecting={selecting}
            setSelecting={setSelecting}
          />

          {/* Actions */}
            <div className="flex gap-2 pt-1">
            <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setEditing(false)}
            >
                <X size={11} /> Cancel
            </Button>

            <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleSave}
                disabled={!canSave}
            >
                <Check size={11} /> Save Period
            </Button>
            </div>
        </div>
      )}
    </div>
  );
}