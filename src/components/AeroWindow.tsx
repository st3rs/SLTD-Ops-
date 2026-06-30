import React, { useState } from "react";
import { 
  ArrowLeft, ArrowRight, RotateCw, Search, Folder, ShieldCheck, 
  ChevronRight, Minimize2, Square, X, ExternalLink, RefreshCw, GripVertical 
} from "lucide-react";

interface AeroWindowProps {
  title: string;
  icon?: React.ReactNode;
  path?: string;
  statusText?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  onClose?: () => void;
  toolbarActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  className?: string;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

export default function AeroWindow({
  title,
  icon,
  path = "C:\\Windows\\System32",
  statusText = "Ready",
  children,
  onRefresh,
  onClose,
  toolbarActions = [],
  className = "",
  searchPlaceholder,
  onSearchChange,
  searchValue = "",
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDragLeave,
}: AeroWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-12 left-4 z-40 bg-gradient-to-b from-[#245ddb] to-[#0834b2] text-white border border-[#12378f] shadow-md px-3.5 py-1.5 rounded-t-md font-sans text-xs flex items-center gap-2 cursor-pointer hover:from-[#3c81f2]" 
        onClick={() => setIsMinimized(false)}
      >
        {icon}
        <span className="font-bold tracking-wide font-sans text-[11px]">{title.split(" - ")[0]}</span>
        <button className="text-white hover:bg-white/10 p-0.5 rounded ml-2">
          <Square className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  const pathParts = path.split("\\");

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col xp-window transition-all duration-300 select-none ${
        isMaximized ? "fixed inset-0 z-40 p-[3px] rounded-none border-none" : `p-[3px] ${className}`
      }`}
    >
      {/* Windows XP Blue Titlebar Header */}
      <div className={`xp-window-titlebar flex items-center justify-between px-2.5 py-1.5 select-none rounded-t-[4px] h-[30px] shrink-0 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}>
        
        {/* Title & Icon */}
        <div className="flex items-center gap-1.5 z-10">
          {draggable && (
            <span className="text-white/40 hover:text-white/80 cursor-grab active:cursor-grabbing mr-0.5" title="Drag to reorder workspace">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}
          {icon && <span className="text-white scale-90 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">{icon}</span>}
          <span className="font-sans text-[11.5px] font-bold text-white tracking-wide truncate">
            {title}
          </span>
        </div>

        {/* Windows XP Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center gap-[3px] z-10">
          {/* Minimize */}
          <button 
            title="Minimize"
            onClick={() => setIsMinimized(true)}
            className="xp-btn-min-max w-[21px] h-[21px] font-bold cursor-pointer"
          >
            <span className="block w-2.5 h-[2.5px] bg-white mt-2.5" />
          </button>

          {/* Maximize/Restore */}
          <button 
            title={isMaximized ? "Restore Down" : "Maximize"}
            onClick={() => setIsMaximized(!isMaximized)}
            className="xp-btn-min-max w-[21px] h-[21px] font-bold cursor-pointer"
          >
            {isMaximized ? (
              <span className="block w-2 h-2 border-2 border-white relative mt-0.5">
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 border-t border-r border-white bg-[#1e7bf2]" />
              </span>
            ) : (
              <span className="block w-2.5 h-2.5 border-[2px] border-white mt-0.5" />
            )}
          </button>

          {/* Close */}
          <button 
            title="Close"
            onClick={onClose || (() => {})}
            className="xp-btn-close w-[21px] h-[21px] font-bold font-sans cursor-pointer text-xs"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* WINDOW INTERIOR BODY */}
      <div className="bg-[#0f172a] p-1 flex flex-col flex-1 overflow-hidden">
        
        {/* Row 1: Classic WinXP Menu Bar (File, Edit, View...) */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#0f172a] border-b border-[#1e293b] select-none text-[11px] text-[#94a3b8] font-sans overflow-x-auto scrollbar-none whitespace-nowrap">
          <div className="flex items-center gap-3.5">
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">File</span>
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Edit</span>
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">View</span>
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Favorites</span>
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Tools</span>
            <span className="hover:bg-[#1e293b] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Help</span>
          </div>
          <div className="flex items-center gap-1 opacity-60 ml-4">
            <span className="text-[10px] font-bold text-amber-500 font-mono">NCB-RTP // TAC_CMD</span>
          </div>
        </div>

        {/* Row 2: Navigation Toolbar (Back, Forward, Up, Search, Folders) */}
        <div className="flex items-center justify-between gap-1.5 px-2 py-1 bg-[#0f172a] border-t border-b border-[#1e293b] overflow-x-auto scrollbar-none whitespace-nowrap">
          
          <div className="flex items-center gap-2">
            {/* Round Green Back Button - Replaced with Matte Tactical back btn */}
            <div className="flex items-center gap-0.5 cursor-pointer hover:bg-white/5 p-1 rounded-sm">
              <div className="w-5 h-5 rounded-sm bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-[#334155] flex items-center justify-center text-[#38bdf8] shadow-sm">
                <ArrowLeft className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-[11px] font-sans font-bold text-[#38bdf8] ml-1">Back</span>
            </div>

            {/* Forward Button */}
            <div className="flex items-center gap-0.5 opacity-40 p-1">
              <div className="w-5 h-5 rounded-sm bg-[#0f172a] border border-[#334155] flex items-center justify-center text-[#94a3b8]">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="h-6 w-[1px] bg-[#1e293b] mx-1" />

            {/* Search Button Toggle */}
            <div className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-sm text-slate-300">
              <Search className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-[11px] font-sans">Search</span>
            </div>

            {/* Folders Button Toggle */}
            <div className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-sm text-slate-300">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-sans">Folders</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#1e293b] mx-2 hidden sm:block" />
        </div>

        {/* Row 3: Address Bar row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-2 py-1.5 bg-[#0f172a] border-b border-[#1e293b]">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-sans text-slate-400 font-medium font-mono shrink-0">ADDRESS</span>
            
            {/* Windows XP styled Address input field - Replaced with tactical input */}
            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 bg-[#090d16] border border-[#1e293b] rounded-none text-xs font-sans text-slate-300 overflow-hidden">
              <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              
              <div className="flex-1 flex items-center gap-1 font-mono text-[11px] truncate text-slate-300">
                {pathParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />}
                    <span className="hover:text-[#38bdf8] hover:underline cursor-pointer">{part}</span>
                  </React.Fragment>
                ))}
              </div>

              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  title="Refresh Database"
                  className="text-[#38bdf8] hover:text-[#0ea5e9] p-0.5 rounded-sm shrink-0 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3 h-3 animate-spin-once" />
                </button>
              )}
            </div>

