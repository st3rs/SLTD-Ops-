import React, { useState, useEffect } from "react";
import { RedNotice, ChatMessage, Checkpoint, PassportScanResult, GlobalWatchlistProfile, BorderLog } from "./types";
import TacticalMap from "./components/TacticalMap";
import PassportScanner from "./components/PassportScanner";
import RedNoticeList from "./components/RedNoticeList";
import ImmigrationChat from "./components/ImmigrationChat";
import GlobalWatchlist from "./components/GlobalWatchlist";
import LiveFeed from "./components/LiveFeed";
import AeroWindow from "./components/AeroWindow";
import SystemAudit from "./components/SystemAudit";
import { 
  Shield, Eye, ShieldCheck, Database, RefreshCw, FileText, HelpCircle, 
  Power, Globe, Terminal, MapPin, Scan, MessageSquare, Monitor, 
  Trash2, HelpCircle as HelpIcon, Search, Folder, ShieldAlert, AlertCircle, RefreshCw as Spinner, Wifi 
} from "lucide-react";

// Preset Red Notices
const INITIAL_RED_NOTICES: RedNotice[] = [
  {
    id: "notice-1",
    referenceNumber: "CA-99201-F",
    name: "MARCUS ALEXIS VANCE",
    alias: "THE CODER",
    nationality: "Canadian",
    dateOfBirth: "1974-03-29",
    placeOfBirth: "Toronto",
    charges: "Transnational Cryptocurrency Money Laundering & Embezzlement of 4.2B THB from Bangkok digital vaults",
    issuingCountry: "Canada / Royal Thai Police Joint Warrant",
    severity: "CRITICAL",
    status: "ACTIVE",
    photoUrl: "",
    passportNumber: "CA9204183",
    lastSeenLocation: "Chon Buri (Pattaya), Thailand",
  },
  {
    id: "notice-2",
    referenceNumber: "RU-10294-C",
    name: "ELENA VITALEVNA ROSTOVA",
    alias: "SPECTRE",
    nationality: "Russian",
    dateOfBirth: "1993-07-15",
    placeOfBirth: "Vladivostok",
    charges: "Cyber Intrusion into Critical Thai Gateway Infrastructure & Industrial Espionage",
    issuingCountry: "Russian Federation / Interpol Lyon Liaison Office",
    severity: "HIGH",
    status: "ACTIVE",
    photoUrl: "",
    passportNumber: "RU5819033",
    lastSeenLocation: "Chiang Mai Province, Thailand",
  },
  {
    id: "notice-3",
    referenceNumber: "KR-88194-N",
    name: "JIN-WOO PARK",
    alias: "BOSS JIN",
    nationality: "South Korean",
    dateOfBirth: "1980-05-19",
    placeOfBirth: "Busan",
    charges: "Operation of illegal high-volume online gambling ring & smuggling methamphetamine via Maritime ports",
    issuingCountry: "South Korea / NCB Seoul Command",
    severity: "HIGH",
    status: "ACTIVE",
    photoUrl: "",
    passportNumber: "KR2094112",
    lastSeenLocation: "Sukhumvit Road, Bangkok",
  },
  {
    id: "notice-4",
    referenceNumber: "AU-30194-E",
    name: "SOPHIA MERCER",
    alias: "THE BUYER",
    nationality: "Australian",
    dateOfBirth: "1985-09-02",
    placeOfBirth: "Brisbane",
    charges: "International wildlife trafficking & illegal smuggling of protected fauna from Southeast Asia",
    issuingCountry: "Australia / Federal Environmental Protection",
    severity: "MEDIUM",
    status: "ACTIVE",
    photoUrl: "",
    passportNumber: "AU3881944",
    lastSeenLocation: "Koh Samui, Surat Thani",
  }
];

// Preset Checkpoints
const INITIAL_CHECKPOINTS: Checkpoint[] = [
  {
    id: "cp-1",
    name: "Suvarnabhumi Airport (BKK)",
    type: "AIRPORT",
    location: "Samut Prakan, Bangkok",
    activeOfficers: 142,
    status: "NORMAL",
    dailyChecks: 42104,
    recentFlagsCount: 14,
    coords: { x: 45, y: 35 },
  },
  {
    id: "cp-2",
    name: "Don Mueang Airport (DMK)",
    type: "AIRPORT",
    location: "Don Mueang, Bangkok",
    activeOfficers: 64,
    status: "ALERT",
    dailyChecks: 18940,
    recentFlagsCount: 8,
    coords: { x: 42, y: 28 },
  },
  {
    id: "cp-3",
    name: "Phuket Intl Airport (HKT)",
    type: "AIRPORT",
    location: "Thalang, Phuket",
    activeOfficers: 78,
    status: "NORMAL",
    dailyChecks: 14890,
    recentFlagsCount: 3,
    coords: { x: 26, y: 78 },
  },
  {
    id: "cp-4",
    name: "Aranyaprathet Border Checkpoint",
    type: "LAND_BORDER",
    location: "Sa Kaeo, Cambodia Border",
    activeOfficers: 42,
    status: "ALERT",
    dailyChecks: 6200,
    recentFlagsCount: 11,
    coords: { x: 68, y: 45 },
  },
  {
    id: "cp-5",
    name: "Padang Besar Rail Crossing",
    type: "LAND_BORDER",
    location: "Songkhla, Malaysia Border",
    activeOfficers: 35,
    status: "NORMAL",
    dailyChecks: 4800,
    recentFlagsCount: 5,
    coords: { x: 34, y: 92 },
  }
];

