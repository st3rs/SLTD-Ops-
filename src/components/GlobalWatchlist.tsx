import React, { useState, useEffect } from "react";
import { GlobalWatchlistProfile } from "../types";
import { 
  Globe, Search, UserPlus, Database, RefreshCw, AlertOctagon, 
  CheckCircle, ArrowRight, ShieldAlert, Cpu, FileCheck, ClipboardList, HelpCircle, X
} from "lucide-react";

interface GlobalWatchlistProps {
  onImportToRedNotices: (profile: GlobalWatchlistProfile) => void;
  onSimulatePassportScan: (passportNumber: string) => void;
}

const INITIAL_WATCHLIST: GlobalWatchlistProfile[] = [
  {
    id: "ext-init-1",
    referenceNumber: "WANTED-EU-88402",
    name: "FRANCESCO VALENTINI",
    alias: "IL PADRINO",
    nationality: "Italian",
    passportNumber: "IT8820491",
    charges: "Cross-border extortion, sovereign debt fraud, and trafficking of counterfeit securities.",
    sourceDB: "EUROPOL",
    riskScore: 89,
    lastKnownCountry: "Switzerland",
    status: "WANTED"
  },
  {
    id: "ext-init-2",
    referenceNumber: "SLTD-INT-10492",
    name: "YUKI TANAKA",
    alias: "THE COLD CHIP",
    nationality: "Japanese",
    passportNumber: "JP3029144",
    charges: "Industrial espionage, theft of biometric mainframe source codes, and financial server decryption.",
    sourceDB: "INTERPOL_SLTD",
    riskScore: 76,
    lastKnownCountry: "Vietnam",
    status: "MONITORED"
  }
];

