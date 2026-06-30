import React, { useState, useEffect } from "react";
import { PassportScanResult, RedNotice } from "../types";
import { CreditCard, Scan, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Database } from "lucide-react";

interface PassportScannerProps {
  onScanComplete: (result: PassportScanResult) => void;
  activeRedNotices: RedNotice[];
}

const PRESET_PASSPORTS = [
  {
    passportNumber: "UK4891042",
    fullName: "JENKINS SARAH LOUISA",
    nationality: "British",
    dob: "1988-11-14",
    gender: "F",
    expiryDate: "2031-05-20",
    biometricMatch: 98,
    blacklistStatus: "CLEARED" as const,
    remarks: "Travel history consistent. Biometric verified via chip certificate."
  },
  {
    passportNumber: "CA9204183",
    fullName: "VANCE MARCUS ALEXIS",
    nationality: "Canadian",
    dob: "1974-03-29",
    gender: "M",
    expiryDate: "2029-08-11",
    biometricMatch: 95,
    blacklistStatus: "FLAGGED_INTERPOL" as const,
    remarks: "CRITICAL WATCHLIST MATCH: Reference No. CA-99201-F (Interpol Red Notice)."
  },
  {
    passportNumber: "RU5819033",
    fullName: "ROSTOVA ELENA VITALEVNA",
    nationality: "Russian",
    dob: "1993-07-15",
    gender: "F",
    expiryDate: "2028-12-04",
    biometricMatch: 97,
    blacklistStatus: "FLAGGED_INTERPOL" as const,
    remarks: "CRITICAL WATCHLIST MATCH: Reference No. RU-10294-C (Interpol Red Notice)."
  },
  {
    passportNumber: "TH0048123",
    fullName: "JAIDEE SOMCHAI",
    nationality: "Thai",
    dob: "1982-04-12",
    gender: "M",
    expiryDate: "2033-10-10",
    biometricMatch: 99,
    blacklistStatus: "CLEARED" as const,
    remarks: "Kingdom of Thailand national passport. Clear. No local police warrants."
  }
];

