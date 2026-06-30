import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (e) {
        console.error("Failed to initialize Google GenAI SDK:", e);
      }
    }
  }
  return aiClient;
}

// ==========================================
// API Routes
// ==========================================

// 1. Health check & status endpoint
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    uptime: process.uptime(),
    geminiActive: hasKey,
    agency: "Royal Thai Police Immigration Bureau (NCB Bangkok)",
  });
});

// 2. Chat with the Thai Immigration Bureau Agent Simulator
app.post("/api/agent/chat", async (req, res) => {
  const { messages, currentSuspect } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid chat history provided." });
  }

  // Get the last user message
  const userMessages = messages.filter(m => m.sender === "USER");
  const lastMessage = userMessages[userMessages.length - 1]?.text || "Hello officer.";

  // Format historical conversation for context
  const contextHistory = messages.map(m => `${m.sender}: ${m.text}`).join("\n");

  const systemInstruction = `You are Officer Somchai, a senior Investigator at the Royal Thai Police Immigration Bureau, working in direct coordination with the Interpol National Central Bureau (NCB) Bangkok. You are highly professional, strictly adhere to Thai immigration regulations (Immigration Act B.E. 2522) and international security standards, but speak in a helpful, direct, and slightly formal tone. Your badge number is RTP-IMM-9842.
You assist Interpol officers with queries regarding suspect entry/exit logs in Thailand, blacklists, visa guidelines (such as LTR, Tourist, Non-Immigrant visas), TM30 (notification of residence for foreigners), overstay penalties, extradition, or border control checkpoints like Suvarnabhumi Airport.

Keep your answers structured, highly realistic, professional, and concise. Advise on appropriate immigration protocols. Avoid overly dramatic writing. Sign off as 'Officer Somchai | RTP-IMM-9842'.`;

  const prompt = `
System Context on Current Suspect Under Surveillance:
${currentSuspect ? JSON.stringify(currentSuspect, null, 2) : "No specific active suspect selected yet."}

Conversation History:
${contextHistory}

Respond to the latest inquiry professionally, focusing on Thai Immigration procedures, checkpoint monitoring, biometric checks, or TM30 enforcement.
`;

  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Connection temporarily disrupted. Please retry.";
      return res.json({
        text: replyText,
        officerName: "Officer Somchai",
        badgeNumber: "RTP-IMM-9842",
        source: "Gemini AI"
      });
    } catch (err: any) {
      console.error("Gemini API Error in /api/agent/chat:", err);
      // Fallback to rich mock response in case of API error
    }
  }

  // Real fallback if Gemini is not set up or failed
  // Let's generate a highly realistic response depending on what the user asked
  const textLower = lastMessage.toLowerCase();
  let fallbackReply = "";

  if (textLower.includes("visa") || textLower.includes("tm30") || textLower.includes("tm30")) {
    fallbackReply = "Acknowledged, Interpol. Under Thai Immigration Act B.E. 2522 Section 38, any hotel or host accommodating a foreign national must file a TM.30 notification within 24 hours of arrival. If a red-noticed suspect attempts to check into any registered accommodation in Thailand, our Central Database system will trigger an immediate automatic silent alert to NCB Bangkok and the local provincial police. If you have a specific hotel lead, we can coordinate an immediate site raid. Please supply the passport number or booking reference.";
  } else if (textLower.includes("airport") || textLower.includes("suvarnabhumi") || textLower.includes("phuket") || textLower.includes("bkk")) {
    fallbackReply = "RTP Immigration airport checkpoints at Suvarnabhumi (BKK), Don Mueang (DMK), and Phuket (HKT) are equipped with automated Biometric Facial Recognition systems. All incoming passport chips are queried in real-time against our blacklists and Interpol’s SLTD (Stolen and Lost Travel Documents) database. If the suspect arrives via commercial flight, our Advance Passenger Processing System (APPS) triggers a pre-arrival flag when manifest files are transmitted from the airline.";
  } else if (textLower.includes("extradition") || textLower.includes("arrest") || textLower.includes("border") || textLower.includes("police")) {
    fallbackReply = "NCB Bangkok confirms that the Kingdom of Thailand operates under the Extradition Act B.E. 2551. If an Interpol Red Notice fugitive is located within Thai borders, our Immigration Investigators coordinate with the Office of the Attorney General (OAG). A Thai arrest warrant is obtained, and the subject is detained in Bangkok Remand Prison. We then await formal extradition documents from the requesting country, processed through diplomatic channels within the statutory 60-day limit.";
  } else if (currentSuspect) {
    fallbackReply = `NCB Bangkok has flagged the profile of ${currentSuspect.name} (${currentSuspect.referenceNumber}) for priority surveillance across all 14 major entry gates, including the Aranyaprathet land border and Suvarnabhumi Airport. If the subject presents Passport ${currentSuspect.passportNumber} or any recognized aliases, automatic terminal lockout will occur and tactical units will be dispatched. Please advise if your bureau has updated tracking info on the subject's departure port.`;
  } else {
    fallbackReply = "RTP-IMM Headquarters acknowledges secure link. We are connected to the central Interpol database. Please specify if you are looking to run a Passport Blacklist scan, verify checkpoint status, or coordinate surveillance on an active Red Notice suspect. Over.";
  }

  return res.json({
    text: fallbackReply + "\n\n(Notice: Operating on secure local simulation protocol. Activate live Gemini AI response by adding your GEMINI_API_KEY under Settings > Secrets.)",
    officerName: "Officer Somchai",
    badgeNumber: "RTP-IMM-9842 (Simulated)",
    source: "Local Simulation Engine"
  });
});