// Seed data for live stream logs
const LOGS_CHANNELS = ["BKK-T2-G21", "DMK-T1-G05", "HKT-T1-PORTAL", "ARY-LAND-CHECK", "PDB-RAIL-BORDER", "CNX-INBOUND"];
const LOGS_SURNAMES = ["SMITH", "CHEN", "JOHANSSON", "MULLER", "YAMAMOTO", "NGUYEN", "SILVA", "KHAN", "GARCIA", "MEIER"];
const LOGS_GIVEN_NAMES = ["Robert", "Li", "Aria", "Hans", "Kenji", "Tran", "Lucas", "Aaliyah", "Sofia", "Thomas"];
const LOGS_NATIONALITIES = ["USA", "China", "Sweden", "Germany", "Japan", "Vietnam", "Brazil", "India", "Spain", "Swiss"];

const generateRandomLogHelper = (): BorderLog => {
  const channel = LOGS_CHANNELS[Math.floor(Math.random() * LOGS_CHANNELS.length)];
  const surname = LOGS_SURNAMES[Math.floor(Math.random() * LOGS_SURNAMES.length)];
  const givenName = LOGS_GIVEN_NAMES[Math.floor(Math.random() * LOGS_GIVEN_NAMES.length)];
  const nationality = LOGS_NATIONALITIES[Math.floor(Math.random() * LOGS_NATIONALITIES.length)];
  const id = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;
  const timestamp = new Date().toLocaleTimeString();

  const roll = Math.random();
  let status: "PASSED" | "FLAGGED" | "DETAINED" = "PASSED";
  let actionTaken = "Clearance Authorized - Passport Returned";

  if (roll > 0.94) {
    status = "DETAINED";
    actionTaken = "Biometric Lockout - Isolated to Holding Unit";
  } else if (roll > 0.85) {
    status = "FLAGGED";
    actionTaken = "Alphanumeric Blacklist Hit - Forwarded to NCB Bangkok";
  }

  return {
    id,
    timestamp,
    location: channel,
    passengerName: `${surname} ${givenName.toUpperCase()}`,
    nationality,
    status,
    actionTaken,
  };
};

