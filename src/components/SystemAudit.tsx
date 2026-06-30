import React, { useState, useEffect, useRef, useCallback } from "react";
import { BorderLog } from "../types";
import { 
  Shield, FileText, Download, RefreshCw, AlertTriangle, 
  Terminal, ShieldCheck, Cpu, UploadCloud, Clock, Trash2, 
  Play, Pause, FileSpreadsheet, CheckCircle, Printer
} from "lucide-react";
import ThermalReceipt from "./ThermalReceipt";

interface SystemAuditProps {
  logs: BorderLog[];
  onAddSystemMessage: (text: string) => void;
}

interface SavedExport {
  id: string;
  timestamp: string;
  filename: string;
  recordsCount: number;
  csvContent: string;
  sizeBytes: number;
}

export default function SystemAudit({ logs, onAddSystemMessage }: SystemAuditProps) {
  // Config state
  const [reportTitle, setReportTitle] = useState("BORDER CONTROL INCIDENT & COMPLIANCE SYSTEM AUDIT");
  const [investigatorName, setInvestigatorName] = useState("Chief Security Officer");
  const [badgeNumber, setBadgeNumber] = useState("RTP-IMM-9842");
  const [securityLevel, setSecurityLevel] = useState("SECRET");
  const [focusMode, setFocusMode] = useState<"ALL" | "DETAINED" | "FLAGGED">("ALL");

  // Output report state
  const [reportText, setReportText] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Active control panel tab: "METADATA" or "AUTO_EXPORT"
  const [activeTab, setActiveTab] = useState<"METADATA" | "AUTO_EXPORT">("METADATA");

  // Auto-Export state
  const [autoExportEnabled, setAutoExportEnabled] = useState(false);
  const [exportInterval, setExportInterval] = useState(30); // in seconds
  const [exportFilter, setExportFilter] = useState<"ALL" | "DETAINED" | "FLAGGED">("ALL");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [savedExports, setSavedExports] = useState<SavedExport[]>([]);

  // Refs for auto-export timer to bypass stale React closures and frequent tick resets
  const logsRef = useRef(logs);
  const savedExportsRef = useRef(savedExports);
  const exportFilterRef = useRef(exportFilter);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    savedExportsRef.current = savedExports;
  }, [savedExports]);

  useEffect(() => {
    exportFilterRef.current = exportFilter;
  }, [exportFilter]);

  // Load saved local exports on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rtp_compliance_auto_exports");
      if (stored) {
        setSavedExports(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local auto-exports", e);
    }
  }, []);

  // Sync saved list helper
  const saveExportsToStorage = (newExports: SavedExport[]) => {
    setSavedExports(newExports);
    try {
      localStorage.setItem("rtp_compliance_auto_exports", JSON.stringify(newExports));
    } catch (e) {
      console.error("Failed to write auto-exports to localStorage", e);
    }
  };

  // Perform CSV auto-export
  const triggerAutoExport = useCallback((manualFilter?: "ALL" | "DETAINED" | "FLAGGED") => {
    const currentLogs = logsRef.current;
    const currentSaved = savedExportsRef.current;
    const currentFilter = manualFilter || exportFilterRef.current;

    // Filter matching logs
    const filteredForExport = currentLogs.filter(log => {
      if (currentFilter === "ALL") return true;
      if (currentFilter === "DETAINED" && log.status === "DETAINED") return true;
      if (currentFilter === "FLAGGED" && log.status === "FLAGGED") return true;
      return false;
    });

    // Generate CSV string content
    const headers = ["Log ID", "Timestamp", "Port of Entry", "Passenger Name", "Nationality", "Status", "Action Taken"];
    const rows = filteredForExport.map(log => [
      log.id,
      `"${log.timestamp.replace(/"/g, '""')}"`,
      `"${log.location.replace(/"/g, '""')}"`,
      `"${log.passengerName.replace(/"/g, '""')}"`,
      `"${log.nationality.replace(/"/g, '""')}"`,
      `"${log.status.replace(/"/g, '""')}"`,
      `"${log.actionTaken.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const sizeBytes = new Blob([csvContent], { type: "text/csv" }).size;

    const timeString = new Date().toLocaleTimeString();
    const dateStamp = new Date().toISOString().slice(0, 10);
    const id = `EXP-${Date.now()}`;
    const filename = `rtp_auto_${currentFilter.toLowerCase()}_${dateStamp}_${Date.now().toString().slice(-4)}.csv`;

    const newExport: SavedExport = {
      id,
      timestamp: `${dateStamp} ${timeString}`,
      filename,
      recordsCount: filteredForExport.length,
      csvContent,
      sizeBytes
    };

    const updatedExports = [newExport, ...currentSaved].slice(0, 15); // Cap to 15 entries
    setSavedExports(updatedExports);
    try {
      localStorage.setItem("rtp_compliance_auto_exports", JSON.stringify(updatedExports));
    } catch (e) {
      console.error("Failed to store auto-exports", e);
    }

    // Append to audit center diagnostic logger
    setAuditLogs(prev => [...prev, `[${timeString}] AUTO-EXPORT COMPLETED: Saved ${filename} to simulated local storage.`]);

    // Send visual notification message to main operational console chat feed!
    onAddSystemMessage(`[SCHEDULED COMPLIANCE AUTO-EXPORT] Security logs saved to local storage: ${filename} (${filteredForExport.length} records, ${sizeBytes} bytes)`);
  }, [onAddSystemMessage]);

  // Timer Countdown Controller
  useEffect(() => {
    if (!autoExportEnabled) return;
    setSecondsLeft(exportInterval);
  }, [autoExportEnabled, exportInterval]);

  useEffect(() => {
    if (!autoExportEnabled) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerAutoExport();
          return exportInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoExportEnabled, exportInterval, triggerAutoExport]);

  // File Download simulation
  const downloadSavedExport = (item: SavedExport) => {
    const blob = new Blob([item.csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddSystemMessage(`DOWNLOADED COMPLIANCE EXPORT: ${item.filename}`);
  };

  // Delete Individual local export
  const deleteSavedExport = (id: string, filename: string) => {
    const updated = savedExports.filter(e => e.id !== id);
    saveExportsToStorage(updated);
    onAddSystemMessage(`DELETED COMPLIANCE EXPORT FILE: ${filename}`);
  };

  // Clear All exports
  const clearAllSavedExports = () => {
    if (window.confirm("Are you sure you want to purge all locally saved auto-export files?")) {
      saveExportsToStorage([]);
      onAddSystemMessage(`PURGED ALL LOCAL AUTO-EXPORT FILES FROM SIMULATED STORAGE.`);
    }
  };


  // Filter logs based on focus mode
  const flaggedLogs = logs.filter(log => {
    if (log.status === "PASSED") return false;
    if (focusMode === "DETAINED" && log.status !== "DETAINED") return false;
    if (focusMode === "FLAGGED" && log.status !== "FLAGGED") return false;
    return true;
  });

  const triggerAuditCompile = async () => {
    setIsCompiling(true);
    setReportText(null);
    setUploadSuccess(false);
    setAuditLogs([]);

    const steps = [
      "Initializing secure System Audit sequence...",
      "Establishing direct secure connection to RTP Central Core...",
      "Extracting live passenger immigration logs index...",
      `Filtering records (Focus Mode: ${focusMode === "ALL" ? "All Flags & Detainments" : focusMode === "DETAINED" ? "Detainments Only" : "Alphanumeric Flags Only"})...`,
      `Found ${flaggedLogs.length} incident records matching security parameters.`,
      "Calculating digital SHA-256 audit log integrity checksum...",
      "Transmitting secure payload to NCB Bangkok Intelligence Division...",
      "Synthesizing official government memorandum layout...",
      "Fusing local legal codes and Interpol SLTD compliance structures..."
    ];

    // Simulate logs typewriter progress
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
    }

    try {
      // Fetch report from our server API endpoint
      const response = await fetch("/api/system/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: flaggedLogs,
          metadata: {
            reportTitle,
            investigatorName,
            badgeNumber,
            securityLevel,
            focusMode,
            timestamp: new Date().toISOString(),
            allLogsCount: logs.length
          }
        })
      });

      if (!response.ok) {
        throw new Error("Backend audit API failed.");
      }

      const data = await response.json();
      setReportText(data.report);
      setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS: Government Audit Report compiled successfully.`]);
    } catch (e) {
      console.error(e);
      // Fallback local report generation if API fails or server is not yet updated
      generateFallbackLocalReport();
    } finally {
      setIsCompiling(false);
    }
  };

  const generateFallbackLocalReport = () => {
    const timestamp = new Date().toLocaleString();
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    let logsFormatted = "";
    if (flaggedLogs.length === 0) {
      logsFormatted = "  *** NO INCIDENT LOGS RECORDED IN THIS TIME FRAME ***\n";
    } else {
      logsFormatted = flaggedLogs.map((log, idx) => {
        return `[RECORD #${idx + 1}]
  INCIDENT ID:  ${log.id}
  TIMESTAMP:    ${log.timestamp}
  PORT OF ENTRY: ${log.location}
  PASSENGER:    ${log.passengerName}
  NATIONALITY:  ${log.nationality}
  STATUS:       ${log.status}
  ACTION TAKEN: ${log.actionTaken}
  --------------------------------------------------------\n`;
      }).join("\n");
    }

    const fallbackReport = `========================================================================
             ROYAL THAI POLICE IMMIGRATION BUREAU
           INTERPOL NATIONAL CENTRAL BUREAU (NCB) BANGKOK
========================================================================
DOCUMENT REF: RTP-AUDIT-2026-${hash}
CLASSIFICATION: [${securityLevel} - FOR OFFICIAL USE ONLY]
SYSTEM SEED: APPS-GATEWAY-CORE v7.1

------------------------- AUDIT PARAMETERS -----------------------------
REPORT TITLE:  ${reportTitle.toUpperCase()}
INVESTIGATOR:  ${investigatorName.toUpperCase()} (Badge No: ${badgeNumber})
DATE GENERATED: ${timestamp}
FOCUS FILTER:  ${focusMode === "ALL" ? "ALL FLAGS & DETAINMENTS" : focusMode}
TOTAL RECORDS: ${logs.length} logged / ${flaggedLogs.length} flagged

--------------------- STATISTICAL EVALUATION ---------------------------
  * Total Checked Passengers: ${logs.length}
  * Flagged Entries Verified: ${logs.filter(l => l.status === "FLAGGED").length}
  * Biometric Lockout/Detains: ${logs.filter(l => l.status === "DETAINED").length}
  * Passing Clearances Issued: ${logs.filter(l => l.status === "PASSED").length}

----------------------- COMPLIANCE & LEGAL CITATIONS -------------------
1. Under Section 12 of the Thailand Immigration Act B.E. 2522, individuals matching
   international or domestic blacklist records must be refused entry immediately.
2. In accordance with the Extradition Act B.E. 2551, any Red Notice targets subject to
   biometric lockouts (DETAINED) must be secured in isolated administrative holding
   for processing by the Attorney General (OAG) Special Litigation branch.

---------------------- CHRONOLOGICAL INCIDENT REGISTRY ------------------
${logsFormatted}
-------------------------- STRATEGIC ADVISORY --------------------------
* APPS Calibration: Alphanumeric and Biometric Gate Recognition must maintain a 98.4%
  sensitivity rating.
* Hotel Notifications: Ensure local TM30 automatic reporting is fully linked with the
  RTP central index to capture escapes.
* Joint Coordination: Share verified biometric signatures of flagged entries with 
  relevant Interpol NCB partners within 2 horas of incident resolution.

------------------------------------------------------------------------
AUTHENTICATED BY:
${investigatorName}
Chief Security and Compliance Liaison Officer
Interpol NCB Bangkok, Royal Thai Police
[APPROVED DIGITAL SIGNATURE REGISTERED - MD5 HASH ACCREDITED]
========================================================================`;

    setReportText(fallbackReport);
    setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS: Local audit compiling finished as fallback.`]);
  };

  const downloadReportFile = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 30);
    link.href = url;
    link.download = `rtp_ncb_audit_${safeTitle}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Notify in system chat
    onAddSystemMessage(`DOWNLOADED OFFICIAL SYSTEM AUDIT REPORT: ${link.download}`);
  };

  const uploadToInterpol = async () => {
    if (!reportText) return;
    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    setUploadSuccess(true);
    onAddSystemMessage(`SYSTEM UPLOAD: SUCCESSFULLY DEPOSITED COMPLIANCE AUDIT FILE TO INTERPOL GENERAL SECRETARIAT SECURE FILE REPOSITORY (LYON, FRANCE).`);
  };

  return (
    <div className="bg-[#090d16] p-4 flex flex-col justify-between h-full font-sans text-slate-200">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5 mb-3">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-[#38bdf8] animate-pulse" />
          <div>
            <span className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wide">
              SYSTEM AUDIT & LAW COMPLIANCE CENTER
            </span>
            <p className="text-[9px] font-mono text-slate-500 font-bold uppercase">
              RTP SECURITY AUDITING MANAGEMENT CORE • DIRECT CONNECTION
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[9px] font-mono font-bold text-amber-500 uppercase">
            AUDIT DAEMON SECURE
          </span>
        </div>
      </div>

      {/* Main Grid: Config vs Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:overflow-hidden overflow-auto min-h-[300px]">
        
        {/* Left Column: Config Panel (Col: 5) */}
        <div className="lg:col-span-5 bg-[#0d1527] border border-[#1e293b] rounded-sm p-3 flex flex-col justify-between space-y-3.5 shadow-sm overflow-y-auto">
          <div>
            {/* Windows XP style property tabs header */}
            <div className="flex border-b border-[#1e293b] mb-3 select-none shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("METADATA")}
                className={`px-3 py-1.5 text-[11px] font-mono font-bold border-t border-x rounded-t-[3px] -mb-[1px] transition-all cursor-pointer ${
                  activeTab === "METADATA"
                    ? "bg-[#152238] border-[#1e293b] border-b-transparent text-[#38bdf8] font-extrabold"
                    : "bg-[#090d16]/45 hover:bg-[#152238] border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Metadata Setup
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("AUTO_EXPORT")}
                className={`px-3 py-1.5 text-[11px] font-mono font-bold border-t border-x rounded-t-[3px] -mb-[1px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "AUTO_EXPORT"
                    ? "bg-[#152238] border-[#1e293b] border-b-transparent text-[#38bdf8] font-extrabold"
                    : "bg-[#090d16]/45 hover:bg-[#152238] border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Auto-Export</span>
                {savedExports.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono">
                    {savedExports.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "METADATA" ? (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-[#1e293b] pb-1.5 mb-2.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Audit Metadata Setup</span>
                </div>

                <div className="space-y-2.5">
                  {/* Title input */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Report Heading / Title</label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-[#070b13] border border-[#1e293b] text-slate-200 rounded-sm px-2 py-1 text-[10.5px] font-mono focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  {/* Investigator */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Investigator Name</label>
                      <input
                        type="text"
                        value={investigatorName}
                        onChange={(e) => setInvestigatorName(e.target.value)}
                        className="w-full bg-[#070b13] border border-[#1e293b] text-slate-200 rounded-sm px-2 py-1 text-[10.5px] font-sans focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Badge Number</label>
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        className="w-full bg-[#070b13] border border-[#1e293b] text-slate-200 rounded-sm px-2 py-1 text-[10.5px] font-mono focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  {/* Security Classification */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Security Classification Level</label>
                    <select
                      value={securityLevel}
                      onChange={(e) => setSecurityLevel(e.target.value)}
                      className="w-full bg-[#070b13] border border-[#1e293b] text-slate-200 rounded-sm px-2 py-1 text-[10.5px] font-mono focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option className="bg-[#0d1527]" value="CONFIDENTIAL">CONFIDENTIAL (FOR LAW ENFORCEMENT INTERNAL)</option>
                      <option className="bg-[#0d1527]" value="RESTRICTED">RESTRICTED (LIMITED JOINT AGENCY)</option>
                      <option className="bg-[#0d1527]" value="SECRET">SECRET (NCB SPECIAL AGENT ACCESS ONLY)</option>
                      <option className="bg-[#0d1527]" value="TOP SECRET">TOP SECRET (IMMIGRATION CHIEF SIGN-OFF REQUIRED)</option>
                    </select>
                  </div>

                  {/* Focus Filters */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Audit Incident Scope Filter</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setFocusMode("ALL")}
                        className={`text-[9.5px] py-1 px-1.5 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          focusMode === "ALL" 
                            ? "bg-[#152238] border-[#38bdf8] text-[#38bdf8] font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        All Flags
                      </button>
                      <button
                        type="button"
                        onClick={() => setFocusMode("DETAINED")}
                        className={`text-[9.5px] py-1 px-1.5 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          focusMode === "DETAINED" 
                            ? "bg-[#1e1b29] border-rose-500 text-rose-400 font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        Detained Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setFocusMode("FLAGGED")}
                        className={`text-[9.5px] py-1 px-1.5 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          focusMode === "FLAGGED" 
                            ? "bg-[#1e241b] border-amber-500 text-amber-400 font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        Flags Only
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Real-Time Statistics */}
                <div className="bg-[#070b13] p-2.5 rounded border border-[#1e293b] text-[10.5px] mt-4">
                  <span className="block font-mono font-bold text-slate-400 uppercase text-[9px] mb-1.5 border-b border-[#1e293b] pb-0.5">Live Audit Inventory Stream</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0d1527] p-1.5 border rounded border-[#1e293b]">
                      <span className="block text-[8px] text-slate-500 uppercase font-bold leading-none mb-1">Evaluated</span>
                      <span className="text-slate-200 font-mono font-bold text-xs">{logs.length}</span>
                    </div>
                    <div className="bg-[#0d1527] p-1.5 border rounded border-[#1e293b]">
                      <span className="block text-[8px] text-amber-500 uppercase font-bold leading-none mb-1">Flags Matches</span>
                      <span className="text-amber-500 font-mono font-bold text-xs">{logs.filter(l => l.status === "FLAGGED").length}</span>
                    </div>
                    <div className="bg-[#0d1527] p-1.5 border rounded border-[#1e293b]">
                      <span className="block text-[8px] text-rose-500 uppercase font-bold leading-none mb-1">Detainments</span>
                      <span className="text-rose-400 font-mono font-bold text-xs">{logs.filter(l => l.status === "DETAINED").length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* AUTO_EXPORT TAB PANEL */
              <div className="space-y-3.5 animate-fadeIn">
                <div className="border-b border-[#1e293b] pb-1.5 mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Auto-Export Settings</span>
                  </div>
                  {autoExportEnabled && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#152238] border border-emerald-500/30 text-emerald-400 animate-pulse rounded-sm">
                      SCHEDULER ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Status toggle & Countdown */}
                  <div className="bg-[#070b13] p-2.5 border border-[#1e293b] rounded-sm flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Scheduler Status</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAutoExportEnabled(!autoExportEnabled)}
                          className={`px-3 py-1 text-[10px] font-mono font-bold rounded-sm border cursor-pointer flex items-center gap-1 transition-all ${
                            autoExportEnabled
                              ? "bg-emerald-850 border-emerald-500/40 text-emerald-400 hover:bg-emerald-800 shadow-sm"
                              : "bg-[#0d1527] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                          }`}
                        >
                          {autoExportEnabled ? (
                            <>
                              <Pause className="w-3 h-3 fill-current" />
                              ENABLED
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              DISABLED
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Next Auto-Export</span>
                      <div className="font-mono font-bold text-[13px] text-slate-200 flex items-center gap-1 justify-end">
                        {autoExportEnabled ? (
                          <>
                            <span className="animate-pulse text-[#38bdf8]">{secondsLeft}s</span>
                            <span className="text-[10px] text-slate-500 font-sans font-normal">remaining</span>
                          </>
                        ) : (
                          <span className="text-slate-500 italic text-[10px]">Suspended</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interval Selection */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Export Interval Frequency</label>
                    <select
                      value={exportInterval}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setExportInterval(val);
                        setSecondsLeft(val);
                      }}
                      className="w-full bg-[#070b13] border border-[#1e293b] text-slate-200 rounded-sm px-2 py-1 text-[10.5px] font-mono focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option className="bg-[#0d1527]" value="10">Every 10 seconds (Testing Speed)</option>
                      <option className="bg-[#0d1527]" value="30">Every 30 seconds (Standard)</option>
                      <option className="bg-[#0d1527]" value="60">Every 1 minute</option>
                      <option className="bg-[#0d1527]" value="300">Every 5 minutes</option>
                      <option className="bg-[#0d1527]" value="900">Every 15 minutes</option>
                    </select>
                  </div>

                  {/* Scope filter selection */}
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Export Record Scope Filter</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setExportFilter("ALL")}
                        className={`text-[9.5px] py-1 px-1 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          exportFilter === "ALL" 
                            ? "bg-[#152238] border-[#38bdf8] text-[#38bdf8] font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        All Checked
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportFilter("DETAINED")}
                        className={`text-[9.5px] py-1 px-1 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          exportFilter === "DETAINED" 
                            ? "bg-[#1e1b29] border-rose-500 text-rose-400 font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        Detained Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportFilter("FLAGGED")}
                        className={`text-[9.5px] py-1 px-1 border font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                          exportFilter === "FLAGGED" 
                            ? "bg-[#1e241b] border-amber-500 text-amber-400 font-extrabold" 
                            : "bg-[#070b13] border-[#1e293b] text-slate-400 hover:bg-[#152238]"
                        }`}
                      >
                        Flags Only
                      </button>
                    </div>
                  </div>

                  {/* Manual trigger button */}
                  <button
                    type="button"
                    onClick={() => triggerAutoExport(exportFilter)}
                    className="w-full bg-[#0a0f1d] hover:bg-[#152238] py-1.5 px-3 text-[10px] font-mono font-bold text-[#38bdf8] flex items-center justify-center gap-1.5 cursor-pointer border border-[#1e293b] transition-all rounded-sm shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    EXPORT CSV NOW MANUALLY
                  </button>

                  {/* Saved list container */}
                  <div className="border-t border-[#1e293b] pt-3 mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                        Simulated Local Storage ({savedExports.length})
                      </span>
                      {savedExports.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllSavedExports}
                          className="text-[9px] text-rose-400 font-mono font-bold hover:underline cursor-pointer"
                        >
                          Purge All
                        </button>
                      )}
                    </div>

                    <div className="max-h-[140px] overflow-y-auto border border-[#1e293b] rounded-sm bg-[#070b13] divide-y divide-[#1e293b]">
                      {savedExports.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 italic text-[10px] font-mono">
                          No CSV compliance archives exported yet. Enable the scheduler or click Export Now to initiate a backup.
                        </div>
                      ) : (
                        savedExports.map((item) => (
                          <div key={item.id} className="p-2 flex items-center justify-between hover:bg-[#0d1527] transition-colors">
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="block font-mono text-[9px] font-bold text-slate-300 truncate" title={item.filename}>
                                {item.filename}
                              </span>
                              <span className="text-[8.5px] font-mono text-slate-500 flex items-center gap-2">
                                <span>{item.timestamp}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-400">{item.recordsCount} records</span>
                                <span>•</span>
                                <span>{(item.sizeBytes / 1024).toFixed(2)} KB</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => downloadSavedExport(item)}
                                title="Download CSV file"
                                className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] hover:bg-[#1e293b] rounded-sm cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSavedExport(item.id, item.filename)}
                                title="Purge local backup"
                                className="p-1 text-slate-500 hover:text-rose-500 hover:bg-[#1e293b] rounded-sm cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeTab === "METADATA" && (
            <button
              onClick={triggerAuditCompile}
              disabled={isCompiling}
              className="w-full bg-[#1e293b] hover:bg-[#2c3e50] border border-[#1e293b] py-2 px-3 text-xs font-mono font-bold text-[#38bdf8] flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4 shrink-0 transition-all rounded-sm"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#38bdf8]" />
                  Compiling Secure Audit...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-[#38bdf8]" />
                  COMPILE SYSTEM REPORT
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Console/Report Preview Panel (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden">
          
          {/* Compilation diagnostic logs (active when compiling or no report compiled yet) */}
          {!reportText ? (
            <div className="flex-1 bg-[#070b13] rounded-sm p-3 font-mono text-[10px] text-[#4af626] border border-[#1e293b] flex flex-col justify-between shadow-inner overflow-y-auto space-y-1">
              <div className="space-y-1">
                <div className="text-slate-400 border-b border-[#1e293b] pb-1.5 mb-2 font-mono flex items-center justify-between">
                  <span>TERMINAL CONSOLE SHELL (STDOUT)</span>
                  <span className="animate-pulse text-[#4af626] font-bold">READY</span>
                </div>
                <p>&gt; RTP-IMM System Security Audit engine online.</p>
                <p>&gt; Standby for compliance evaluation sequence commands...</p>
                
                {auditLogs.map((logStr, i) => (
                   <p key={i} className="leading-normal animate-fadeIn">{logStr}</p>
                ))}

                {isCompiling && (
                  <div className="flex items-center gap-1.5 mt-2 animate-pulse text-[#38bdf8]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#38bdf8] animate-ping"></span>
                    <span>AI MATRIX COMPILING IN PROGRESS...</span>
                  </div>
                )}
              </div>
              
              {!isCompiling && auditLogs.length === 0 && (
                <div className="text-center py-10 font-mono text-slate-500 space-y-1.5">
                  <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="font-bold text-xs uppercase">No active report compiled in memory</p>
                  <p className="text-[10px]">Configure your parameters on the left and click Compile.</p>
                </div>
              )}
            </div>
          ) : (
            // Report Preview Window (active once report is generated)
            <div className="flex-1 bg-[#0d1527] border border-[#1e293b] rounded-sm flex flex-col overflow-hidden shadow-inner">
              <div className="bg-[#070b13] border-b border-[#1e293b] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0 select-none">
                <span className="font-bold text-slate-300 uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Audit Report Preview
                </span>
                <span className="font-mono text-slate-500 uppercase">PDF/A-1b Compliant Text Format</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto bg-[#070b13] font-mono text-[9.5px] leading-relaxed text-[#4af626] whitespace-pre-wrap select-text">
                {reportText}
              </div>
            </div>
          )}

          {/* Action buttons footer for compiled reports */}
          <div className="flex flex-col sm:flex-row gap-2.5 border-t border-[#1e293b] pt-2.5 mt-2.5 shrink-0 select-none">
            <button
              onClick={downloadReportFile}
              disabled={!reportText || isCompiling}
              className={`flex-1 py-1.5 px-3 rounded-sm font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                reportText && !isCompiling
                  ? "bg-[#1e293b] hover:bg-[#2c3e50] border border-[#1e293b] text-[#38bdf8] cursor-pointer"
                  : "bg-[#070b13] border border-[#1e293b] text-slate-600 cursor-not-allowed"
              }`}
            >
              <Download className={`w-3.5 h-3.5 ${reportText ? "text-[#38bdf8]" : "text-slate-600"}`} />
              Download Audit (.TXT)
            </button>

            <button
              onClick={uploadToInterpol}
              disabled={!reportText || isCompiling || uploading || uploadSuccess}
              className={`flex-1 py-1.5 px-3 rounded-sm font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                reportText && !isCompiling && !uploadSuccess
                  ? "bg-[#1e293b] hover:bg-[#2c3e50] border border-[#1e293b] text-amber-500 cursor-pointer"
                  : uploadSuccess
                  ? "bg-[#1e241b] border border-[#1e293b] text-emerald-400 cursor-default"
                  : "bg-[#070b13] border border-[#1e293b] text-slate-600 cursor-not-allowed"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : uploadSuccess ? "Uploaded to Lyon" : "Upload to Interpol Link"}
            </button>

            <button
              onClick={() => {
                setIsReceiptOpen(true);
                onAddSystemMessage("INITIATED COMPLIANCE HARDCOPY FAUX-THERMAL PRINT RECEIPT OVERLAY.");
              }}
              disabled={!reportText || isCompiling}
              className={`flex-1 py-1.5 px-3 rounded-sm font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                reportText && !isCompiling
                  ? "bg-[#1e293b] hover:bg-[#2c3e50] border border-[#1e293b] text-amber-500 cursor-pointer font-bold animate-pulse"
                  : "bg-[#070b13] border border-[#1e293b] text-slate-600 cursor-not-allowed"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Report
            </button>
          </div>

        </div>

      </div>

      {/* THERMAL PRINTER RECEIPT MODAL */}
      <ThermalReceipt 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        logs={logs}
        metadata={{
          reportTitle,
          investigatorName,
          badgeNumber,
          securityLevel,
          focusMode
        }}
      />

    </div>
  );
}