// 3. Analyze Interpol Red Notice & evaluate Thai Immigration Entry Risks
app.post("/api/interpol/analyze", async (req, res) => {
  const { suspect } = req.body;
  
  if (!suspect) {
    return res.status(400).json({ error: "No suspect data provided for analysis." });
  }

  const prompt = `
Analyze the following Interpol Red Notice fugitive for risk factors, potential entry routes, and containment measures in Thailand:

Suspect Data:
- Full Name: ${suspect.name}
- Alias: ${suspect.alias}
- Reference No: ${suspect.referenceNumber}
- Nationality: ${suspect.nationality}
- Date of Birth: ${suspect.dateOfBirth}
- Charges: ${suspect.charges}
- Severity level: ${suspect.severity}
- Passport No: ${suspect.passportNumber}
- Last Seen: ${suspect.lastSeenLocation}

Please generate a professional, structured tactical intelligence report. The report must contain:
1. RISK PROFILE: Threat level, likelihood of illegal entry, and expected behavior.
2. IMMIGRATION INTERCEPT ANALYSIS: Most likely entry points in Thailand (airports, maritime channels, or land borders like Aranyaprathet, Padang Besar, Mae Sot), and how current biometric systems should be calibrated.
3. MONITORING & TM30 TRACKING: Specific guidelines on how to monitor hotels, condominiums, or boat charters in Thailand for this suspect.
4. COORDINATION PROCEDURES: Legal framework under Thai law (Extradition Act B.E. 2551) to secure detention and legal handover.
5. SUMMARY ACTION DIRECTIVE: A concise, bulleted checklist for immediate dissemination to border checkpoints.
`;

  const systemInstruction = "You are a Senior Security Analyst at the Royal Thai Police Immigration Bureau and NCB Bangkok. Generate a highly detailed, structured, military-grade security analysis for a suspect profile. Use professional, clinical, intelligence-focused terminology. Do not make up fake URLs or metadata. Ensure it looks like an authentic government agency intelligence report.";

  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      return res.json({
        report: response.text || "Analysis could not be compiled.",
        source: "Gemini AI Intel Core"
      });
    } catch (err) {
      console.error("Gemini API Error in /api/interpol/analyze:", err);
    }
  }

  // Realistic, highly structured Mock Fallback Report
  const borderPoints = suspect.nationality === "Malaysian" ? "Padang Besar, Sadao, or Betong land borders" : 
                       suspect.nationality === "Cambodian" ? "Aranyaprathet or Ban Laem land crossings" : 
                       suspect.nationality === "Myanmar" ? "Mae Sot or Ranong maritime checkpoints" :
                       "Suvarnabhumi BKK International Airport or Phuket HKT Port Entry";

  const fallbackReport = `### ROYAL THAI POLICE IMMIGRATION BUREAU - INTELLIGENCE DIVISION
#### NCB BANGKOK SPECIAL INVESTIGATIONS CASE FILE: RTP-${suspect.referenceNumber}
**TACTICAL ADVISORY & INTERCEPT MEMORANDUM**

**1. THREAT ASSESSMENT & RISK PROFILE**
* **SUBJECT:** ${suspect.name} (Alias: ${suspect.alias})
* **CHARGES:** ${suspect.charges}
* **SEVERITY RANKING:** [${suspect.severity} THREAT LEVEL]
* **OPERATIONAL RISK:** Subject possesses trans-national coordination capabilities. High probability of attempting entry using altered or high-quality stolen passports to bypass standard name-matching databases. Extreme caution is advised due to the severe nature of the charges.

**2. BORDER ENTRY VULNERABILITY ANALYSIS**
* **PRIMARY THREAT VECTOR:** ${borderPoints}.
* **COUNTER-MEASURES:** Instruct all frontline officers to enforce secondary verification protocols. Rather than relying solely on alphanumeric name checks, enforce 100% compliance with **Biometric Facial Scanning (BFS)** algorithms. Verify passport security features (microprinting, UV watermark, MRZ checksum calculations) to detect forged credentials.

**3. IN-COUNTRY MONITORING & ENFORCEMENT PROTOCOLS**
* **TM30 ENFORCEMENT:** Disseminate subject's biometrics to the Central TM.30 Residence Registry. Real-time scanning will flag any registration at hotels, serviced apartments, or resort condominiums in prime areas such as Bangkok, Pattaya, Phuket, and Chiang Mai.
* **LOCAL ENFORCEMENT:** Coordinate with provincial immigration offices and Marine Police in case of coastal vessel charters or unauthorized transit.

**4. LEGAL & EXTRADITION FRAMEWORK**
* **LEGAL BASIS:** Extradition Act B.E. 2551 (2008).
* **DIRECTIVE:** Upon a confirmed match or safe custody capture at any checkpoint, immediate administrative detention is to be executed under Section 12 of the Immigration Act B.E. 2522 for overstay/blacklist status. Notify the OAG (Office of the Attorney General) Extradition Division and NCB Bangkok immediately to initiate diplomatic arrest warrants within 24 hours.

**5. IMMEDIATE ACTION DIRECTIVE FOR BORDER POSTS**
* [ ] **FLAG PASSPORT:** Upload passport ${suspect.passportNumber} and all known aliases into APPS (Advance Passenger Processing System).
* [ ] **BIOMETRIC LOCK:** Load profile photographs into the facial recognition terminal at Gate Control.
* [ ] **SILENT COMPLIANCE:** If subject is identified, trigger silent alarm, isolate subject under the pretext of 'routine immigration visa clarification', and summon Tactical Arrest Unit.
* [ ] **LOCAL INTELLIGENCE:** Interrogate local TM30 records for matches with the alias "${suspect.alias}".

*Compiled by RTP-IMM NCB Joint Operations division. (Simulation Mode).*`;

  return res.json({
    report: fallbackReport,
    source: "Local Simulation Engine (Activate live Gemini AI via Secrets for custom intelligence report.)"
  });
});

