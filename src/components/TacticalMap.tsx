import React, { useState } from "react";
import { Checkpoint } from "../types";
import { MapPin, ShieldAlert, Wifi, Eye, Radio, Server } from "lucide-react";

interface TacticalMapProps {
  checkpoints: Checkpoint[];
  selectedCheckpoint: Checkpoint | null;
  onSelectCheckpoint: (checkpoint: Checkpoint) => void;
}

export default function TacticalMap({
  checkpoints,
  selectedCheckpoint,
  onSelectCheckpoint,
}: TacticalMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative bg-[#f0f3f6] p-4 overflow-hidden h-[390px] flex flex-col justify-between">
      {/* HUD Headers */}
      <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2 z-10">
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#3595db] animate-pulse" />
          <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-wide">
            BORDER CONTROLS LIVE GEOGRAPHIC MATRIX
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9.5px] font-sans font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            BIOMETRICS ONLINE
          </span>
        </div>
      </div>

      {/* Grid overlay for a clean blueprint look */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(#3595db_1px,transparent_1px),linear-gradient(90deg,#3595db_1px,transparent_1px)]"
        style={{ backgroundSize: '16px 16px' }}
      />

      {/* Outer Glow Radar rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-sky-400/5 pointer-events-none animate-ping duration-10000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-sky-400/10 pointer-events-none" />

      {/* Main Interactive Map Stage */}
      <div className="relative flex-1 flex items-center justify-center min-h-[220px] my-2 bg-sky-50/50 border border-sky-200/40 rounded-sm">
        {/* SVG Tactical Drawing of Thailand outline */}
        <svg 
          viewBox="0 0 200 300" 
          className="w-[150px] h-[220px] text-sky-100 drop-shadow-[0_2px_8px_rgba(53,149,219,0.1)]"
        >
          {/* Simple premium abstract shape representing Thailand's geometry */}
          <path
            d="M 90 20 L 120 40 L 135 70 L 120 100 L 140 120 L 115 150 L 105 155 L 100 170 L 98 190 L 95 210 L 96 230 L 93 255 L 87 270 L 88 285 L 82 285 L 80 260 L 86 230 L 88 200 L 91 180 L 85 160 L 78 155 L 75 145 L 82 140 L 85 110 L 70 100 L 60 70 L 75 40 Z"
            fill="rgba(212, 230, 248, 0.4)"
            stroke="#3595db"
            strokeWidth="1.25"
            strokeDasharray="2 1"
          />
          {/* Connecting border lines */}
          <path
            d="M 60 70 L 45 80 M 135 70 L 150 75 M 115 150 L 125 165 M 82 285 L 72 295"
            stroke="rgba(224, 67, 67, 0.2)"
            strokeWidth="1"
          />
        </svg>

        {/* Checkpoint Pins */}
        {checkpoints.map((checkpoint) => {
          const isSelected = selectedCheckpoint?.id === checkpoint.id;
          const isHovered = hoveredId === checkpoint.id;
          
          let colorClass = "text-sky-600 border-sky-500 bg-sky-100";
          let bgGlow = "bg-sky-400/20";
          let pinStyle = "linear-gradient(to bottom, #ebf3fd 0%, #daebfc 100%)";
          
          if (checkpoint.status === "ALERT") {
            colorClass = "text-amber-700 border-amber-500 bg-amber-50";
            bgGlow = "bg-amber-400/30 animate-pulse";
            pinStyle = "linear-gradient(to bottom, #fffde6 0%, #ffe082 100%)";
          } else if (checkpoint.status === "LOCKED") {
            colorClass = "text-rose-700 border-rose-500 bg-rose-50";
            bgGlow = "bg-rose-400/40 animate-ping";
            pinStyle = "linear-gradient(to bottom, #ffebee 0%, #ef9a9a 100%)";
          } else if (checkpoint.status === "NORMAL") {
            colorClass = "text-emerald-700 border-emerald-500 bg-emerald-50";
            bgGlow = "bg-emerald-400/20";
            pinStyle = "linear-gradient(to bottom, #e8f5e9 0%, #a5d6a7 100%)";
          }

          return (
            <div
              key={checkpoint.id}
              className="absolute cursor-pointer transition-all duration-300 z-20 group"
              style={{ top: `${checkpoint.coords.y}%`, left: `${checkpoint.coords.x}%` }}
              onClick={() => onSelectCheckpoint(checkpoint)}
              onMouseEnter={() => setHoveredId(checkpoint.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Outer pulsing ring */}
              <div className={`absolute -inset-2 rounded-full ${bgGlow} transition-all duration-300 scale-100 group-hover:scale-130`} />
              
              {/* Pin Icon */}
              <div 
                className={`relative p-1 rounded-full border shadow-md transition-transform duration-200 ${colorClass} ${
                  isSelected ? "scale-125 border-[#3595db] ring-2 ring-sky-300/50" : ""
                }`}
                style={{ background: pinStyle }}
              >
                {checkpoint.status !== "NORMAL" ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Label overlay on hover or selected (Segoe UI Tooltip Style) */}
              {(isHovered || isSelected) && (
                <div className="absolute left-6 -top-4 bg-white border border-[#808080] rounded-sm p-2 shadow-xl z-50 w-44 pointer-events-none">
                  <div className="font-sans text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span>{checkpoint.name}</span>
                    <span className={`text-[9px] font-sans font-bold px-1.5 py-0.2 rounded border uppercase ${
                      checkpoint.status === "NORMAL" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                      checkpoint.status === "ALERT" ? "bg-amber-50 border-amber-200 text-amber-700" :
                      "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      {checkpoint.status}
                    </span>
                  </div>
                  <div className="text-[9.5px] font-sans text-slate-500 mt-1 flex flex-col gap-0.5">
                    <span>Type: <strong className="text-slate-700">{checkpoint.type.replace("_", " ")}</strong></span>
                    <span>Officers: <strong className="text-slate-700">{checkpoint.activeOfficers}</strong></span>
                    <span>Checks/24h: <strong className="text-slate-700">{checkpoint.dailyChecks.toLocaleString()}</strong></span>
                    <span>Matches: <strong className="text-rose-600 font-bold">{checkpoint.recentFlagsCount}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Checkpoint Detail Strip */}
      <div className="border-t border-[#d2d2d2] pt-3 z-10">
        {selectedCheckpoint ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono font-bold text-[#3c7fb1] uppercase tracking-wide">
                ACTIVE MONITORING PORT
              </p>
              <h4 className="font-sans text-xs font-bold text-slate-800 truncate max-w-[140px] md:max-w-[200px]">
                {selectedCheckpoint.name}
              </h4>
            </div>
            <div className="flex gap-2.5 font-sans text-[10px] text-slate-500 bg-white p-1.5 rounded-sm border border-[#e2e5e9] shadow-sm">
              <div className="text-center min-w-[50px]">
                <span className="block text-slate-400 text-[8.5px] font-semibold uppercase leading-tight">Checks/24h</span>
                <span className="text-slate-700 font-bold font-mono">{selectedCheckpoint.dailyChecks.toLocaleString()}</span>
              </div>
              <div className="border-l border-[#e2e5e9] pl-2 text-center min-w-[50px]">
                <span className="block text-slate-400 text-[8.5px] font-semibold uppercase leading-tight">Officers</span>
                <span className="text-slate-700 font-bold">{selectedCheckpoint.activeOfficers}</span>
              </div>
              <div className="border-l border-[#e2e5e9] pl-2 text-center min-w-[55px]">
                <span className="block text-slate-400 text-[8.5px] font-semibold uppercase leading-tight">Status</span>
                <span className={`font-bold ${
                  selectedCheckpoint.status === "NORMAL" ? "text-emerald-600" :
                  selectedCheckpoint.status === "ALERT" ? "text-amber-600" :
                  "text-rose-600 font-extrabold animate-pulse"
                }`}>
                  {selectedCheckpoint.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-1.5">
            <p className="text-[10px] font-sans text-slate-400 flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Select port pin above for system intercept feed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