export default function GlobalWatchlist({ 
  onImportToRedNotices, 
  onSimulatePassportScan 
}: GlobalWatchlistProps) {
  const [watchlist, setWatchlist] = useState<GlobalWatchlistProfile[]>(INITIAL_WATCHLIST);
  const [selectedProfile, setSelectedProfile] = useState<GlobalWatchlistProfile | null>(INITIAL_WATCHLIST[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDB, setSelectedDB] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  
  // Cross-reference state
  const [crossRefLoading, setCrossRefLoading] = useState(false);
  const [crossRefReport, setCrossRefReport] = useState<{
    flightMatch: boolean;
    hotelMatch: boolean;
    riskLevel: "CRITICAL" | "SUSPICIOUS" | "CLEARED";
    remarks: string;
  } | null>(null);

  // Manual Add Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAlias, setManualAlias] = useState("");
  const [manualNation, setManualNation] = useState("");
  const [manualPassport, setManualPassport] = useState("");
  const [manualCharges, setManualCharges] = useState("");
  const [manualSource, setManualSource] = useState<GlobalWatchlistProfile["sourceDB"]>("MANUAL_ENTRY");
  const [manualRisk, setManualRisk] = useState(70);

  // Search API implementation
  const handleApiSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/watchlist/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, sourceDB: selectedDB }),
      });

      if (!response.ok) {
        throw new Error("External database query failed");
      }

      const data = await response.json();
      if (data.profiles && Array.isArray(data.profiles)) {
        // Merge with existing watchlist, filter out duplicates by passport
        setWatchlist((prev) => {
          const combined = [...data.profiles, ...prev];
          const unique = combined.filter(
            (v, i, a) => a.findIndex((t) => t.passportNumber === v.passportNumber) === i
          );
          return unique;
        });
        
        if (data.profiles.length > 0) {
          setSelectedProfile(data.profiles[0]);
        }
      }
    } catch (e) {
      console.error("Watchlist API search error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Run a multi-vector cross-reference checks against simulated Thai Immigration data
  const handleCrossReference = (profile: GlobalWatchlistProfile) => {
    setCrossRefLoading(true);
    setCrossRefReport(null);

    setTimeout(() => {
      // Simulate highly detailed checking algorithm results based on profile's data
      const flightMatch = profile.nationality === "Italian" || profile.name.includes("FRANCESCO") || Math.random() > 0.5;
      const hotelMatch = profile.riskScore > 80 || Math.random() > 0.6;
      
      let riskLevel: "CRITICAL" | "SUSPICIOUS" | "CLEARED" = "CLEARED";
      let remarks = "";

      if (flightMatch && hotelMatch) {
        riskLevel = "CRITICAL";
        remarks = `WARNING: Passport ${profile.passportNumber} matches active Advance Passenger Processing System (APPS) flights inbound to Bangkok. Simultaneously, TM30 central registry reports hotel log activity matching the alias "${profile.alias}" in Pattaya. IMMEDIATE FIELD INTERVENTION ADVISED.`;
      } else if (flightMatch || hotelMatch) {
        riskLevel = "SUSPICIOUS";
        remarks = `CAUTION: Potential biometric overlap flagged on local border rail. Flight manifest records show standard matches with nationality ${profile.nationality}, but passport ${profile.passportNumber} is currently dormant. High possibility of altered alias travel.`;
      } else {
        riskLevel = "CLEARED";
        remarks = "Biometric check cleared. No active airline manifests, transit files, or TM30 accommodation check-ins match this target's unique identifiers within Thai borders over the last 90 days.";
      }

      setCrossRefReport({ flightMatch, hotelMatch, riskLevel, remarks });
      setCrossRefLoading(false);
    }, 1200);
  };

  // Trigger cross reference automatically on selecting a profile
  useEffect(() => {
    if (selectedProfile) {
      handleCrossReference(selectedProfile);
    } else {
      setCrossRefReport(null);
    }
  }, [selectedProfile]);

  // Submit manual profile
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPassport) return;

    const refNo = `EXT-MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newProfile: GlobalWatchlistProfile = {
      id: Math.random().toString(),
      referenceNumber: refNo,
      name: manualName.toUpperCase(),
      alias: manualAlias ? manualAlias.toUpperCase() : "NONE",
      nationality: manualNation || "Unknown",
      passportNumber: manualPassport.toUpperCase(),
      charges: manualCharges || "Transnational smuggling and local immigration evasion",
      sourceDB: "MANUAL_ENTRY",
      riskScore: Number(manualRisk),
      lastKnownCountry: "In Transit / Thailand Border vicinity",
      status: "WANTED"
    };

    setWatchlist((prev) => [newProfile, ...prev]);
    setSelectedProfile(newProfile);
    setIsFormOpen(false);

    // Reset Form
    setManualName("");
    setManualAlias("");
    setManualNation("");
    setManualPassport("");
    setManualCharges("");
    setManualRisk(70);
  };

  const filteredWatchlist = watchlist.filter((p) => {
    const matchQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.charges.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedDB === "ALL") return matchQuery;
    return p.sourceDB === selectedDB && matchQuery;
  });

  return (
    <div className="bg-[#f0f3f6] p-4 flex flex-col justify-between min-h-full h-auto relative gap-3">
      
      {/* Title block */}
      <div>
        <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-700 animate-pulse" />
            <span className="font-sans text-[11px] font-bold text-slate-800 tracking-wide uppercase">
              GLOBAL WATCHLIST HUB
            </span>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="win7-btn text-[10px] px-2.5 py-1 flex items-center gap-1 font-sans font-medium cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-750" />
            Add Target
          </button>
        </div>

        {/* Global DB Selection & API Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 mb-3.5">
          <div className="md:col-span-7 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Query global agency database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#b9c9d6] text-slate-800 rounded-sm pl-8 pr-3 py-1.5 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-[#3c7fb1] focus:ring-1 focus:ring-[#3c7fb1]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
            />
          </div>
          <div className="md:col-span-5 flex gap-1">
            <select
              value={selectedDB}
              onChange={(e) => setSelectedDB(e.target.value)}
              className="bg-white border border-[#b9c9d6] text-slate-700 rounded-sm px-1.5 py-1 text-[10.5px] font-sans focus:outline-none focus:border-[#3c7fb1] flex-1"
            >
              <option value="ALL">ALL DBs</option>
              <option value="OPENSANCTIONS">OPENSANCTIONS</option>
              <option value="INTERPOL_SLTD">INTERPOL</option>
              <option value="EUROPOL">EUROPOL</option>
              <option value="FBI_MOST_WANTED">FBI MW</option>
              <option value="MANUAL_ENTRY">LOCAL</option>
            </select>
            
            <button
              onClick={handleApiSearch}
              disabled={loading}
              className="win7-btn p-1.5 flex items-center justify-center cursor-pointer"
              title="Query External APIs via Intelligence Core"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-800 ${loading ? "animate-spin text-sky-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* List of profiles with horizontal/compact listing */}
        <div className="max-h-[140px] overflow-y-auto pr-0.5 border border-[#c8cbd1] rounded-sm divide-y divide-[#e2e5e9] bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
          {filteredWatchlist.length > 0 ? (
            filteredWatchlist.map((profile) => {
              const isSelected = selectedProfile?.id === profile.id;
              let dbBadgeColor = "bg-purple-50 text-purple-700 border-purple-200";
              if (profile.sourceDB === "FBI_MOST_WANTED") {
                dbBadgeColor = "bg-blue-50 text-blue-700 border-blue-200";
              } else if (profile.sourceDB === "INTERPOL_SLTD") {
                dbBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (profile.sourceDB === "MANUAL_ENTRY") {
                dbBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
              } else if (profile.sourceDB === "OPENSANCTIONS") {
                dbBadgeColor = "bg-sky-50 text-sky-700 border-sky-200";
              }

              return (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`flex items-center justify-between p-2 text-xs font-sans transition-all duration-100 cursor-pointer border-l-3 ${
                    isSelected
                      ? "bg-[#e2f0fd] border-l-[#3595db] border-t border-b border-t-[#a7d3f8] border-b-[#a7d3f8] text-[#0b2e54]"
                      : "hover:bg-[#f2f7fc] hover:border-l-[#daebfc] border-l-transparent border-t border-b border-transparent text-slate-700"
                  }`}
                >
                  <div className="truncate max-w-[190px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-slate-800 uppercase truncate">
                        {profile.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Nation: {profile.nationality}</span>
                  </div>

                  <div className="text-right flex flex-col gap-0.5 items-end text-[9.5px]">
                    <span className={`px-1.5 py-0.5 rounded border text-[8px] ${dbBadgeColor} font-bold font-mono`}>
                      {profile.sourceDB.replace("_", " ")}
                    </span>
                    <span className="text-[#3c7fb1] font-bold">Risk: {profile.riskScore}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-[11px] font-sans text-slate-400">
              No global watchlist records found.
            </div>
          )}
        </div>
      </div>

      {/* Cross-Reference & Synchronization Dock */}
      {selectedProfile && (
        <div className="mt-4 border-t border-[#d2d2d2] pt-3.5 space-y-3">
          
          {/* Selected Profile Brief */}
          <div className="bg-[#f5f8fa] border border-[#d3dce3] p-3 rounded-md shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Global Watchlist Target</p>
                <h4 className="font-sans text-xs font-bold text-slate-800 uppercase mt-0.5">{selectedProfile.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Passport: <span className="text-slate-800 font-bold font-mono">{selectedProfile.passportNumber}</span></p>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <span className="text-rose-600 font-bold font-mono">{selectedProfile.referenceNumber}</span>
                <p className="mt-0.5 font-sans">Last Seen: {selectedProfile.lastKnownCountry}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 italic leading-relaxed border-t border-[#e2e5e9] pt-1.5 font-sans">
              "{selectedProfile.charges}"
            </p>
            {selectedProfile.sourceDB === "OPENSANCTIONS" && (
              <div className="mt-2 text-[9.5px] border-t border-[#e2e5e9] pt-1.5 flex justify-between items-center font-sans">
                <span className="text-slate-400 font-medium">OpenSanctions Source:</span>
                <a 
                  href={selectedProfile.opensanctionsUrl || "https://www.opensanctions.org/programs/INTERPOL-RN/"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sky-600 hover:underline font-bold flex items-center gap-0.5"
                >
                  View OpenSanctions Program <ArrowRight className="w-2.5 h-2.5 inline shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Cross-Reference Monitor Feed */}
          <div className="bg-white border border-[#c8cbd1] rounded-sm p-2.5 space-y-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between text-[9.5px] font-sans border-b border-[#e2e5e9] pb-1.5">
              <span className="text-slate-500 uppercase flex items-center gap-1 font-semibold">
                <Cpu className="w-3 h-3 text-[#3595db]" />
                Thai Entry-Points Cross-Reference
              </span>
              {crossRefLoading ? (
                <span className="text-[#3595db] animate-pulse flex items-center gap-1 font-bold">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  ANALYZING RADARS
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">CROSS-VERIFIED</span>
              )}
            </div>

            {crossRefLoading ? (
              <div className="py-4 text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3595db] animate-ping mr-2"></span>
                <span className="text-[10px] font-sans text-slate-400">Querying RTP central databases...</span>
              </div>
            ) : crossRefReport ? (
              <div className="space-y-2">
                {/* Vectors indicators */}
                <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-sans">
                  <div className={`p-1.5 rounded-sm border flex items-center justify-between ${
                    crossRefReport.flightMatch 
                      ? "bg-rose-50 border-rose-100 text-rose-600" 
                      : "bg-[#f5f8fa] border-[#e2e5e9] text-slate-400"
                  }`}>
                    <span className="font-medium">APPS FLIGHT:</span>
                    <span className="font-bold">{crossRefReport.flightMatch ? "FLAGGED" : "CLEARED"}</span>
                  </div>
                  <div className={`p-1.5 rounded-sm border flex items-center justify-between ${
                    crossRefReport.hotelMatch 
                      ? "bg-rose-50 border-rose-100 text-rose-600" 
                      : "bg-[#f5f8fa] border-[#e2e5e9] text-slate-400"
                  }`}>
                    <span className="font-medium">TM30 HOTEL:</span>
                    <span className="font-bold">{crossRefReport.hotelMatch ? "FLAGGED" : "CLEARED"}</span>
                  </div>
                </div>

                {/* Risk assessment banner */}
                <div className={`p-2 rounded-sm border text-[10px] font-sans leading-relaxed ${
                  crossRefReport.riskLevel === "CRITICAL" 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : crossRefReport.riskLevel === "SUSPICIOUS"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}>
                  <div className="flex items-center gap-1 font-bold mb-1 uppercase">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Risk Level: {crossRefReport.riskLevel}</span>
                  </div>
                  <p>{crossRefReport.remarks}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sychronize & Simulate control buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onImportToRedNotices(selectedProfile)}
              className="win7-btn text-[10.5px] py-1.5 flex items-center justify-center gap-1 font-bold font-sans text-[#0b2e54] cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-sky-600" />
              Flag Checkpoints
            </button>
            <button
              onClick={() => onSimulatePassportScan(selectedProfile.passportNumber)}
              className="win7-btn-primary text-[10.5px] py-1.5 flex items-center justify-center gap-1 font-bold font-sans text-white cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
              Simulate Scan
            </button>
          </div>

        </div>
      )}

      {/* Manual Entry Modal Form styled as a classic Windows 7 Dialog Box */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-[#f0f3f6] p-5 rounded-md z-50 border border-[#b9c9d6] flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2.5 mb-4">
              <h3 className="font-sans text-xs font-bold text-sky-950 flex items-center gap-1">
                <ClipboardList className="w-4 h-4 text-sky-600" />
                Add Watchlist Target
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 font-sans text-[11px] text-slate-700">
              <div>
                <label className="block text-slate-500 mb-0.5">Suspect Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMANDINE COUTOUR"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 uppercase focus:outline-none focus:border-[#3c7fb1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Passport Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FR402941"
                    value={manualPassport}
                    onChange={(e) => setManualPassport(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 uppercase focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. French"
                    value={manualNation}
                    onChange={(e) => setManualNation(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Alias</label>
                  <input
                    type="text"
                    placeholder="e.g. THE SWIFT"
                    value={manualAlias}
                    onChange={(e) => setManualAlias(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 uppercase focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Risk Score (40-100)</label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={manualRisk}
                    onChange={(e) => setManualRisk(Number(e.target.value))}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Wanted Charges</label>
                <textarea
                  placeholder="Enter specific charges or fugitive search warrants..."
                  value={manualCharges}
                  onChange={(e) => setManualCharges(e.target.value)}
                  className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 h-16 focus:outline-none focus:border-[#3c7fb1] resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 mt-4 border-t border-[#d2d2d2]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="win7-btn px-4 py-1.5 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="win7-btn-primary px-4 py-1.5 font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