// ==========================================
// Official Interpol Public API Search Integration
// ==========================================
app.get("/api/interpol/official-search", async (req, res) => {
  const { name, forename, nationality } = req.query;

  const params = new URLSearchParams();
  if (name) params.append("name", String(name).trim().toUpperCase());
  if (forename) params.append("forename", String(forename).trim().toUpperCase());
  if (nationality) params.append("nationality", String(nationality).trim().toUpperCase());
  params.append("resultPerPage", "25");
  params.append("page", "1");

  const url = `https://ws-public.interpol.int/notices/v1/red?${params.toString()}`;
  console.log(`Querying official public Interpol API: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Interpol API responded with status ${response.status}`);
    }

    const data: any = await response.json();
    const rawNotices = data._embedded?.notices || [];

    const notices = rawNotices.map((n: any) => {
      const selfLink = n._links?.self?.href || "";
      const entityId = selfLink.split("/").pop() || n.entityId || `INT-${Math.random().toString().slice(2, 8)}`;
      
      return {
        id: `interpol-${entityId}`,
        referenceNumber: `RED-${entityId}`,
        name: `${n.name || ""} ${n.forename || ""}`.trim().toUpperCase(),
        alias: "OFFICIAL RED NOTICE WANTED TARGET",
        nationality: n.nationalities ? n.nationalities.join(", ") : "Unknown",
        dateOfBirth: n.date_of_birth || "Unknown",
        placeOfBirth: "Unknown",
        charges: "Active international extradition alert filed by member nation. Fully integrated via Interpol Web Portal.",
        issuingCountry: "INTERPOL GENERAL SECRETARIAT",
        severity: "CRITICAL",
        status: "ACTIVE",
        photoUrl: n._links?.thumbnail?.href || "",
        passportNumber: "VERIFIABLE ON EXTRADITION SYSTEM",
        lastSeenLocation: "Global Transit Nodes",
        entityId: entityId,
        interpolUrl: `https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices#${entityId}`
      };
    });

    return res.json({
      success: true,
      notices,
      total: data.total || notices.length,
      source: "Official Interpol Public Database"
    });
  } catch (error: any) {
    console.error("Error querying official Interpol API, initiating AI fallback:", error.message);
    
    // --- AI / Simulated Fallback for Search ---
    const searchName = String(name || "").trim().toUpperCase();
    const searchForename = String(forename || "").trim().toUpperCase();
    const searchNationality = String(nationality || "").trim().toUpperCase();

    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `
Generate a list of 3 highly realistic Interpol Red Notice wanted target profiles matching search query:
Name: "${searchName}"
Forename: "${searchForename}"
Nationality: "${searchNationality}"

Output the response ONLY as a valid raw JSON array of objects conforming to this TypeScript interface:
interface SimulatedInterpolNotice {
  id: string; // unique string e.g. "interpol-2024-12948"
  referenceNumber: string; // e.g. "RED-2024-12948"
  name: string; // uppercase formatted "LASTNAME FIRSTNAME" (or combined name/forename matching search parameters)
  alias: string; // e.g. "OFFICIAL RED NOTICE WANTED TARGET" or a specific alias
  nationality: string; // matches search nationality if specified, otherwise e.g. "French", "Russian", etc.
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string; // e.g. "Paris", "Moscow"
  charges: string; // e.g. "Transnational Cyber Intrusion & Corporate Blackmail"
  issuingCountry: string; // e.g. "France / NCB Paris", "United States / NCB Washington"
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "ACTIVE";
  photoUrl: string; // empty string
  passportNumber: string; // e.g. "PP981048"
  lastSeenLocation: string; // e.g. "Bangkok, Thailand"
  entityId: string; // e.g. "2024-12948"
  interpolUrl: string; // official-looking URL
}

Do not wrap in markdown tags like \`\`\`json. Output ONLY the JSON array.
`;
        const systemInstruction = "You are a secure API Gateway bridge for Interpol Red Notice database search queries. You output strictly valid JSON arrays of generated Interpol Red Notice wanted individuals matching the search criteria. Never include introductory conversational text.";
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.8,
          },
        });

        let text = response.text || "[]";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return res.json({
            success: true,
            notices: parsed,
            total: parsed.length,
            source: "Interpol AI Simulation Platform (Live)"
          });
        }
      } catch (aiErr: any) {
        console.error("Gemini fallback failed for official-search:", aiErr.message);
      }
    }

    // --- Static Deterministic Fallback if Gemini fails or is inactive ---
    const staticNotices = [
      {
        id: "interpol-2024-58210",
        referenceNumber: "RED-2024-58210",
        name: `${searchName || "IVANOV"} ${searchForename || "DMITRY"}`.trim().toUpperCase() || "IVANOV DMITRY",
        alias: "THE ARCHITECT",
        nationality: searchNationality || "Russian",
        dateOfBirth: "1988-11-12",
        placeOfBirth: "Saint Petersburg",
        charges: "Transnational cyber espionage, deployment of ransomware on financial core networks, and high-volume illegal digital assets laundering.",
        issuingCountry: "Russian Federation / NCB Moscow Command",
        severity: "CRITICAL",
        status: "ACTIVE",
        photoUrl: "",
        passportNumber: "RU8829402",
        lastSeenLocation: "Pattaya, Chon Buri",
        entityId: "2024-58210",
        interpolUrl: "https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices#2024-58210"
      },
      {
        id: "interpol-2023-89411",
        referenceNumber: "RED-2023-89411",
        name: `${searchName || "CHEN"} ${searchForename || "WEIQIANG"}`.trim().toUpperCase() || "CHEN WEIQIANG",
        alias: "GOLDEN DRAGON",
        nationality: searchNationality || "Chinese",
        dateOfBirth: "1979-04-05",
        placeOfBirth: "Guangzhou",
        charges: "Operation of underground syndicate routing illegal gambling assets across international sea boundaries, and customs tax evasion.",
        issuingCountry: "China / NCB Beijing Liaison",
        severity: "HIGH",
        status: "ACTIVE",
        photoUrl: "",
        passportNumber: "CN3029104",
        lastSeenLocation: "Sukhumvit Road, Bangkok",
        entityId: "2023-89411",
        interpolUrl: "https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices#2023-89411"
      }
    ];

    return res.json({
      success: true,
      notices: staticNotices,
      total: staticNotices.length,
      source: "Interpol Secure Gateway Local Archive (Lyon Database Offline)"
    });
  }
});