export default function PassportScanner({ onScanComplete, activeRedNotices }: PassportScannerProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("");
  const [scanResult, setScanResult] = useState<PassportScanResult | null>(null);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setScanResult(null);
  };

  useEffect(() => {
    if (!scanning) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        
        // Update scanning step descriptions
        if (next < 25) {
          setStepMessage("INITIALIZING CONTACTLESS RFID CHIP LINK...");
        } else if (next < 50) {
          setStepMessage("DECRYPTING PASSPORT MRZ DATA STRIP...");
        } else if (next < 75) {
          setStepMessage("VERIFYING FACIAL BIOMETRIC LIKENESS...");
        } else if (next < 95) {
          setStepMessage("QUERYING RTP-IMM CENTRAL BLACKLIST AND INTERPOL SLTD...");
        } else {
          setStepMessage("COMPILING SECURITY VERIFICATION REPORT...");
        }

        if (next >= 100) {
          clearInterval(timer);
          setScanning(false);
          
          const preset = PRESET_PASSPORTS[selectedPreset];
          
          // Double check if this passport matches any custom/dynamic Red Notices loaded in frontend
          let blacklistStatus = preset.blacklistStatus;
          let remarks = preset.remarks;
          
          const matchingNotice = activeRedNotices.find(
            (notice) => notice.passportNumber.toLowerCase() === preset.passportNumber.toLowerCase()
          );

          if (matchingNotice) {
            blacklistStatus = "FLAGGED_INTERPOL";
            remarks = `CRITICAL INTERPOL MATCH: Fugitive matches Red Notice ${matchingNotice.referenceNumber}. Immediate containment required!`;
          }

          const result: PassportScanResult = {
            passportNumber: preset.passportNumber,
            fullName: preset.fullName,
            nationality: preset.nationality,
            dob: preset.dob,
            gender: preset.gender,
            expiryDate: preset.expiryDate,
            mrzMatch: true,
            biometricMatch: preset.biometricMatch,
            blacklistStatus,
            remarks
          };
          
          setScanResult(result);
          onScanComplete(result);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [scanning, selectedPreset, activeRedNotices, onScanComplete]);

  return (
    <div className="bg-[#f0f3f6] p-4 flex flex-col justify-between md:h-[390px] h-auto gap-3">
      
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-[#3c7fb1]" />
          <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-wide">
            BIOMETRIC CHIP SCANNER CONTROL
          </span>
        </div>
        <span className="text-[9px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
          DEVICES: ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 flex-1 items-stretch">
        
        {/* Left Side: Select Preset & Trigger Scan */}
        <div className="flex flex-col justify-between border border-[#c8cbd1] bg-white p-2.5 rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
          <div>
            <label className="block text-[10px] font-sans text-slate-500 font-semibold uppercase tracking-wide mb-2">
              Select Passport Document
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_PASSPORTS.map((preset, idx) => (
                <button
                  key={preset.passportNumber}
                  onClick={() => {
                    if (!scanning) setSelectedPreset(idx);
                  }}
                  disabled={scanning}
                  className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-sm border text-xs font-sans transition-all duration-100 cursor-pointer ${
                    selectedPreset === idx
                      ? "bg-[#e2f0fd] border-[#a7d3f8] text-[#0b2e54] font-bold shadow-[inset_0_1px_1px_white]"
                      : "bg-white border-transparent text-slate-600 hover:bg-[#f2f7fc]"
                  }`}
                >
                  <div className="truncate max-w-[120px]">
                    <p className="font-sans font-bold uppercase text-[11px] leading-tight text-slate-800">{preset.fullName.split(" ")[0]}</p>
                    <p className="text-[9.5px] text-slate-400 leading-tight font-sans mt-0.5">{preset.nationality}</p>
                  </div>
                  <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded-sm border border-[#e2e5e9] text-slate-500 font-mono">
                    {preset.passportNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startScan}
            disabled={scanning}
            className={`w-full mt-3 rounded-sm font-bold font-sans text-[11px] tracking-wide py-2.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              scanning
                ? "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                : "win7-btn-primary text-white"
            }`}
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                VERIFYING CHIP DATA...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 text-white" />
                EXECUTE CHIP READER
              </>
            )}
          </button>
        </div>

        {/* Right Side: Scan Animation / Result Terminal */}
        <div className="flex flex-col justify-between border border-[#c8cbd1] bg-white p-2.5 rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] relative overflow-hidden min-h-[200px]">
          
          {scanning ? (
            /* SCANNING ACTIVE SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {/* Green/blue scanning laser overlay */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-sky-400/80 shadow-[0_0_10px_#38bdf8] animate-[bounce_1.5s_infinite] pointer-events-none" />
              
              <div className="relative mb-3">
                <CreditCard className="w-10 h-10 text-sky-600 animate-pulse" />
                <div className="absolute inset-0 bg-sky-400/10 rounded-full blur-xl animate-ping" />
              </div>

              {/* Windows 7 Skeuomorphic Green Progress Bar */}
              <div className="w-full max-w-[150px] bg-white rounded-[3px] h-4 p-[1.5px] border border-[#a2a2a2] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
                <div 
                  className="h-full rounded-sm transition-all duration-100 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-[#30790f]"
                  style={{ 
                    width: `${progress}%`,
                    background: "linear-gradient(to bottom, #b3e39f 0%, #7ecf5e 40%, #48a920 100%)"
                  }}
                />
              </div>

              <p className="font-sans text-[11px] text-[#2c628c] font-bold mt-2.5 tracking-wide">
                {progress}% COMPLETE
              </p>
              <p className="font-sans text-[9px] text-slate-400 mt-1 uppercase max-w-[150px] leading-tight font-medium">
                {stepMessage}
              </p>
            </div>
          ) : scanResult ? (
            /* RESULTS SCREEN */
            <div className="flex-1 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Verification Log</span>
                  <div className={`flex items-center gap-1 font-sans font-bold text-[9.5px] px-2 py-0.5 rounded-sm border uppercase ${
                    scanResult.blacklistStatus === "CLEARED" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                  }`}>
                    {scanResult.blacklistStatus === "CLEARED" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {scanResult.blacklistStatus.replace("_", " ")}
                  </div>
                </div>

                <div className="bg-[#f5f8fa] border border-[#d3dce3] rounded-sm p-2 text-[10px] font-sans text-slate-700 flex flex-col gap-1 shadow-sm">
                  <div className="flex justify-between border-b border-[#e2e5e9] pb-0.5">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="text-slate-800 font-bold uppercase">{scanResult.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e2e5e9] pb-0.5">
                    <span className="text-slate-400">Passport No:</span>
                    <span className="text-slate-800 font-bold font-mono">{scanResult.passportNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e2e5e9] pb-0.5">
                    <span className="text-slate-400">Nationality:</span>
                    <span className="text-slate-800 font-medium">{scanResult.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biometrics Match:</span>
                    <span className={scanResult.biometricMatch >= 90 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {scanResult.biometricMatch}% MATCH (PASS)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[9.5px] font-sans bg-slate-50 border border-[#e2e5e9] p-2 rounded-sm text-slate-500 leading-relaxed shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
                <span className="text-slate-400 font-bold uppercase block text-[8px] mb-0.5">Enforcement Directives:</span>
                <p className="text-slate-700">{scanResult.remarks}</p>
              </div>

            </div>
          ) : (
            /* DEFAULT SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <Database className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-sans text-[11px] font-bold text-slate-400">
                AWAITING CHIP READING
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] leading-normal font-sans">
                Select a document profile on the left, then trigger scan verification.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Terminal Footer */}
      <div className="text-[9.5px] font-sans text-slate-400 border-t border-[#d2d2d2] pt-1.5 flex items-center justify-between">
        <span>SECURITY LEVEL: APPS LINK ENCRYPTION</span>
        <span>I-24/7 INTERNET SECURE</span>
      </div>

    </div>
  );
}