export default function App() {
  const [redNotices, setRedNotices] = useState<RedNotice[]>(INITIAL_RED_NOTICES);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(INITIAL_CHECKPOINTS);
  const [selectedNotice, setSelectedNotice] = useState<RedNotice | null>(INITIAL_RED_NOTICES[0]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(INITIAL_CHECKPOINTS[0]);
  
  // Live Feed Log Stream State
  const [logs, setLogs] = useState<BorderLog[]>([]);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "SYSTEM",
      text: "SECURE TUNNEL ESTABLISHED WITH ROYAL THAI POLICE NCB BANGKOK",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "init-2",
      sender: "AGENT",
      text: "Sawatdee khrap. I am Officer Somchai, Senior Coordinator at the Joint Interpol Response Division, Bangkok. I have loaded active Red Notice warrants for Marcus Vance, Elena Rostova, and Jin-Woo Park. Select any fugitive and click 'Compile Joint Analysis' for customized immigration countermeasures or query me directly.",
      timestamp: new Date().toLocaleTimeString(),
      officerName: "Officer Somchai",
      badgeNumber: "RTP-IMM-9842",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Intel Analysis State
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);

  // Time Tracker State
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  // Start Menu and Desktop UI States
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [startSearchText, setStartSearchText] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [recycleBinFull, setRecycleBinFull] = useState(true);
  const [showDesktop, setShowDesktop] = useState(false);
  
  // Immersive Shut Down Easter Egg States: "ACTIVE" | "LOGGING_OFF" | "SHUTDOWN" | "OFF"
  const [shutdownState, setShutdownState] = useState<"ACTIVE" | "LOGGING_OFF" | "SHUTDOWN" | "OFF">("ACTIVE");

  useEffect(() => {
    // Tick current time formatted exactly like Windows 7 Tray
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stream Live Access Logs (Lipped Stream State)
  useEffect(() => {
    // Generate 5 initial seeds
    const initialSeeds: BorderLog[] = [];
    for (let i = 0; i < 5; i++) {
      const log = generateRandomLogHelper();
      const now = new Date();
      now.setSeconds(now.getSeconds() - (i * 45));
      log.timestamp = now.toLocaleTimeString();
      initialSeeds.push(log);
    }
    setLogs(initialSeeds);

    // Set interval to append a new log every 6 seconds, keeping max 30 logs in history
    const logInterval = setInterval(() => {
      const newLog = generateRandomLogHelper();
      setLogs((prev) => [newLog, ...prev.slice(0, 29)]);
    }, 6000);

    return () => clearInterval(logInterval);
  }, []);

  // Sync state if user clicks or scans a suspect passport
  const handleScanResult = (result: PassportScanResult) => {
    // Add system notification in chat log
    const systemMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "SYSTEM",
      text: `PASSPORT SCANNED AT PORT: ${result.passportNumber} (${result.fullName})`,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // Find matching notice
    const matchingNotice = redNotices.find(
      (n) => n.passportNumber.toLowerCase() === result.passportNumber.toLowerCase()
    );

    let responseMsg: ChatMessage;
    if (matchingNotice) {
      // Auto-select suspect
      setSelectedNotice(matchingNotice);
      
      responseMsg = {
        id: Math.random().toString(),
        sender: "AGENT",
        text: `ALERT! Automated biometric gate scan detected Red Notice suspect ${result.fullName} attempting to present travel documents! This matches active NCB Bangkok Special File ${matchingNotice.referenceNumber}. Gate has been locked down and active duty response teams are deploying to the terminal. Officer, let's execute the extradition arrest playbook.`,
        timestamp: new Date().toLocaleTimeString(),
        officerName: "Officer Somchai",
        badgeNumber: "RTP-IMM-9842",
      };
      
      // Upgrade selected checkpoint status temporarily to showcase alert
      if (selectedCheckpoint) {
        setCheckpoints(prev => prev.map(cp => {
          if (cp.id === selectedCheckpoint.id) {
            return { ...cp, status: "LOCKED", recentFlagsCount: cp.recentFlagsCount + 1 };
          }
          return cp;
        }));
      }
    } else {
      responseMsg = {
        id: Math.random().toString(),
        sender: "AGENT",
        text: `Passport ${result.passportNumber} (${result.fullName}) has been processed successfully. RFID chip certificates match, face match score is ${result.biometricMatch}%, and no entries were found in either the RTP Central Blacklist or the Interpol SLTD database. Clearance authorized.`,
        timestamp: new Date().toLocaleTimeString(),
        officerName: "Officer Somchai",
        badgeNumber: "RTP-IMM-9842",
      };
    }

    setChatHistory((prev) => [...prev, systemMsg, responseMsg]);

    // Append scanned passport to stream logs so it appears in Live Feed and System Audit!
    const scanLog: BorderLog = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleTimeString(),
      location: selectedCheckpoint ? selectedCheckpoint.name.split(" (")[0].split(" Border")[0] : "APPS GATEWAY",
      passengerName: result.fullName,
      nationality: result.nationality,
      status: matchingNotice 
        ? (matchingNotice.severity === "CRITICAL" ? "DETAINED" : "FLAGGED") 
        : "PASSED",
      actionTaken: matchingNotice 
        ? (matchingNotice.severity === "CRITICAL" 
            ? "Biometric Lockout - Target Apprehended" 
            : "Alphanumeric Blacklist Hit - Forwarded to NCB Bangkok") 
        : "Clearance Authorized - Passport Returned"
    };
    setLogs((prev) => [scanLog, ...prev.slice(0, 29)]);
  };

  // Connect to the simulated Thai Immigration Bureau Agent
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "USER",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          currentSuspect: selectedNotice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive secure transmission.");
      }

      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "AGENT",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
        officerName: data.officerName || "Officer Somchai",
        badgeNumber: data.badgeNumber || "RTP-IMM-9842",
      };

      setChatHistory((prev) => [...prev, agentMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "AGENT",
        text: "SECURE CHANNEL TIMEOUT. Failsafe activated: please verify network routing or re-trigger transmission.",
        timestamp: new Date().toLocaleTimeString(),
        officerName: "RTP-IMM System Security Office",
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Compile Royal Thai Police joint Analysis
  const handleTriggerAnalysis = async (notice: RedNotice) => {
    setAnalysisLoading(true);
    setAnalysisReport(null);
    setAnalysisSource(null);

    try {
      const response = await fetch("/api/interpol/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspect: notice }),
      });

      if (!response.ok) {
        throw new Error("Failed to gather intelligence data.");
      }

      const data = await response.json();
      setAnalysisReport(data.report);
      setAnalysisSource(data.source);

      // Add coordinate log to chat
      const systemAlert: ChatMessage = {
        id: Math.random().toString(),
        sender: "SYSTEM",
        text: `INTELLIGENCE ADVISORY COMPILED FOR CASE ${notice.referenceNumber}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory((prev) => [...prev, systemAlert]);

      // Automatically scroll to the dossier window
      const el = document.getElementById("dossier-window");
      if (el) el.scrollIntoView({ behavior: "smooth" });

    } catch (e) {
      console.error(e);
      setAnalysisReport("Failed to generate report. Please check server status.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAddCustomNotice = (newNotice: RedNotice) => {
    setRedNotices((prev) => [newNotice, ...prev]);
    setSelectedNotice(newNotice);

    // Alert in chat
    const alertMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "SYSTEM",
      text: `ADDED NEW TARGET PROFILE TO LOCAL SYNC: ${newNotice.name} (${newNotice.passportNumber})`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory((prev) => [...prev, alertMsg]);
  };

  const handleImportToRedNotices = (profile: GlobalWatchlistProfile) => {
    const exists = redNotices.some(n => n.passportNumber.toLowerCase() === profile.passportNumber.toLowerCase());
    if (exists) {
      setChatHistory(prev => [...prev, {
        id: Math.random().toString(),
        sender: "SYSTEM",
        text: `IMPORT ABORTED: ${profile.name} IS ALREADY FLAGGED IN ACTIVE BORDER DATABASES.`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      return;
    }

    const newNotice: RedNotice = {
      id: `notice-${Math.random().toString()}`,
      referenceNumber: profile.referenceNumber,
      name: profile.name,
      alias: profile.alias,
      nationality: profile.nationality,
      dateOfBirth: "1985-01-01",
      placeOfBirth: "Unknown",
      charges: profile.charges,
      issuingCountry: profile.sourceDB === "EUROPOL" ? "EUROPOL LIAISON" : profile.sourceDB === "FBI_MOST_WANTED" ? "FBI WASHINGTON" : profile.sourceDB === "OPENSANCTIONS" ? "OPENSANCTIONS (INTERPOL-RN)" : "INTERPOL GENERAL SECRETARIAT",
      severity: profile.riskScore > 85 ? "CRITICAL" : profile.riskScore > 65 ? "HIGH" : "MEDIUM",
      status: "ACTIVE",
      photoUrl: "",
      passportNumber: profile.passportNumber,
      lastSeenLocation: profile.lastKnownCountry,
    };

    setRedNotices(prev => [newNotice, ...prev]);
    setSelectedNotice(newNotice);

    setChatHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "SYSTEM",
        text: `IMPORTED GLOBAL PROFILE: ${profile.name} (${profile.passportNumber}) SYNCED TO Checkpoints.`,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: Math.random().toString(),
        sender: "AGENT",
        text: `NCB Bangkok confirms receipt of Global Watchlist file for ${profile.name}. Passport ${profile.passportNumber} has been uploaded to the Advance Passenger Processing System (APPS) for all terminals. Frontline officers have been deployed.`,
        timestamp: new Date().toLocaleTimeString(),
        officerName: "Officer Somchai",
        badgeNumber: "RTP-IMM-9842",
      }
    ]);
  };

  const handleSimulatePassportScan = (passportNumber: string) => {
    const matchingNotice = redNotices.find(n => n.passportNumber.toLowerCase() === passportNumber.toLowerCase());
    
    let fullName = "TARGET INCOGNITO";
    let nationality = "Unknown";
    let dob = "1985-01-01";
    let blacklistStatus: "FLAGGED_INTERPOL" | "FLAGGED_LOCAL" | "CLEARED" = "FLAGGED_INTERPOL";
    let remarks = `CRITICAL DETECT: Passport ${passportNumber} matches active international watchlists.`;

    if (matchingNotice) {
      fullName = matchingNotice.name;
      nationality = matchingNotice.nationality;
      dob = matchingNotice.dateOfBirth;
      remarks = `CRITICAL DETECT: Matches Red Notice ${matchingNotice.referenceNumber} (${matchingNotice.name}).`;
    }

    const result: PassportScanResult = {
      passportNumber,
      fullName,
      nationality,
      dob,
      gender: "M",
      expiryDate: "2031-12-31",
      mrzMatch: true,
      biometricMatch: 97,
      blacklistStatus,
      remarks
    };

    handleScanResult(result);
  };

  // Helper function to focus and scroll to elements
  const navigateToComponent = (id: string) => {
    setStartMenuOpen(false);
    setShowDesktop(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Add brief green border glow effect
      element.classList.add("ring-4", "ring-sky-400", "transition-all");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-sky-400");
      }, 1500);
    }
  };

  // Immersive Shut Down sequence triggers
  const handleShutdownTrigger = () => {
    setStartMenuOpen(false);
    setShutdownState("LOGGING_OFF");
    
    setTimeout(() => {
      setShutdownState("SHUTDOWN");
      setTimeout(() => {
        setShutdownState("OFF");
      }, 2000);
    }, 2000);
  };

  const handleRestartSystem = () => {
    setShutdownState("ACTIVE");
    // Seed system log
    setChatHistory(prev => [...prev, {
      id: Math.random().toString(),
      sender: "SYSTEM",
      text: "NCB PORTAL failsafe reboot authorized. Terminal successfully synchronized.",
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Programs for Start Menu
  const START_MENU_PROGRAMS = [
    { name: "Red Notice Database Explorer", id: "red-notice-window", desc: "Manage wanted criminal dossiers", icon: <Shield className="w-5 h-5 text-rose-600" /> },
    { name: "Global Watchlist Core Sync", id: "watchlist-window", desc: "Query Europol, Interpol & FBI live API", icon: <Globe className="w-5 h-5 text-sky-600" /> },
    { name: "Biometric Passport Chip Scanner", id: "scanner-window", desc: "Read passport RFID MRZ certificates", icon: <Scan className="w-5 h-5 text-emerald-600" /> },
    { name: "Border Control live Matrix Map", id: "map-window", desc: "Interactive geographic tactical grid", icon: <MapPin className="w-5 h-5 text-orange-500" /> },
    { name: "Joint Operations Chat Terminal", id: "chat-window", desc: "AES-256 secure channel with BKK Command", icon: <MessageSquare className="w-5 h-5 text-indigo-500" /> },
    { name: "Immigration Security Logs Stream", id: "logs-window", desc: "Real-time entry-point telemetry logs", icon: <Terminal className="w-5 h-5 text-slate-700" /> },
    { name: "System Compliance Audit Center", id: "audit-window", desc: "Generates official government compliance security reports", icon: <FileText className="w-5 h-5 text-violet-600" /> }
  ];

  const filteredPrograms = START_MENU_PROGRAMS.filter(p => 
    p.name.toLowerCase().includes(startSearchText.toLowerCase())
  );

  // If system is powered down
  if (shutdownState === "LOGGING_OFF") {
    return (
      <div className="fixed inset-0 bg-[#0a4c95] z-[100] flex flex-col items-center justify-center text-white font-sans selection:bg-transparent">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <h1 className="text-xl font-medium tracking-wide font-sans mt-2 aero-text-glow-dark" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            Logging off...
          </h1>
          <p className="text-xs text-blue-200/80 font-sans">Saving custom border configurations</p>
        </div>
      </div>
    );
  }

  if (shutdownState === "SHUTDOWN") {
    return (
      <div className="fixed inset-0 bg-[#0a4c95] z-[100] flex flex-col items-center justify-center text-white font-sans selection:bg-transparent">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <h1 className="text-xl font-medium tracking-wide font-sans mt-2 aero-text-glow-dark" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            Shutting down...
          </h1>
          <p className="text-xs text-blue-200/80 font-sans">Powering down Royal Thai Police Connection terminal</p>
        </div>
      </div>
    );
  }

  if (shutdownState === "OFF") {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-green-500 font-mono p-6">
        <div className="max-w-md text-left space-y-4">
          <p className="text-[#be1e1e] font-bold text-lg animate-pulse">*** RTP TERMINAL OFFLINE ***</p>
          <p className="text-slate-500 text-xs">
            Connection socket closed safely. Cryptographic session keys flushed. Biometric peripheral readers decoupled. All systems dormant.
          </p>
          <div className="pt-6 text-center">
            <button
              onClick={handleRestartSystem}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 px-4 py-2.5 rounded font-bold text-xs cursor-pointer tracking-wider font-mono animate-bounce"
            >
              BOOT RTP TERMINAL (FAILSAFE)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] overflow-hidden xp-desktop-bg text-slate-800 flex flex-col font-sans select-none pb-12 selection:bg-blue-600/30">
      
      {/* 1. DESKTOP WORKSPACE (Grid layout containing explorer windows and desktop files) */}
      <div className="flex-1 p-3 md:p-5 relative overflow-y-auto overflow-x-hidden w-full">

        {/* Desktop Icons Row (Vertical Left-side rail on desktop, horizontal scrollable row on mobile) */}
        <div className="flex md:flex-col gap-3 md:gap-5 pb-4 md:pb-0 mb-2 md:mb-0 w-full md:w-auto overflow-x-auto md:overflow-visible scrollbar-none shrink-0 md:absolute md:top-5 md:left-5 z-10 select-none">
          {/* My Computer */}
          <div 
            onClick={() => navigateToComponent("red-notice-window")}
            className="w-[74px] shrink-0 flex flex-col items-center text-center cursor-pointer group rounded-sm p-1 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
          >
            <div className="p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <Monitor className="w-8 h-8 text-sky-100 shrink-0" />
            </div>
            <span className="text-[10px] text-white font-sans font-medium tracking-wide mt-1 aero-text-glow-dark text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              My Computer
            </span>
          </div>

          {/* RTP Central Database Link */}
          <div 
            onClick={() => navigateToComponent("watchlist-window")}
            className="w-[74px] shrink-0 flex flex-col items-center text-center cursor-pointer group rounded-sm p-1 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
          >
            <div className="p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <Database className="w-8 h-8 text-emerald-400 shrink-0" />
            </div>
            <span className="text-[10px] text-white font-sans font-medium tracking-wide mt-1 aero-text-glow-dark text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              RTP Central Vault
            </span>
          </div>

          {/* Recycle Bin */}
          <div 
            onClick={() => {
              if (recycleBinFull) {
                setRecycleBinFull(false);
                setChatHistory(prev => [...prev, {
                  id: Math.random().toString(),
                  sender: "SYSTEM",
                  text: "Recycle Bin cleared: Deleted 48 cached alphanumeric trace files.",
                  timestamp: new Date().toLocaleTimeString()
                }]);
              }
            }}
            className="w-[74px] shrink-0 flex flex-col items-center text-center cursor-pointer group rounded-sm p-1 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
            title={recycleBinFull ? "Click to empty Recycle Bin" : "Recycle Bin is empty"}
          >
            <div className="p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <Trash2 className={`w-8 h-8 ${recycleBinFull ? "text-amber-300" : "text-sky-200/55"} shrink-0`} />
            </div>
            <span className="text-[10px] text-white font-sans font-medium tracking-wide mt-1 aero-text-glow-dark text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {recycleBinFull ? "Recycle Bin (Full)" : "Recycle Bin (Empty)"}
            </span>
          </div>

          {/* Help Manual */}
          <div 
            onClick={() => setHelpOpen(true)}
            className="w-[74px] shrink-0 flex flex-col items-center text-center cursor-pointer group rounded-sm p-1 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
          >
            <div className="p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <HelpIcon className="w-8 h-8 text-sky-300 shrink-0" />
            </div>
            <span className="text-[10px] text-white font-sans font-medium tracking-wide mt-1 aero-text-glow-dark text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Read Help Manual
            </span>
          </div>

          {/* System Security Audit */}
          <div 
            onClick={() => navigateToComponent("audit-window")}
            className="w-[74px] shrink-0 flex flex-col items-center text-center cursor-pointer group rounded-sm p-1 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
            title="System Compliance Audit Specialist"
          >
            <div className="p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <FileText className="w-8 h-8 text-violet-400 shrink-0" />
            </div>
            <span className="text-[10px] text-white font-sans font-medium tracking-wide mt-1 aero-text-glow-dark text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              System Audit
            </span>
          </div>
        </div>

        {/* MAIN APPLICATION STAGE WINDOWS GRID */}
        {!showDesktop ? (
          <div className="max-w-[1550px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pl-0 md:pl-24 transition-all">
            
            {/* WINDOW 1: Red Notice Directory (Col Span: 4) */}
            <div id="red-notice-window" className="lg:col-span-4 lg:h-[800px] min-h-[500px] flex flex-col scroll-mt-4">
              <AeroWindow
                title="Red Notice Directory - C:\RTP_NCB\Fugitives"
                path="C:\RTP_NCB\RedNotices"
                icon={<Shield className="w-4 h-4 text-rose-600" />}
                statusText={`${redNotices.length} criminal files loaded`}
              >
                <RedNoticeList
                  redNotices={redNotices}
                  selectedNotice={selectedNotice}
                  onSelectNotice={setSelectedNotice}
                  onAddCustomNotice={handleAddCustomNotice}
                  onTriggerAnalysis={handleTriggerAnalysis}
                  analysisLoading={analysisLoading}
                  analysisReport={analysisReport}
                />
              </AeroWindow>
            </div>

            {/* WINDOW 2: Global Watchlist Hub (Col Span: 4) */}
            <div id="watchlist-window" className="lg:col-span-4 lg:h-[800px] min-h-[500px] flex flex-col scroll-mt-4">
              <AeroWindow
                title="Global Watchlist Hub - C:\Watchlist"
                path="C:\Immigration\GlobalWatchlist"
                icon={<Globe className="w-4 h-4 text-sky-600" />}
                statusText="Synchronized with Lyon databases"
              >
                <GlobalWatchlist
                  onImportToRedNotices={handleImportToRedNotices}
                  onSimulatePassportScan={handleSimulatePassportScan}
                />
              </AeroWindow>
            </div>

            {/* WINDOW 3: Tactical Border Controls live Matrix & Passport Scanner (Col Span: 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              <div id="map-window" className="scroll-mt-4">
                <AeroWindow
                  title="Border Checkpoints live Map - C:\LiveMap"
                  path="C:\Immigration\Command\BorderMap"
                  icon={<MapPin className="w-4 h-4 text-orange-500" />}
                  statusText={`${checkpoints.length} Live Checkpoints Online`}
                >
                  <TacticalMap
                    checkpoints={checkpoints}
                    selectedCheckpoint={selectedCheckpoint}
                    onSelectCheckpoint={setSelectedCheckpoint}
                  />
                </AeroWindow>
              </div>

              <div id="scanner-window" className="scroll-mt-4">
                <AeroWindow
                  title="Biometric Passport Scanner - C:\Biometrics"
                  path="C:\Immigration\Devices\PassportScanner"
                  icon={<Scan className="w-4 h-4 text-emerald-600" />}
                  statusText="APPS Device Driver v7.1 Ready"
                >
                  <PassportScanner
                    onScanComplete={handleScanResult}
                    activeRedNotices={redNotices}
                  />
                </AeroWindow>
              </div>

            </div>

            {/* WINDOW 4: Secure Communications Chat (Col Span: 4) */}
            <div id="chat-window" className="lg:col-span-4 lg:h-[480px] min-h-[420px] flex flex-col scroll-mt-4">
              <AeroWindow
                title="Joint NCB Operations Chat Terminal - C:\NCB_Chat"
                path="C:\RTP_NCB\Communications"
                icon={<MessageSquare className="w-4 h-4 text-indigo-500" />}
                statusText="AES-256 Secure Channel"
              >
                <ImmigrationChat
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  loading={chatLoading}
                  activeSuspect={selectedNotice}
                />
              </AeroWindow>
            </div>

            {/* WINDOW 5: National Checkpoint Stream Logs (Col Span: 8) */}
            <div id="logs-window" className="lg:col-span-8 lg:h-[480px] min-h-[280px] flex flex-col scroll-mt-4">
              <AeroWindow
                title="Passenger Immigration Logs (Stream)"
                path="C:\Immigration\SecurityLogs"
                icon={<Terminal className="w-4 h-4 text-slate-700" />}
                statusText="Real-time Stream Active"
              >
                <LiveFeed logs={logs} />
              </AeroWindow>
            </div>

            {/* WINDOW 7: System Compliance Audit Specialist (Col Span: 12) */}
            <div id="audit-window" className="col-span-12 lg:h-[620px] min-h-[450px] flex flex-col scroll-mt-4">
              <AeroWindow
                title="System Compliance Audit Center"
                path="C:\Immigration\Audit"
                icon={<FileText className="w-4 h-4 text-violet-600" />}
                statusText="RTP Compliance Specialist Online"
              >
                <SystemAudit 
                  logs={logs} 
                  onAddSystemMessage={(text) => {
                    setChatHistory((prev) => [...prev, {
                      id: Math.random().toString(),
                      sender: "SYSTEM",
                      text,
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                  }}
                />
              </AeroWindow>
            </div>

            {/* WINDOW 6: Intelligence dossier (Row span: 12, triggers on compiles) */}
            {analysisReport && (
              <div id="dossier-window" className="col-span-12 min-h-[450px] flex flex-col scroll-mt-4">
                <AeroWindow
                  title="RTP Joint Intelligence Advisory Dossier"
                  path="C:\RTP_NCB\Intelligence\Dossiers"
                  icon={<FileText className="w-4 h-4 text-rose-600" />}
                  statusText="Classified Law Enforcement Document"
                  onClose={() => setAnalysisReport(null)}
                >
                  <div className="bg-[#f0f3f6] p-4 flex flex-col justify-between h-full font-sans text-slate-800">
                    <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-600 animate-pulse" />
                        <div>
                          <h3 className="font-sans text-xs font-bold text-sky-950 uppercase">
                            JOINT COUNTER-MEASURES ADVISORY DOSSIER
                          </h3>
                          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            SOURCE COGNITION CORE: <span className="text-sky-700 font-bold">{analysisSource || "Gemini Intel Core"}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnalysisReport(null)}
                        className="win7-btn text-[10px] px-2.5 py-1 font-sans font-bold cursor-pointer"
                      >
                        Close Dossier
                      </button>
                    </div>

                    <div className="bg-white border border-[#c8cbd1] rounded-sm p-4 text-xs font-mono leading-relaxed text-slate-700 max-h-[350px] overflow-y-auto shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] whitespace-pre-wrap">
                      {analysisReport}
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                        CLASSIFIED MATERIAL • OFFICIAL USE ONLY • ROYAL THAI POLICE SPECIAL LIAISON BRANCH
                      </span>
                    </div>
                  </div>
                </AeroWindow>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 p-5 rounded-lg text-center text-white max-w-sm">
              <h2 className="text-base font-bold aero-text-glow-dark font-sans" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>Desktop Mode Active</h2>
              <p className="text-xs text-sky-100/80 mt-1 font-sans">All window clients minimized. Click the thin button in the bottom-right corner or program pins on the taskbar to restore explorer windows.</p>
              <button 
                onClick={() => setShowDesktop(false)} 
                className="mt-4 win7-btn text-xs px-4 py-1.5"
              >
                Restore Windows
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 2. READ MANUAL HELP DIALOG PANEL (Classic Windows Help File Overlay) */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm select-none">
          <div className="w-full max-w-[420px] bg-white rounded-t-lg rounded-b-md shadow-2xl border border-sky-400/50 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400/80 to-sky-600/70 p-2.5 px-4.5 flex items-center justify-between text-white border-b border-white/20">
              <span className="font-sans text-xs font-bold flex items-center gap-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                <HelpIcon className="w-4 h-4 text-white" />
                Windows Help and Support
              </span>
              <button 
                onClick={() => setHelpOpen(false)}
                className="text-white hover:bg-rose-600 rounded-sm p-0.5 px-1.5 text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 font-sans text-xs text-slate-700 leading-normal space-y-3.5 max-h-[350px] overflow-y-auto">
              <h3 className="font-sans text-sm font-bold text-sky-950">RTP-IMM Interpol Portal Manual</h3>
              <p>Welcome to the secure border coordination client. This specialized terminal connects Royal Thai Police (RTP) databases with Lyon Interpol General databases.</p>
              
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-sm space-y-1">
                <strong className="text-sky-950 font-bold block">How to scan Biometric Passports:</strong>
                <p>1. Go to the <strong className="text-slate-800">Biometric Passport Scanner</strong> window.</p>
                <p>2. Select a travel document from the presets (such as Canadian fugitive <strong className="text-slate-800">VANCE MARCUS</strong>).</p>
                <p>3. Click <strong className="text-emerald-700">EXECUTE CHIP READER</strong> to simulate the RFID contactless clearance scan.</p>
                <p>4. Secure gate locks triggers and alerts dispatch to our Somchai advisor agent immediately!</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-1">
                <strong className="text-slate-800 font-bold block">Interpol Live Search features:</strong>
                <p>1. Toggle the <strong className="text-slate-800">Interpol Live Search</strong> tab inside the Wanted Directory.</p>
                <p>2. Enter a family name query (e.g. "Chen" or "Rostova") to fetch official live warrants.</p>
                <p>3. Click <strong className="text-sky-800">Sync to Blacklist</strong> to upload their travel records immediately into current APPS border checks.</p>
              </div>
            </div>
            <div className="bg-[#f0f3f6] border-t border-[#d2d2d2] p-3 text-right">
              <button 
                onClick={() => setHelpOpen(false)}
                className="win7-btn px-4.5 py-1.5 font-sans font-bold text-xs cursor-pointer"
              >
                Close Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WINDOWS XP LUNA BLUE TASKBAR & SYSTEM START MENU - Rebuilt for Tactical Command Theme */}
      <div className="fixed bottom-0 left-0 right-0 h-[40px] xp-taskbar z-50 flex items-center justify-between overflow-visible select-none">
        
        {/* START BUTTON & ACTIVE PROGRAMS */}
        <div className="flex items-center h-full gap-2 overflow-hidden flex-1">
          {/* Classic Windows XP Start Button styled for Interpol */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`xp-start-btn h-full px-4 md:px-5 flex items-center gap-1.5 md:gap-2 cursor-pointer transition-all shrink-0 ${
              startMenuOpen ? "brightness-95 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]" : ""
            }`}
          >
            <Shield className="w-4 h-4 text-amber-500 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)] shrink-0 animate-pulse" />
            <span 
              className="text-white font-mono font-bold text-[12.5px] uppercase tracking-wider select-none drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]"
            >
              interpol
            </span>
          </button>
 
          {/* Quick Launch & Active Tasks Separator */}
          <div className="h-6 w-[2px] border-r border-[#101726] border-l border-[#2e3b56] mx-0.5 md:mx-1 shrink-0" />
 
          {/* Taskbar Active Program Buttons */}
          <div className="flex items-center h-full gap-1.5 px-1 py-1 overflow-x-auto scrollbar-none flex-1">
            {/* Show Desktop Button as a Quick Launch shortcut */}
            <button
              onClick={() => setShowDesktop(!showDesktop)}
              title="Show Desktop Grid"
              className={`w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-white/10 active:bg-black/20 border border-transparent hover:border-white/5 shrink-0 ${
                showDesktop ? "bg-black/30 border-[#1e293b]" : ""
              }`}
            >
              <Monitor className="w-4 h-4 text-slate-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
            </button>
 
            {START_MENU_PROGRAMS.map((prog) => {
              const elementActive = !showDesktop;
              return (
                <button
                  key={prog.id}
                  onClick={() => navigateToComponent(prog.id)}
                  title={prog.name}
                  className={`h-7 px-3 rounded-[2px] border flex items-center gap-1.5 cursor-pointer max-w-[150px] truncate select-none text-left transition-all shrink-0 ${
                    elementActive 
                      ? "bg-[#152238] border-[#0a0f1d] border-b-[#38bdf8] border-r-[#38bdf8] text-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)] font-bold font-mono" 
                      : "bg-[#0f172a] border-[#1e293b] border-b-[#090d16] border-r-[#090d16] hover:bg-[#1e293b] text-slate-300"
                  }`}
                >
                  <span className="scale-75 shrink-0 opacity-90">{prog.icon}</span>
                  <span className="text-[10px] truncate font-mono font-bold leading-tight drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">{prog.name.split(" - ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
 
        {/* SYSTEM TRAY & DATE CLOCK DISPLAY */}
        <div className="xp-tray h-full flex items-center gap-2 md:gap-3 px-2 md:px-4.5 select-none text-slate-300 shrink-0">
          {/* Simulation Tray Icons */}
          <div className="hidden sm:flex items-center gap-2.5 text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-slate-400" />
          </div>
 
          <div className="hidden sm:block h-4 w-[1px] bg-slate-700 mx-1" />
 
          {/* TIME & DATE DISPLAY */}
          <div className="flex flex-col items-center justify-center text-center leading-none pr-1 select-none font-sans cursor-pointer hover:bg-white/5 px-1 py-0.5">
            <span className="text-amber-500 text-[11px] font-bold font-mono drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">{timeStr || "12:00"}</span>
            <span className="text-slate-400 text-[8px] mt-0.5 font-mono font-medium">{dateStr || "06/30/2026"}</span>
          </div>
        </div>
 
        {/* CLASSIC WINDOWS XP LUNA START MENU - Rebuilt in Tactical Command Theme */}
        {startMenuOpen && (
          <div 
            className="fixed bottom-[40px] left-0 w-full sm:w-[380px] h-[460px] xp-start-menu bg-[#0f172a] z-50 flex flex-col font-sans overflow-hidden select-none max-w-[100vw]"
          >
            {/* Start Menu Header / Account banner */}
            <div className="bg-gradient-to-r from-[#0a0f1d] to-[#1e293b] p-3 flex items-center justify-between border-b border-[#1e293b] select-none h-[54px] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm border border-[#1e293b] bg-[#090d16] flex items-center justify-center overflow-hidden shadow-sm">
                  <Shield className="w-5 h-5 text-amber-500 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.4)]" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-200 font-mono">INTERPOL TAC_CSO</h4>
                  <p className="text-[9.5px] text-slate-400 font-mono">rtp_node@immigration.go.th</p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-amber-500 font-bold bg-[#1e293b] border border-amber-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                SYS_ADMIN
              </span>
            </div>
 
            {/* Start Menu Main Column Split */}
            <div className="flex-1 flex overflow-hidden border-t border-[#1e293b]">
              
              {/* Left Column (White programs section) */}
              <div className="w-[60%] xp-start-menu-left p-3.5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-1">
                  
                  {/* Search filter in programs */}
                  <div className="relative mb-3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-500">
                      <Search className="w-3 h-3" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search tactical systems..."
                      value={startSearchText}
                      onChange={(e) => setStartSearchText(e.target.value)}
                      className="w-full bg-[#090d16] border border-[#1e293b] text-slate-200 rounded-none pl-7 pr-2 py-1 text-[10.5px] font-mono placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
 
                  {/* Programs listing */}
                  <div className="space-y-1">
                    {filteredPrograms.length > 0 ? (
                      filteredPrograms.map((prog) => (
                        <div
                          key={prog.id}
                          onClick={() => navigateToComponent(prog.id)}
                          className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-[#1e293b] hover:text-white group cursor-pointer transition-all"
                        >
                          <span className="shrink-0 scale-90 group-hover:brightness-125">{prog.icon}</span>
                          <div className="truncate text-left">
                            <span className="text-[11px] font-bold text-slate-300 group-hover:text-[#38bdf8] leading-none block mb-0.5">{prog.name.split(" - ")[0]}</span>
                            <span className="text-[9px] text-slate-500 group-hover:text-slate-300 leading-none font-sans block">{prog.desc}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-[10px] text-slate-500 font-mono">
                        No active nodes found.
                      </div>
                    )}
                  </div>
 
                </div>
 
                {/* All Programs shortcut arrow */}
                <div className="border-t border-slate-800 pt-2 mt-2 flex items-center justify-between text-[11px] text-slate-400 hover:text-[#38bdf8] hover:underline cursor-pointer font-mono">
                  <span className="font-bold flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    All Modules
                  </span>
                  <span>▶</span>
                </div>
              </div>
 
              {/* Right Column (Slate Navy settings section) */}
              <div className="w-[40%] xp-start-menu-right p-3 text-left flex flex-col justify-between font-sans text-xs">
                <div className="space-y-3.5 text-slate-400 font-bold text-[11px] pt-1 font-mono">
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => navigateToComponent("red-notice-window")}>▶ Wanted Files</div>
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => navigateToComponent("watchlist-window")}>▶ Biometric Terminal</div>
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => navigateToComponent("map-window")}>▶ NCB Command Feed</div>
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => navigateToComponent("scanner-window")}>▶ Tactical Grid Map</div>
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => navigateToComponent("chat-window")}>▶ Device Diagnostics</div>
                  <div className="hover:text-[#38bdf8] hover:underline cursor-pointer" onClick={() => setHelpOpen(true)}>▶ Secure Manual</div>
                </div>
              </div>
 
            </div>
 
            {/* Start Menu Log Off & Shut Down Footer */}
            <div className="bg-[#090d16] p-2.5 flex items-center justify-end gap-2 h-[44px] shrink-0 border-t border-[#1e293b]">
              <button
                onClick={handleShutdownTrigger}
                className="flex items-center gap-1.5 bg-gradient-to-b from-[#881337] to-[#4c0519] hover:from-[#be123c] hover:to-[#9f1239] text-white font-sans font-bold text-[11px] py-1 px-3 border border-[#4c0519] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-[#fca5a5]" />
                DISCONNECT SESSION
              </button>
            </div>
 
          </div>
        )}
 
      </div>

    </div>
  );
}
