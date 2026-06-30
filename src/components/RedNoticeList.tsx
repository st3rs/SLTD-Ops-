import React, { useState } from "react";
import { RedNotice } from "../types";
import { 
  Search, Plus, ShieldCheck, ShieldAlert, FileText, User, 
  RefreshCw, Send, X, ExternalLink, Globe, Cpu, CheckCircle, Database 
} from "lucide-react";

interface RedNoticeListProps {
  redNotices: RedNotice[];
  selectedNotice: RedNotice | null;
  onSelectNotice: (notice: RedNotice) => void;
  onAddCustomNotice: (notice: RedNotice) => void;
  onTriggerAnalysis: (notice: RedNotice) => Promise<void>;
  analysisLoading: boolean;
  analysisReport: string | null;
}

export default function RedNoticeList({
  redNotices,
  selectedNotice,
  onSelectNotice,
  onAddCustomNotice,
  onTriggerAnalysis,
  analysisLoading,
  analysisReport,
}: RedNoticeListProps) {
  const [activeTab, setActiveTab] = useState<"LOCAL" | "INTERPOL_LIVE">("LOCAL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Custom Profile Form States
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [passport, setPassport] = useState("");
  const [charges, setCharges] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [severity, setSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM">("HIGH");

  // Interpol Live Search States
  const [interpolQuery, setInterpolQuery] = useState("");
  const [interpolLoading, setInterpolLoading] = useState(false);
  const [interpolResults, setInterpolResults] = useState<RedNotice[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [interpolStatusMsg, setInterpolStatusMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !passport || !charges) return;

    const refNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newNotice: RedNotice = {
      id: Math.random().toString(),
      referenceNumber: refNumber,
      name: name.toUpperCase(),
      alias: alias ? alias.toUpperCase() : "UNKNOWN",
      nationality,
      dateOfBirth: dob || "1990-01-01",
      placeOfBirth: "Unknown",
      charges,
      issuingCountry: "INTERPOL GENERAL SECRETARIAT",
      severity,
      status: "ACTIVE",
      photoUrl: "",
      passportNumber: passport.toUpperCase(),
      lastSeenLocation: lastSeen || "Thailand Entry Ports",
    };

    onAddCustomNotice(newNotice);
    
    // Reset Form
    setName("");
    setAlias("");
    setNationality("");
    setDob("");
    setPassport("");
    setCharges("");
    setLastSeen("");
    setSeverity("HIGH");
    setIsAddOpen(false);
  };

  const filteredLocalNotices = redNotices.filter(
    (n) =>
      !n.id.startsWith("interpol-") && (
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.charges.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Live Interpol Database Search
  const handleInterpolSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interpolQuery.trim()) return;

    setInterpolLoading(true);
    setInterpolStatusMsg(null);
    try {
      const response = await fetch(`/api/interpol/official-search?name=${encodeURIComponent(interpolQuery)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notices) {
          setInterpolResults(data.notices);
          if (data.notices.length > 0) {
            handleSelectInterpolNotice(data.notices[0]);
          } else {
            setInterpolStatusMsg("No results found in public Interpol database.");
          }
        } else {
          setInterpolResults([]);
          setInterpolStatusMsg(data.error || "Search returned no active wanted records.");
        }
      } else {
        setInterpolResults([]);
        setInterpolStatusMsg("Official Interpol query gateway is currently overloaded. Please retry.");
      }
    } catch (err) {
      console.error("Live Interpol search error:", err);
      setInterpolStatusMsg("Network connectivity issue communicating with Interpol general servers.");
    } finally {
      setInterpolLoading(false);
    }
  };

  // Live Interpol Detailed Profile Retrieval
  const handleSelectInterpolNotice = async (notice: RedNotice) => {
    if (notice.id.startsWith("interpol-") && notice.entityId) {
      setDetailLoading(true);
      try {
        const response = await fetch(`/api/interpol/official-detail?entityId=${notice.entityId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.detail) {
            const enriched: RedNotice = {
              ...notice,
              alias: data.detail.alias || "NONE REPORTED",
              dateOfBirth: data.detail.dateOfBirth,
              placeOfBirth: data.detail.placeOfBirth,
              charges: data.detail.charges,
              issuingCountry: data.detail.issuingCountry,
              photoUrl: data.detail.photoUrl || notice.photoUrl,
              lastSeenLocation: data.detail.lastSeenLocation,
              physicalDetails: data.detail.physicalDetails,
              interpolUrl: data.detail.interpolUrl
            };
            onSelectNotice(enriched);
          } else {
            onSelectNotice(notice);
          }
        } else {
          onSelectNotice(notice);
        }
      } catch (err) {
        console.error("Error retrieving detailed Interpol notice:", err);
        onSelectNotice(notice);
      } finally {
        setDetailLoading(false);
      }
    } else {
      onSelectNotice(notice);
    }
  };

  // Sync a Live Interpol notice into the active local border checks state
  const handleSyncToLocal = (notice: RedNotice) => {
    const randomPP = notice.passportNumber && notice.passportNumber !== "VERIFIABLE ON EXTRADITION SYSTEM" && notice.passportNumber !== "RETRIEVABLE BY SPECIAL INVESTIGATIONS"
      ? notice.passportNumber 
      : `${notice.nationality.slice(0, 2).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`;

    const syncedNotice: RedNotice = {
      ...notice,
      id: `local-synced-${notice.id}`,
      passportNumber: randomPP,
      alias: notice.alias || "UNKNOWN ALIAS",
      lastSeenLocation: notice.lastSeenLocation || "Thailand Entry Ports",
    };

    onAddCustomNotice(syncedNotice);
    setActiveTab("LOCAL");
    onSelectNotice(syncedNotice);
  };

  return (
    <div className="bg-[#f0f3f6] p-4 flex flex-col justify-between h-full relative">
      <div>
        {/* Header with Title & Action */}
        <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="font-sans text-[11px] font-bold text-slate-800 tracking-wide uppercase">
              WANTED RED NOTICE DIRECTORY
            </span>
          </div>
          {activeTab === "LOCAL" && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="win7-btn text-[10px] px-2.5 py-1 flex items-center gap-1 font-sans font-medium"
            >
              <Plus className="w-3.5 h-3.5 text-sky-700" />
              File Profile
            </button>
          )}
        </div>

        {/* Windows 7 Skeuomorphic Tabs Selection */}
        <div className="flex items-end gap-[2px] border-b border-[#b9c9d6] px-1 mb-3">
          <button
            onClick={() => setActiveTab("LOCAL")}
            className={`px-3 py-1.5 text-[10.5px] font-sans font-bold rounded-t-[5px] border-t-2 transition-all cursor-pointer ${
              activeTab === "LOCAL"
                ? "bg-white border-t-[#3595db] border-l border-r border-[#b9c9d6] text-[#0b2e54] -mb-[1px] pb-[7px]"
                : "bg-[#e5e9ee] border-t-transparent border-l border-r border-transparent text-[#616e7d] hover:bg-[#ebf0f5] hover:text-[#333333] pb-1.5"
            }`}
          >
            Local Blacklist ({filteredLocalNotices.length})
          </button>
          <button
            onClick={() => setActiveTab("INTERPOL_LIVE")}
            className={`px-3 py-1.5 text-[10.5px] font-sans font-bold rounded-t-[5px] border-t-2 transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "INTERPOL_LIVE"
                ? "bg-white border-t-[#3595db] border-l border-r border-[#b9c9d6] text-[#0b2e54] -mb-[1px] pb-[7px]"
                : "bg-[#e5e9ee] border-t-transparent border-l border-r border-transparent text-[#616e7d] hover:bg-[#ebf0f5] hover:text-[#333333] pb-1.5"
            }`}
          >
            Interpol Live Search
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          </button>
        </div>

        {/* Tab content 1: Local Immigration blacklist */}
        {activeTab === "LOCAL" && (
          <div>
            {/* Search Input styled like Windows search */}
            <div className="relative mb-3.5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search local blacklist suspects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#b9c9d6] text-slate-800 rounded-sm pl-8 pr-3 py-1.5 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-[#3c7fb1] focus:ring-1 focus:ring-[#3c7fb1]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
              />
            </div>

            {/* List of Local Notices with Win7 Highlight list design */}
            <div className="max-h-[170px] overflow-y-auto pr-0.5 border border-[#c8cbd1] rounded-sm divide-y divide-[#e2e5e9] bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
              {filteredLocalNotices.length > 0 ? (
                filteredLocalNotices.map((notice) => {
                  const isSelected = selectedNotice?.id === notice.id;
                  return (
                    <div
                      key={notice.id}
                      onClick={() => onSelectNotice(notice)}
                      className={`flex items-center justify-between p-2 text-xs font-sans transition-all duration-100 cursor-pointer border-l-3 ${
                        isSelected
                          ? "bg-[#e2f0fd] border-l-[#3595db] border-t border-b border-t-[#a7d3f8] border-b-[#a7d3f8] text-[#0b2e54]"
                          : "hover:bg-[#f2f7fc] hover:border-l-[#daebfc] border-l-transparent border-t border-b border-transparent text-slate-700"
                      }`}
                    >
                      <div className="truncate max-w-[170px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                            notice.severity === "CRITICAL" ? "bg-rose-500 animate-pulse" :
                            notice.severity === "HIGH" ? "bg-amber-500" : "bg-cyan-500"
                          }`} />
                          <span className="font-bold uppercase truncate text-slate-800">
                            {notice.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{notice.charges}</p>
                      </div>
                      
                      <div className="text-right flex flex-col gap-0.5 text-[9px] font-mono text-slate-500">
                        <span className="text-sky-700 font-bold">{notice.referenceNumber}</span>
                        <span>PP: {notice.passportNumber}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-[11px] font-sans text-slate-400">
                  No suspect files found matching query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content 2: Live official Interpol searching */}
        {activeTab === "INTERPOL_LIVE" && (
          <div>
            {/* Interpol search input and button */}
            <form onSubmit={handleInterpolSearch} className="flex gap-1.5 mb-3.5">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter Lastname (e.g., Chen)..."
                  value={interpolQuery}
                  onChange={(e) => setInterpolQuery(e.target.value)}
                  className="w-full bg-white border border-[#b9c9d6] text-slate-800 rounded-sm pl-8 pr-3 py-1.5 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-[#3c7fb1] focus:ring-1 focus:ring-[#3c7fb1]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                />
              </div>
              <button
                type="submit"
                disabled={interpolLoading}
                className="win7-btn text-[10.5px] font-bold tracking-wide px-3 py-1.5 flex items-center gap-1 cursor-pointer"
              >
                {interpolLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>

            {/* List of Interpol notices */}
            <div className="max-h-[170px] overflow-y-auto pr-0.5 border border-[#c8cbd1] rounded-sm divide-y divide-[#e2e5e9] bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
              {interpolLoading ? (
                <div className="text-center py-8">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-[#3595db] border-t-transparent rounded-full animate-spin mr-2"></span>
                  <span className="text-[11px] font-sans text-slate-400">Connecting to Lyon databases...</span>
                </div>
              ) : interpolResults.length > 0 ? (
                interpolResults.map((notice) => {
                  const isSelected = selectedNotice?.id === notice.id;
                  return (
                    <div
                      key={notice.id}
                      onClick={() => handleSelectInterpolNotice(notice)}
                      className={`flex items-center justify-between p-2.5 text-xs font-sans transition-all duration-100 cursor-pointer border-l-3 ${
                        isSelected
                          ? "bg-[#e2f0fd] border-l-[#3595db] border-t border-b border-t-[#a7d3f8] border-b-[#a7d3f8] text-[#0b2e54]"
                          : "hover:bg-[#f2f7fc] hover:border-l-[#daebfc] border-l-transparent border-t border-b border-transparent text-slate-700"
                      }`}
                    >
                      <div className="truncate max-w-[170px]">
                        <span className="font-bold uppercase text-slate-800 truncate block mb-0.5">
                          {notice.name}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate">Nationality: {notice.nationality}</p>
                      </div>
                      
                      <div className="text-right flex flex-col gap-0.5 text-[9px] text-slate-400">
                        <span className="text-rose-600 font-bold font-mono">{notice.referenceNumber}</span>
                        <span className="text-[8px] bg-rose-50 border border-rose-200 text-rose-600 px-1 rounded uppercase font-bold text-center font-mono">
                          WANTED
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[10.5px] font-sans text-slate-400 px-4 leading-relaxed">
                  {interpolStatusMsg || "Enter target family name (minimum 3 letters) to search Lyon Red Notice repository."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Suspect Operations Dock */}
      <div className="mt-4 border-t border-[#d2d2d2] pt-3.5">
        {selectedNotice ? (
          <div>
            {/* Main Suspect Profile Details Card */}
            <div className="bg-[#f5f8fa] border border-[#d3dce3] p-3 rounded-md mb-3.5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-mono font-bold text-sky-800 uppercase tracking-wide flex items-center gap-1 mb-1">
                    <Cpu className="w-3 h-3 text-sky-500 animate-pulse" />
                    {selectedNotice.id.startsWith("interpol-") ? "Official Interpol Dossier" : "Local Enforcement File"}
                  </p>
                  <h4 className="font-sans text-xs font-bold text-slate-800 uppercase">{selectedNotice.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">Alias: <span className="text-slate-800 font-medium">{selectedNotice.alias}</span></p>
                  <p className="text-[10px] text-slate-500 font-sans">Passport: <span className="text-slate-800 font-bold font-mono">{selectedNotice.passportNumber}</span></p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[8.5px] font-sans font-bold tracking-wide px-2 py-0.5 rounded border uppercase ${
                    selectedNotice.severity === "CRITICAL"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : selectedNotice.severity === "HIGH"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-sky-50 border-sky-200 text-sky-600"
                  }`}>
                    {selectedNotice.severity} THREAT
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Origin: {selectedNotice.nationality}</p>
                </div>
              </div>

              {/* Interpol Physical details display sub-card */}
              {selectedNotice.physicalDetails && (
                <div className="mt-2.5 pt-2 border-t border-[#d3dce3] grid grid-cols-2 gap-1.5 text-[9.5px] font-sans text-slate-500">
                  <div>Height: <span className="text-slate-800 font-bold">{selectedNotice.physicalDetails.height}</span></div>
                  <div>Weight: <span className="text-slate-800 font-bold">{selectedNotice.physicalDetails.weight}</span></div>
                  <div>Eyes Color: <span className="text-slate-800 font-semibold">{selectedNotice.physicalDetails.eyes}</span></div>
                  <div>Hair Color: <span className="text-slate-800 font-semibold">{selectedNotice.physicalDetails.hair}</span></div>
                  <div className="col-span-2 text-[9px] text-slate-400 mt-1 italic">
                    Marks: "{selectedNotice.physicalDetails.distinguishingMarks}"
                  </div>
                </div>
              )}
            </div>

            {/* Context-Specific Operations Actions */}
            {selectedNotice.id.startsWith("interpol-") ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSyncToLocal(selectedNotice)}
                  className="win7-btn text-[10.5px] py-1.5 flex items-center justify-center gap-1 font-bold font-sans text-[#0b2e54] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  Sync to Blacklist
                </button>
                {selectedNotice.interpolUrl ? (
                  <a
                    href={selectedNotice.interpolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="win7-btn text-[10.5px] py-1.5 flex items-center justify-center gap-1 font-bold font-sans text-[#333333] text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    Open Interpol
                  </a>
                ) : (
                  <a
                    href={`https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices`}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="win7-btn text-[10.5px] py-1.5 flex items-center justify-center gap-1 font-bold font-sans text-[#333333] text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    Interpol Web
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={() => onTriggerAnalysis(selectedNotice)}
                disabled={analysisLoading}
                className="w-full win7-btn-primary py-2.5 rounded font-sans text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {analysisLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing suspect records...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    Compile RTP Intelligence Analysis
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-5 bg-[#f5f8fa] border border-dashed border-[#b9c9d6] rounded-md">
            <User className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="text-[10.5px] font-sans text-slate-400">
              Select a suspect above to compile law enforcement countermeasures
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Suspect Modal / Panel overlay styled as Windows dialog box */}
      {isAddOpen && (
        <div className="absolute inset-0 bg-[#f0f3f6] p-5 rounded-md z-50 border border-[#b9c9d6] flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2.5 mb-4">
              <h3 className="font-sans text-xs font-bold text-sky-950 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-sky-600" />
                File Blacklist Entry
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 font-sans text-[11px] text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Suspect Full Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JOHNATHAN SMITH"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 uppercase focus:outline-none focus:border-[#3c7fb1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">Passport Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. US9482914"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 uppercase focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. American"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Primary Charges</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Money Laundering, Transnational Cybercrime"
                  value={charges}
                  onChange={(e) => setCharges(e.target.value)}
                  className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">Last Seen Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Chon Buri (Pattaya)"
                    value={lastSeen}
                    onChange={(e) => setLastSeen(e.target.value)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1.5 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Threat Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-white border border-[#b9c9d6] rounded-sm p-1 text-slate-800 focus:outline-none focus:border-[#3c7fb1]"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 mt-4 border-t border-[#d2d2d2]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
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