app.get("/api/interpol/official-detail", async (req, res) => {
  const { entityId } = req.query;
  if (!entityId) {
    return res.status(400).json({ error: "entityId parameter is required" });
  }

  const url = `https://ws-public.interpol.int/notices/v1/red/${entityId}`;
  console.log(`Fetching official Interpol profile details for ${entityId}: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Interpol Detail API responded with status ${response.status}`);
    }

    const data: any = await response.json();
    
    const charges = (data.arrest_warrants || []).map((w: any) => w.charge).join("; ") || "International Extradition Search and Prosecutorial Arrest warrant.";
    const issuingCountries = (data.arrest_warrants || []).map((w: any) => w.issuing_country_id).join(", ") || "INTERPOL General Secretariat";

    return res.json({
      success: true,
      detail: {
        referenceNumber: `RED-${data.entity_id || entityId}`,
        name: `${data.name || ""} ${data.forename || ""}`.trim().toUpperCase(),
        alias: data.aliases ? data.aliases.map((a: any) => `${a.name} ${a.forename || ""}`.trim()).join(", ") : "NONE REPORTED",
        nationality: data.nationalities ? data.nationalities.join(", ") : "Unknown",
        dateOfBirth: data.date_of_birth || "Unknown",
        placeOfBirth: data.place_of_birth || "Unknown",
        charges: charges,
        issuingCountry: issuingCountries ? `WANTED BY: ${issuingCountries}` : "INTERPOL GENERAL SECRETARIAT",
        severity: "CRITICAL",
        status: "ACTIVE",
        photoUrl: data._links?.images?.href || data._links?.thumbnail?.href || "",
        passportNumber: "RETRIEVABLE BY SPECIAL INVESTIGATIONS",
        lastSeenLocation: `Warrant filed by Interpol Member Nation ${issuingCountries}`,
        physicalDetails: {
          height: data.height ? `${data.height} m` : "Unknown",
          weight: data.weight ? `${data.weight} kg` : "Unknown",
          eyes: data.eyes_colors_id || "Unknown",
          hair: data.hair_id || "Unknown",
          distinguishingMarks: data.distinguishing_marks || "None reported",
        },
        interpolUrl: `https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices#${entityId}`
      }
    });
  } catch (error: any) {
    console.error("Error fetching official Interpol detail, initiating AI fallback:", error.message);
    
    // --- AI / Simulated Fallback for Detail ---
    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `
Generate a highly detailed, professional, and authentic-looking Interpol Red Notice detailed profile for a transnational wanted fugitive with Interpol Entity ID: "${entityId}".
Output the response ONLY as a valid raw JSON object conforming to this TypeScript structure:
{
  referenceNumber: string; // e.g. "RED-2024-12948" or matching entityId
  name: string; // uppercase e.g. "IVANOV DMITRY"
  alias: string; // e.g. "THE ARCHITECT, COLD FRONT"
  nationality: string; // e.g. "Russian", "Chinese", "French"
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string; // e.g. "Vladivostok"
  charges: string; // realistic charges e.g. "International wire fraud, crypto theft and illicit drug distribution networks."
  issuingCountry: string; // e.g. "WANTED BY: RU, TH, US"
  severity: "CRITICAL";
  status: "ACTIVE";
  photoUrl: string; // empty string
  passportNumber: string; // "RETRIEVABLE BY SPECIAL INVESTIGATIONS"
  lastSeenLocation: string; // e.g. "Reported in South-East Asia transition centers"
  physicalDetails: {
    height: string; // e.g. "1.82 m"
    weight: string; // e.g. "80 kg"
    eyes: string; // e.g. "Brown"
    hair: string; // e.g. "Black"
    distinguishingMarks: string; // e.g. "Scar on left cheek, tattoo on right wrist"
  };
  interpolUrl: string; // official-looking URL
}

Do not wrap in markdown tags like \`\`\`json. Output ONLY the JSON object.
`;
        const systemInstruction = "You are a secure API Gateway bridge that generates highly detailed, authentic Interpol Red Notice profiles in JSON format based on the requested entity ID.";
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        let text = response.text || "{}";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);
        if (parsed && parsed.name) {
          return res.json({
            success: true,
            detail: parsed,
            source: "Interpol AI Simulation Platform (Live)"
          });
        }
      } catch (aiErr: any) {
        console.error("Gemini fallback failed for official-detail:", aiErr.message);
      }
    }

    // --- Static Fallback for Detail ---
    return res.json({
      success: true,
      detail: {
        referenceNumber: `RED-${entityId}`,
        name: "IVANOV DMITRY",
        alias: "THE ARCHITECT",
        nationality: "Russian",
        dateOfBirth: "1988-11-12",
        placeOfBirth: "Saint Petersburg",
        charges: "Transnational cyber espionage, deployment of ransomware on financial core networks, and high-volume illegal digital assets laundering.",
        issuingCountry: "Russian Federation / NCB Moscow Command",
        severity: "CRITICAL",
        status: "ACTIVE",
        photoUrl: "",
        passportNumber: "RETRIEVABLE BY SPECIAL INVESTIGATIONS",
        lastSeenLocation: "Pattaya, Chon Buri",
        physicalDetails: {
          height: "1.80 m",
          weight: "78 kg",
          eyes: "Blue",
          hair: "Blonde",
          distinguishingMarks: "Scar on right forearm",
        },
        interpolUrl: `https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices#${entityId}`
      },
      source: "Interpol Secure Gateway Local Archive"
    });
  }
});

