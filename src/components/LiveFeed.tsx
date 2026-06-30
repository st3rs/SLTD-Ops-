import React from "react";
import { BorderLog } from "../types";
import { ShieldCheck, ShieldAlert, Clock, Radio } from "lucide-react";

interface LiveFeedProps {
  logs: BorderLog[];
}

export default function LiveFeed({ logs }: LiveFeedProps) {
  // Take the most recent 5 logs to display in the live feed strip
  const displayLogs = logs.slice(0, 5);

  return (
    <div className="bg-[#f0f3f6] p-4 md:h-[190px] h-auto flex flex-col justify-between gap-3">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-[#3595db] animate-pulse" />
          <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-wide">
            REAL-TIME PASSENGER IMMIGRATION ACCESS LOGS
          </span>
        </div>
        <span className="text-[9px] font-sans font-bold text-slate-400 animate-pulse uppercase hidden sm:inline">
          SECURE SEED STREAM ACTIVE
        </span>
      </div>

      {/* Logs Table-like Container */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-[100px] max-h-[300px] md:max-h-[140px]">
        {displayLogs.length > 0 ? (
          displayLogs.map((log) => (
            <div
              key={log.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-sm border text-[10.5px] gap-2 transition-all duration-300 font-sans ${
                log.status === "PASSED"
                  ? "bg-white border-[#e2e5e9] text-slate-600"
                  : log.status === "FLAGGED"
                  ? "bg-amber-50 border-amber-200 text-amber-800 animate-pulse"
                  : "bg-rose-50 border-rose-200 text-rose-800 font-bold"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5 font-mono shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {log.timestamp}
                </span>
                <span className="text-[9px] bg-slate-100 border border-[#d2e2f0] px-1.5 py-0.5 rounded-sm text-sky-800 font-bold font-mono shrink-0">
                  {log.location}
                </span>
                <span className="font-sans font-bold text-slate-800">
                  {log.passengerName} <span className="font-normal text-slate-400">({log.nationality})</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100">
                <span className="text-[9.5px] text-slate-400 italic max-w-[150px] truncate text-left sm:text-right">
                  {log.actionTaken}
                </span>
                <span className={`flex items-center gap-0.5 text-[9.5px] px-2 py-0.5 rounded-sm uppercase font-bold border shrink-0 ${
                  log.status === "PASSED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : log.status === "FLAGGED"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  {log.status === "PASSED" ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" />
                  )}
                  {log.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs font-sans text-slate-400">
            No live access logs streamed.
          </div>
        )}
      </div>
      
    </div>
  );
}
