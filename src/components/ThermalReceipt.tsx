import React, { useState, useEffect, useRef } from "react";
import { BorderLog } from "../types";
import { 
  X, Printer, Scissors, FileText, ChevronDown, Check, Volume2, VolumeX, Download 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ThermalReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BorderLog[];
  metadata: {
    reportTitle: string;
    investigatorName: string;
    badgeNumber: string;
    securityLevel: string;
    focusMode: string;
    timestamp?: string;
  };
}

export default function ThermalReceipt({ isOpen, onClose, logs, metadata }: ThermalReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0); // 0 to 100
  const [hasPrinted, setHasPrinted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [extraFeeds, setExtraFeeds] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play thermal printing whir/scratch audio using Web Audio API
  const playThermalWhir = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Fast burst of high-passed scratch sounds simulating paper motor
      for (let i = 0; i < 4; i++) {
        const time = now + i * 0.05;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(250 + Math.random() * 200, time);
        
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1200, time);
        
        gain.gain.setValueAtTime(0.015, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.04);
      }
    } catch (e) {
      // Audio not permitted or fails
    }
  };

  const playTearSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Simulated paper tear sound (noise / scratch bursts)
      for (let i = 0; i < 12; i++) {
        const time = now + i * 0.015;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(100 + Math.random() * 800, time);
        
        gain.gain.setValueAtTime(0.02, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.025);
      }
    } catch (e) {}
  };

  // Start the paper feed printing animation when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPrinting(true);
      setPrintProgress(0);
      setHasPrinted(false);
      setExtraFeeds(0);

      // Interval for visual printing roll out
      const interval = setInterval(() => {
        setPrintProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPrinting(false);
            setHasPrinted(true);
            return 100;
          }
          // Play tick beep sound periodically while progress moves
          if (prev % 6 === 0) {
            playThermalWhir();
          }
          return prev + 2;
        });
      }, 35);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTimestamp = metadata.timestamp 
    ? new Date(metadata.timestamp).toLocaleString()
    : new Date().toLocaleString();

  const hashId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const receiptId = `RTP-RCV-${new Date().getFullYear()}-${hashId}`;

  // Filter logs for print based on focusMode
  const filteredLogs = logs.filter(log => {
    if (metadata.focusMode === "ALL") return true;
    if (metadata.focusMode === "DETAINED" && log.status === "DETAINED") return true;
    if (metadata.focusMode === "FLAGGED" && log.status === "FLAGGED") return true;
    return false;
  });

  // Handle feed button click
  const handleFeedPaper = () => {
    setExtraFeeds(prev => prev + 1);
    playThermalWhir();
  };

  // Handle Tear off button (Tears off paper and closes)
  const handleTearOff = () => {
    playTearSound();
    // Quick success animation then close
    onClose();
  };

  // Browser level print optimization (creates a print-only style tag to target the receipt specifically)
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none print:p-0 print:bg-white print:backdrop-none overflow-y-auto">
        
        {/* Style tag injection for pure receipt layout on paper printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-receipt-container, .print-receipt-container * {
              visibility: visible;
            }
            .print-receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
            }
            .no-print-element {
              display: none !important;
            }
          }
        `}} />

        <div className="flex flex-col items-center max-w-lg w-full max-h-[95vh] no-print-element">
          
          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between bg-[#0f172a] border border-[#1e293b] px-4 py-2.5 rounded-t-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-slate-200">FAUX-THERMAL HARDCOPY PRINTER</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sound toggle button */}
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Printer Sound" : "Enable Printer Sound"}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
              
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printer Feed Slot visual boundary */}
          <div className="w-[360px] md:w-[390px] h-[16px] bg-gradient-to-b from-[#1e293b] via-[#090d16] to-[#101726] border-x border-[#334155] relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-10">
            <div className="absolute inset-x-4 top-1 h-[2px] bg-black rounded-full" />
          </div>

          {/* Paper roll out container */}
          <div 
            ref={containerRef}
            className="w-[348px] md:w-[378px] overflow-y-auto overflow-x-hidden flex-1 flex flex-col items-center py-2 relative scrollbar-none"
            style={{ maxHeight: 'calc(90vh - 120px)' }}
          >
            
            {/* Animated Receipt paper */}
            <motion.div 
              initial={{ height: 40 }}
              animate={{ 
                height: isPrinting 
                  ? `${Math.max(80, (printProgress / 100) * 100)}%` 
                  : "auto"
              }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="print-receipt-container w-full bg-[#fdfbf7] text-neutral-900 flex flex-col shadow-2xl relative border-x border-dashed border-gray-300 overflow-hidden"
              style={{
                boxShadow: "0 15px 35px -5px rgba(0,0,0,0.5), 0 5px 15px -3px rgba(0,0,0,0.4)"
              }}
            >
              
              {/* Top Jagged Edge Tooth strip */}
              <div className="flex overflow-hidden w-full h-2.5 bg-gray-200/45 select-none shrink-0" style={{ backgroundSize: '12px 12px' }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-[#fdfbf7] fill-current shrink-0 -mt-[1px]" viewBox="0 0 20 20">
                    <polygon points="0,0 10,10 20,0 20,20 0,20" />
                  </svg>
                ))}
              </div>

              {/* Thermal paper watermark background styling */}
              <div className="flex-1 px-5 py-4 font-mono text-[10px] leading-tight text-neutral-800 tracking-tight flex flex-col justify-between">
                
                {/* Header info */}
                <div className="text-center space-y-1 mb-3 shrink-0">
                  <div className="font-extrabold text-xs tracking-wider uppercase text-black">
                    ROYAL THAI POLICE DEPT
                  </div>
                  <div className="text-[9px] font-bold text-neutral-600 tracking-wide">
                    IMMIGRATION & LAW COMPLIANCE OFFICE
                  </div>
                  <div className="text-[9.5px] uppercase font-bold text-neutral-500">
                    INTERPOL NCB BANGKOK UNIT
                  </div>
                  <div className="text-[8px] text-neutral-400 mt-1">
                    * * * SYSTEM OFFICIAL RECORD * * *
                  </div>
                  <div className="border-t border-dashed border-neutral-400 pt-1.5 mt-2 text-left space-y-0.5">
                    <div className="flex justify-between">
                      <span>STATION:</span>
                      <span className="font-bold">RTP-BANGKOK_GATE_CORE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOC REF:</span>
                      <span className="font-bold">{receiptId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATE/TIME:</span>
                      <span>{currentTimestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OPERATOR:</span>
                      <span className="font-bold">{metadata.investigatorName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BADGE NO:</span>
                      <span>{metadata.badgeNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SECURITY LEVEL:</span>
                      <span className="px-1 bg-neutral-900 text-[#fdfbf7] font-bold font-mono">
                        [{metadata.securityLevel}]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Focus Scope Section */}
                <div className="border-t border-dashed border-neutral-400 py-1.5 text-center shrink-0">
                  <span className="font-extrabold tracking-widest text-[9.5px] block uppercase text-black">
                    AUDIT INCIDENT MEMORANDUM
                  </span>
                  <div className="text-[8.5px] text-neutral-500 mt-0.5">
                    FILTER PARAMETER: {metadata.focusMode} INCIDENTS ONLY
                  </div>
                </div>

                {/* Stats Section */}
                <div className="border-t border-b border-dashed border-neutral-400 py-2 my-1 shrink-0 bg-neutral-100/60 px-2 space-y-1">
                  <div className="font-bold text-[9px] text-neutral-700 uppercase tracking-wider mb-1">
                    LIVE SYSTEM COUNTER AUDITED:
                  </div>
                  <div className="flex justify-between">
                    <span>FLAGGED PASSENGERS VERIFIED:</span>
                    <span className="font-bold font-mono">{logs.filter(l => l.status === "FLAGGED").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DETAINMENTS / BIOMETRICS:</span>
                    <span className="font-bold font-mono">{logs.filter(l => l.status === "DETAINED").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLEARANCES / COMPLIANT:</span>
                    <span className="font-bold font-mono">{logs.filter(l => l.status === "PASSED").length}</span>
                  </div>
                  <div className="flex justify-between border-t border-dotted border-neutral-300 pt-1 mt-1 font-bold text-black">
                    <span>TOTAL AUDITED POOL:</span>
                    <span>{logs.length} RECORDS</span>
                  </div>
                </div>

                {/* Main chronological logs */}
                <div className="py-2.5 space-y-3 shrink-0">
                  <div className="font-extrabold text-[9px] text-black border-b border-dotted border-neutral-400 pb-1 mb-1.5 uppercase">
                    CHRONOLOGICAL COMPLIANCE REGISTRY
                  </div>
                  
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-4 text-[9px] text-neutral-400 italic">
                      *** NO RECORDS MATCH PRINT PARAMS ***
                    </div>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <div key={log.id} className="space-y-0.5 text-[9px] border-b border-dotted border-neutral-200 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between font-bold text-black">
                          <span>ITEM #{index + 1} - ID: {log.id}</span>
                          <span className={`px-1 rounded-sm text-[8px] font-bold ${
                            log.status === "DETAINED" 
                              ? "bg-neutral-900 text-white" 
                              : "bg-neutral-200 text-neutral-900"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">PASSENGER:</span>
                          <span className="font-bold text-neutral-800">{log.passengerName.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">NATIONALITY:</span>
                          <span>{log.nationality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">PORT/ENTRY:</span>
                          <span className="truncate max-w-[190px]">{log.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">TIMESTAMP:</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex justify-between items-start pt-0.5">
                          <span className="text-neutral-500 shrink-0 mr-2">ACTION:</span>
                          <span className="text-right text-[8.5px] italic leading-tight text-neutral-700">
                            {log.actionTaken}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Legal Citations segment */}
                <div className="border-t border-dashed border-neutral-400 pt-2.5 mt-2 space-y-1.5 text-left shrink-0">
                  <div className="font-bold text-[8.5px] text-black uppercase tracking-wider">
                    LEGAL STATUTES & CLEARANCE DIRECTIVES
                  </div>
                  <p className="text-[7.5px] leading-snug text-neutral-500">
                    1. COMPLIANCE ASSURANCE: Pursuant to B.E. 2522 Section 12, all biometric matches
                    verified against global indices are recorded and archived for audit.
                  </p>
                  <p className="text-[7.5px] leading-snug text-neutral-500">
                    2. DATA INTEGRITY: Audit hash verification certifies this system logs record stream is untampered.
                  </p>
                </div>

                {/* Interactive signature field */}
                <div className="border-t border-dashed border-neutral-400 pt-5 pb-2 mt-4 text-center shrink-0">
                  <div className="inline-block w-4/5 border-b border-neutral-400 h-6 mb-1" />
                  <div className="text-[7.5px] uppercase tracking-wide text-neutral-500">
                    SIGNATURE OF INVESTIGATING CHIEF
                  </div>
                  <div className="text-[7px] text-neutral-400 mt-0.5">
                    Interpol NCB Bangkok digital audit certification accredited
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-5 mb-1 shrink-0 flex flex-col items-center justify-center">
                  <div className="flex items-stretch h-8 select-none" style={{ gap: '1px' }}>
                    {/* Generates alternating black bar patterns */}
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 2, 3, 1, 1, 2, 4, 1, 3, 2, 1, 2].map((width, idx) => (
                      <div 
                        key={idx} 
                        className="bg-neutral-900" 
                        style={{ width: `${width}px` }} 
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase mt-1">
                    *RTP-NCB-AUDIT-{hashId}*
                  </span>
                </div>

                {/* simulated extra feeding paper blank lines */}
                {extraFeeds > 0 && Array.from({ length: extraFeeds }).map((_, idx) => (
                  <div key={idx} className="h-6 border-b border-dotted border-neutral-200 last:border-0" />
                ))}

                <div className="text-center text-[7.5px] text-neutral-400 mt-6 shrink-0 tracking-widest">
                  --- END OF SECURE AUDIT MEMORANDUM ---
                </div>

              </div>

              {/* Bottom Jagged Edge Tear strip */}
              <div className="flex overflow-hidden w-full h-2.5 bg-gray-200/45 select-none shrink-0" style={{ backgroundSize: '12px 12px' }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-[#fdfbf7] fill-current rotate-180 shrink-0 mt-[1px]" viewBox="0 0 20 20">
                    <polygon points="0,0 10,10 20,0 20,20 0,20" />
                  </svg>
                ))}
              </div>

            </motion.div>
          </div>

          {/* Real physical drawer paper cutter controller buttons bar */}
          <div className="w-[360px] md:w-[390px] bg-[#0f172a] border border-[#1e293b] p-3 rounded-b-lg shadow-xl flex items-center justify-between gap-3 mt-1 no-print-element">
            
            <button
              onClick={handleFeedPaper}
              className="px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-slate-500 rounded text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
              FEED PAPER
            </button>

            <button
              onClick={handleBrowserPrint}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 hover:text-black border border-amber-500 text-slate-950 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT RECEIPT
            </button>

            <button
              onClick={handleTearOff}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded text-[10px] font-mono font-bold text-rose-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5 text-rose-400" />
              TEAR & CLOSE
            </button>
            
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
}