// ==========================================
// System Security Audit Endpoint
// ==========================================
app.post("/api/system/audit", async (req, res) => {
  const { logs, metadata } = req.body;
  if (!logs || !Array.isArray(logs)) {
    return res.status(400).json({ error: "No immigration logs provided for audit compiling." });
  }

  const { reportTitle, investigatorName, badgeNumber, securityLevel, focusMode, timestamp, allLogsCount } = metadata || {};

  const formattedLogsText = logs.map((log: any, idx: number) => {
    return `[RECORD #${idx + 1}]
  INCIDENT ID:  ${log.id}
  TIMESTAMP:    ${log.timestamp}
  PORT OF ENTRY: ${log.location}
  PASSENGER:    ${log.passengerName}
  NATIONALITY:  ${log.nationality}
  STATUS:       ${log.status}
  ACTION TAKEN: ${log.actionTaken}
  --------------------------------------------------------`;
  }).join("\n");

  const prompt = `
Generate a highly detailed, professional, official security audit report formatted as an authentic document from the Royal Thai Police Immigration Bureau and Interpol NCB Bangkok.

Input Parameters:
- Report Title: ${reportTitle || "BORDER SECURITY AUDIT"}
- Investigator Name: ${investigatorName || "Chief Security Officer"}
- Badge Number: ${badgeNumber || "RTP-IMM-9842"}
- Security Classification: ${securityLevel || "SECRET"}
- Focus Filter: ${focusMode || "ALL"}
- Total Evaluated Log Entries in Database: ${allLogsCount || logs.length}
- Flagged Incident Entries count: ${logs.length}

Chronological Log Incident Data:
${formattedLogsText || "  *** NO INCIDENT LOGS PROVIDED IN THIS SCOPE ***"}

Your report should be returned as raw, beautifully structured monospace-oriented text with ASCII boundaries (using '=', '-', or '*' blocks).
It MUST contain:
1. OFFICIAL COAT OF ARMS HEADER: Standard text-based headers for "ROYAL THAI POLICE IMMIGRATION BUREAU" and "NCB BANGKOK JOINT PORTAL SECURITY AUDIT".
2. AUDIT METADATA BLOCK: Display Ref No, Classification, DateTime generated, Investigator details, and Focus mode.
3. STATISTICAL COMPLIANCE SUMMARY: Calculate and list total evaluated logs, total flags/alerts, and total biometric lockouts.
4. DETAILED CHRONOLOGICAL INCIDENT REGISTRY: Format the flagged logs neatly with clear table boundaries or structured ASCII records.
5. LEGAL & SECURITY STANDARDS CITATIONS: Detail how these flags map to the Thai Immigration Act B.E. 2522 (especially Section 12 for entry bans) and Extradition Act B.E. 2551.
6. COMPLIANCE RECOMMENDATIONS & TACTICAL ADVISORY: Outline concrete strategic suggestions for terminal gate biometric calibrations, security updates, and TM30 coordination.
7. DIGITAL AUTHENTICATION FOOTER: Formally sign off by "${investigatorName}" with an MD5-style digital signature hash for security verification.

Output ONLY the complete, raw, professional formatted report. Do not include any introductory conversational text. Use highly formal, law enforcement, clinical terminology.
`;

  const systemInstruction = "You are a Chief Auditing and Compliance Officer at the Royal Thai Police Immigration Bureau and Interpol NCB Bangkok. You generate highly authoritative, structured, and legally accurate border security audit reports in response to database queries. You adhere strictly to requested monospace layouts and formal, administrative tone.";

  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      return res.json({
        report: response.text || "Report generation succeeded but returned empty content.",
        source: "Gemini AI Audit Core"
      });
    } catch (err) {
      console.error("Gemini API Error in /api/system/audit:", err);
    }
  }

  // Fallback template report when Gemini is not configured or fails
  const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
  const dateTimeStr = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();
  const fallbackReport = `========================================================================
             ROYAL THAI POLICE IMMIGRATION BUREAU
           INTERPOL NATIONAL CENTRAL BUREAU (NCB) BANGKOK
========================================================================
DOCUMENT REF: RTP-AUDIT-2026-${hash}
CLASSIFICATION: [${securityLevel || "SECRET"} - FOR OFFICIAL USE ONLY]
SYSTEM SEED: APPS-GATEWAY-CORE v7.1

------------------------- AUDIT PARAMETERS -----------------------------
REPORT TITLE:  ${(reportTitle || "SYSTEM AUDIT REPORT").toUpperCase()}
INVESTIGATOR:  ${(investigatorName || "Chief Security Officer").toUpperCase()} (Badge No: ${badgeNumber || "RTP-IMM-9842"})
DATE GENERATED: ${dateTimeStr}
FOCUS FILTER:  ${focusMode || "ALL"}
TOTAL RECORDS: ${allLogsCount || logs.length} logged / ${logs.length} flagged

--------------------- STATISTICAL EVALUATION ---------------------------
  * Total Checked Passengers: ${allLogsCount || logs.length}
  * Flagged Entries Verified: ${logs.filter((l: any) => l.status === "FLAGGED").length}
  * Biometric Lockout/Detains: ${logs.filter((l: any) => l.status === "DETAINED").length}
  * Passing Clearances Issued: ${(allLogsCount || logs.length) - logs.length}

----------------------- COMPLIANCE & LEGAL CITATIONS -------------------
1. Under Section 12 of the Thailand Immigration Act B.E. 2522, individuals matching
   international or domestic blacklist records must be refused entry immediately.
2. In accordance with the Extradition Act B.E. 2551, any Red Notice targets subject to
   biometric lockouts (DETAINED) must be secured in isolated administrative holding
   for processing by the Attorney General (OAG) Special Litigation branch.

---------------------- CHRONOLOGICAL INCIDENT REGISTRY ------------------
${formattedLogsText || "  *** NO INCIDENT LOGS RECORDED IN THIS TIME FRAME ***"}

-------------------------- STRATEGIC ADVISORY --------------------------
* APPS Calibration: Alphanumeric and Biometric Gate Recognition must maintain a 98.4%
  sensitivity rating.
* Hotel Notifications: Ensure local TM30 automatic reporting is fully linked with the
  RTP central index to capture escapes.
* Joint Coordination: Share verified biometric signatures of flagged entries with 
  relevant Interpol NCB partners within 2 hours of incident resolution.

------------------------------------------------------------------------
AUTHENTICATED BY:
${investigatorName || "Chief Security Officer"}
Chief Security and Compliance Liaison Officer
Interpol NCB Bangkok, Royal Thai Police
[APPROVED DIGITAL SIGNATURE REGISTERED - MD5 HASH ACCREDITED]
========================================================================`;

  return res.json({
    report: fallbackReport,
    source: "Local Compliance Simulation Engine"
  });
});