            {/* Go Button next to Address */}
            <button className="xp-btn px-2.5 py-0.5 flex items-center gap-1 cursor-pointer font-bold border-[#1e293b] text-[#38bdf8] bg-[#090d16] h-6 shrink-0">
              <span className="text-[10px] font-mono">GO</span>
            </button>
          </div>

          {/* Explorer Search Input inside toolbar */}
          {searchPlaceholder && onSearchChange && (
            <div className="w-full sm:w-[170px] relative flex items-center bg-[#090d16] border border-[#1e293b] rounded-none text-xs font-sans text-slate-300 shrink-0">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent pl-2 pr-6 py-0.5 text-[11px] focus:outline-none placeholder-slate-500 font-mono"
              />
              <span className="absolute right-1.5 text-slate-500 hover:text-[#38bdf8] cursor-pointer">
                <Search className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>

        {/* Row 4: Toolbar Action Buttons (Organize, Sync, etc.) */}
        {toolbarActions.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0a0f1d] border-b border-[#1e293b] px-2 py-1 font-mono text-[10px] text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap">
            <span className="text-amber-500 font-bold uppercase mr-1 shrink-0">ACTION_CMD:</span>
            {toolbarActions.map((act, idx) => (
              <button
                key={idx}
                onClick={act.onClick}
                className="xp-btn px-2.5 py-0.5 font-sans flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                {act.icon && <span className="scale-75 shrink-0">{act.icon}</span>}
                {act.label}
              </button>
            ))}
          </div>
        )}

        {/* PRIMARY SUNKEN CONTAINER (CHILDREN) */}
        <div className="flex-1 bg-[#090d16] border border-[#1e293b] overflow-hidden text-slate-100 flex flex-col">
          {children}
        </div>

        {/* Status Bar at the Bottom */}
        <div className="bg-[#0a0f1d] border-t border-[#1e293b] px-2.5 py-1.5 flex items-center justify-between text-[11px] font-sans text-slate-400 select-none">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-300 font-mono">{statusText}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-[#1e293b] pl-3">
            <span className="font-mono text-[10px]">RTP_INTERPOL_SECURE_v5.2</span>
            <span className="text-amber-500 font-bold font-mono">● LIVE_STREAM</span>
          </div>
        </div>

      </div>
    </div>
  );
}