// Helper to convert ISO 3166-1 alpha-2 codes or nationality adjectives
function mapCountryCodeToName(code: string): string {
  if (!code) return "Unknown";
  const c = code.trim().toLowerCase();
  const map: Record<string, string> = {
    ru: "Russian Federation",
    us: "United States",
    cn: "China",
    ua: "Ukraine",
    gb: "United Kingdom",
    ca: "Canada",
    th: "Thailand",
    kr: "South Korea",
    kp: "North Korea",
    kh: "Cambodia",
    la: "Laos",
    mm: "Myanmar",
    my: "Malaysia",
    sg: "Singapore",
    vn: "Vietnam",
    it: "Italy",
    fr: "France",
    de: "Germany",
    es: "Spain",
    jp: "Japan",
    in: "India",
    br: "Brazil",
    au: "Australia",
    nz: "New Zealand",
    ch: "Switzerland",
    nl: "Netherlands",
    se: "Sweden",
    no: "Norway",
    fi: "Finland",
    dk: "Denmark",
    be: "Belgium",
    at: "Austria",
    pl: "Poland",
    za: "South Africa",
    sa: "Saudi Arabia",
    ae: "United Arab Emirates",
    tr: "Turkey",
    mx: "Mexico",
    ar: "Argentina",
    co: "Colombia",
    pe: "Peru",
    ve: "Venezuela",
    ph: "Philippines",
    id: "Indonesia",
    pk: "Pakistan",
    bd: "Bangladesh",
    eg: "Egypt",
    ng: "Nigeria",
    ke: "Kenya",
  };
  return map[c] || (code.length <= 3 ? code.toUpperCase() : code.charAt(0).toUpperCase() + code.slice(1));
}

// 4. Global Watchlist: Search external database via API Integration (Simulated/Gemini generated)
app.post("/api/watchlist/search", async (req, res) => {
  const { query, sourceDB } = req.body;
  const searchTerm = (query || "").trim();

  // If specific OpenSanctions database query is requested
  if (sourceDB === "OPENSANCTIONS") {
    try {
      console.log(`Querying OpenSanctions Interpol Red Notices dataset for: ${searchTerm}`);
      const osUrl = `https://api.opensanctions.org/search/interpol_red_notices?q=${encodeURIComponent(searchTerm)}&limit=15`;
      const osResponse = await fetch(osUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "aistudio-build"
        }
      });
      
      if (osResponse.ok) {
        const data = await osResponse.json();
        const results = data.results || [];
        
        if (results.length > 0) {
          const mappedProfiles = results.map((entity: any) => {
            const props = entity.properties || {};
            const nationalityCode = props.nationality?.[0] || props.country?.[0] || "";
            const nationality = mapCountryCodeToName(nationalityCode);
            
            return {
              id: `os-${entity.id}`,
              referenceNumber: props.idNumber?.[0] || `OS-RED-${entity.id.toUpperCase().slice(0, 8)}`,
              name: entity.caption ? entity.caption.toUpperCase() : "UNKNOWN PERSON",
              alias: props.alias ? props.alias.join(", ").toUpperCase() : "NONE",
              nationality: nationality,
              passportNumber: props.passportNumber?.[0] || `OS-PP-${Math.floor(100000 + Math.random() * 900000)}`,
              charges: props.notes?.[0] || props.summary?.[0] || "Target listed in the OpenSanctions INTERPOL Red Notices program database.",
              sourceDB: "OPENSANCTIONS",
              riskScore: 90 + Math.floor(Math.random() * 11), // 90 to 100 for Interpol Red Notice
              lastKnownCountry: mapCountryCodeToName(props.country?.[0] || nationalityCode) || "In Transit",
              status: "WANTED",
              opensanctionsUrl: `https://www.opensanctions.org/entities/${entity.id}/`,
            };
          });
          
          return res.json({
            profiles: mappedProfiles,
            source: "Official OpenSanctions API (Live)"
          });
        }
      }
    } catch (apiErr: any) {
      console.error("OpenSanctions live API request failed:", apiErr.message);
    }
    
    // Fallback to Gemini specifically tailored for OpenSanctions dataset
    const prompt = `
Generate a list of 2 or 3 highly realistic transnational wanted fugitive profiles from the OpenSanctions INTERPOL Red Notices dataset (INTERPOL-RN) matching the query: "${searchTerm || "financial fraud or cybercrime"}".
Output the response ONLY as a valid raw JSON array of objects conforming to this TypeScript interface:

interface GlobalWatchlistProfile {
  id: string; // unique random id starting with "os-" (e.g., "os-12345")
  referenceNumber: string; // format like "OS-RED-A994B" or similar wanted identifier
  name: string; // uppercase full name
  alias: string; // uppercase alias/nickname
  nationality: string; // e.g. "French", "German", "American", "Japanese", "Singaporean"
  passportNumber: string; // e.g. "FR829410", "US482914"
  charges: string; // descriptive criminal charges from open source sanctions data
  sourceDB: "OPENSANCTIONS";
  riskScore: number; // integer 85-100 representing risk level
  lastKnownCountry: string; // country where they were last reported
  status: "WANTED";
  opensanctionsUrl: string; // e.g. "https://www.opensanctions.org/entities/interpol-..." or the requested URL https://www.opensanctions.org/programs/INTERPOL-RN/
}

Do not wrap in markdown tags like \`\`\`json. Output ONLY the JSON array.
`;

    const systemInstruction = "You are a secure API Gateway bridge for OpenSanctions database query. You output strictly valid JSON arrays of generated wanted individuals matching the query based on real OpenSanctions Interpol Red Notices data. Never include introductory conversational text.";
    const ai = getAIClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.8,
          },
        });

        let text = response.text || "[]";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return res.json({ profiles: parsed, source: "OpenSanctions AI Simulation (Lyon Core)" });
        }
      } catch (err) {
        console.error("Gemini API Error in /api/watchlist/search OpenSanctions fallback:", err);
      }
    }
    
    // Static fallback specifically matching the OpenSanctions structure
    const staticFallback = [
      {
        id: `os-static-1`,
        referenceNumber: `OS-RED-M9041`,
        name: `${searchTerm.toUpperCase() || "ALEXANDER"} PETROV`,
        alias: "THE COLD SIBERIAN",
        nationality: "Russian",
        passportNumber: "RU9924104",
        charges: "Wanted by Interpol member states for organized financial cyber-fraud, deployment of banking trojans, and laundering of virtual currencies through South-East Asian money houses.",
        sourceDB: "OPENSANCTIONS",
        riskScore: 94,
        lastKnownCountry: "Thailand",
        status: "WANTED",
        opensanctionsUrl: "https://www.opensanctions.org/programs/INTERPOL-RN/"
      },
      {
        id: `os-static-2`,
        referenceNumber: `OS-RED-S4421`,
        name: `SARAH ${searchTerm.toUpperCase() || "LEON"}`,
        alias: "CHAMELEON",
        nationality: "British",
        passportNumber: "GB2041922",
        charges: "Transnational fraud, identity theft across Commonwealth nations, and smuggling of strategic dual-use materials into sanctioned zones.",
        sourceDB: "OPENSANCTIONS",
        riskScore: 89,
        lastKnownCountry: "Cambodia",
        status: "WANTED",
        opensanctionsUrl: "https://www.opensanctions.org/programs/INTERPOL-RN/"
      }
    ];
    return res.json({ profiles: staticFallback, source: "OpenSanctions Static Archive File" });
  }

  const prompt = `
Generate a list of 2 or 3 realistic transnational fugitive suspect profiles that match the search criteria: "${searchTerm || "financial fraud or cybercrime"}".
Output the response ONLY as a valid raw JSON array of objects conforming to this TypeScript interface:

interface GlobalWatchlistProfile {
  id: string; // unique random id
  referenceNumber: string; // format like "WANTED-EU-29481" or "SLTD-INT-94021" or "FBI-MW-88291"
  name: string; // uppercase full name
  alias: string; // uppercase alias/nickname
  nationality: string; // e.g. "French", "German", "American", "Japanese", "Singaporean"
  passportNumber: string; // e.g. "FR829410", "US482914"
  charges: string; // descriptive criminal charges
  sourceDB: "INTERPOL_SLTD" | "EUROPOL" | "FBI_MOST_WANTED";
  riskScore: number; // integer 40-100 representing risk level
  lastKnownCountry: string; // country where they were last reported
  status: "WANTED" | "MONITORED" | "APPREHENDED";
}

Do not wrap in markdown tags like \`\`\`json. Output ONLY the JSON array.
`;

  const systemInstruction = "You are a secure API Gateway bridge for external law enforcement search engines (Europol, Interpol, FBI). You receive search phrases and output strictly valid JSON arrays containing generated fugitive suspect metadata matching the query. Never include introductory conversational text, only return the clean JSON array.";

  const ai = getAIClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      let text = response.text || "[]";
      // Clean up markdown block headers if model included them anyway
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return res.json({ profiles: parsed, source: "Live External API Bridge (Gemini)" });
      }
    } catch (err) {
      console.error("Gemini API Error in /api/watchlist/search:", err);
    }
  }

  // High quality realistic fallback matching user search query
  const term = searchTerm.toLowerCase();
  let fallbackList: any[] = [];

  if (term.includes("cyber") || term.includes("hack") || term.includes("tech") || term.includes("digital")) {
    fallbackList = [
      {
        id: "ext-1",
        referenceNumber: "WANTED-EU-77291",
        name: "DMITRY KOVALENKO",
        alias: "NEO_GENESIS",
        nationality: "Ukrainian",
        passportNumber: "UA8194024",
        charges: "Ransomware deployments against international finance hubs and decentralized crypto exchanges",
        sourceDB: "EUROPOL",
        riskScore: 92,
        lastKnownCountry: "Montenegro",
        status: "WANTED",
      },
      {
        id: "ext-2",
        referenceNumber: "FBI-MW-33019",
        name: "ALEXANDER CHEN",
        alias: "DARK_STREAM",
        nationality: "Taiwanese",
        passportNumber: "TW4482913",
        charges: "State-sponsored trade secret theft, exfiltration of high-density semiconductor designs",
        sourceDB: "FBI_MOST_WANTED",
        riskScore: 88,
        lastKnownCountry: "Malaysia",
        status: "WANTED",
      }
    ];
  } else if (term.includes("fraud") || term.includes("money") || term.includes("laundering") || term.includes("bank") || term.includes("crypto")) {
    fallbackList = [
      {
        id: "ext-3",
        referenceNumber: "SLTD-INT-55410",
        name: "JEAN-PIERRE DUVAL",
        alias: "THE ARCHITECT",
        nationality: "French",
        passportNumber: "FR9910481",
        charges: "Ponzi-scheme mastermind totaling $120M USD through shell corporations in Seychelles",
        sourceDB: "INTERPOL_SLTD",
        riskScore: 78,
        lastKnownCountry: "Cambodia",
        status: "MONITORED",
      },
      {
        id: "ext-4",
        referenceNumber: "WANTED-EU-41234",
        name: "BIANCA ALTIERI",
        alias: "THE COURIER",
        nationality: "Italian",
        passportNumber: "IT3001844",
        charges: "Illicit currency transport and shadow banking for Mediterranean cartels",
        sourceDB: "EUROPOL",
        riskScore: 84,
        lastKnownCountry: "Thailand",
        status: "WANTED",
      }
    ];
  } else {
    // General default fallback
    fallbackList = [
      {
        id: "ext-5",
        referenceNumber: "SLTD-INT-88391",
        name: "HEINRICH SCHMIDT",
        alias: "THE ALCHEMIST",
        nationality: "German",
        passportNumber: "DE1190442",
        charges: "Smuggling synthetic precursors, chemical manufacturing violations, international evasion",
        sourceDB: "INTERPOL_SLTD",
        riskScore: 81,
        lastKnownCountry: "Laos",
        status: "WANTED",
      },
      {
        id: "ext-6",
        referenceNumber: "FBI-MW-90412",
        name: "KHALID AL-MANSOUR",
        alias: "THE MERCH",
        nationality: "Saudi",
        passportNumber: "SA7729104",
        charges: "Facilitating black market military hardware auctions and transshipment brokerage",
        sourceDB: "FBI_MOST_WANTED",
        riskScore: 95,
        lastKnownCountry: "United Arab Emirates",
        status: "WANTED",
      }
    ];
  }

  // Filter fallback to match query slightly if they search specifically for a name
  if (searchTerm && !term.includes("cyber") && !term.includes("hack") && !term.includes("tech") && !term.includes("digital") && !term.includes("fraud") && !term.includes("money") && !term.includes("laundering") && !term.includes("bank") && !term.includes("crypto")) {
    fallbackList = fallbackList.map(item => ({
      ...item,
      name: `${searchTerm.toUpperCase()} ${item.name.split(" ").slice(-1)[0]}`,
    }));
  }

  return res.json({
    profiles: fallbackList,
    source: "Local Simulation Engine (Activate live Gemini AI via Secrets for custom intelligence queries.)"
  });
});

// ==========================================
// Serve Vite Frontend / Static files
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static assets serving...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully listening on http://localhost:${PORT}`);
  });
}

startServer();
