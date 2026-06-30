# 🚨 Interpol SLTD & Border Control Command Terminal

[![GitHub Repository](https://img.shields.io/badge/GitHub-boltnw662%2FSLTD--DASHBORD-amber?style=flat&logo=github&logoColor=white)](https://github.com/boltnw662/SLTD-DASHBORD)
[![Database](https://img.shields.io/badge/Database-Interpol--SLTD-blue?style=flat&logo=database)](https://github.com/boltnw662/SLTD-DASHBORD)
[![Security Class](https://img.shields.io/badge/Security-NCB--Bangkok--RESTRICTED-red?style=flat)](https://github.com/boltnw662/SLTD-DASHBORD)

> **A full-stack, enterprise-grade tactical security and border surveillance terminal.** Purpose-built to integrate and interface with Interpol's **SLTD (Stolen and Lost Travel Documents)** database and **Red Notices directory**. Styled with a high-contrast, retro-modern Windows XP Luna *"NCB Interpol Command Center Theme"* to manage wanted fugitives, validate suspicious passports, coordinate secure joint agency communications, and compile automated compliance audits in real-time.

---

## 🎨 Visual Paradigm: Windows XP "Command Center"

The interface blends nostalgia with modern law-enforcement telemetry:
* **The "Tactical Command" Theme**: Deep space slate canvases, sharp contrast neon-amber status indicators, high-density telemetry displays, and traditional XP-style window navigation chrome.
* **Pixel-Perfect Windows Classic UI**: Retro window controls, double-borders, navigation bars (File, Edit, View...), and classic taskbars rebuilt cleanly using **Tailwind CSS**.
* **Responsive Drag & Drop Workspace Grid**: Modular windows that can be dynamically dragged and reordered by their title bars to reorganize grid columns, with an instantaneous layout memory reset fallback.
* **Responsive Layout**: Fluid grids to ensure maximum density of operational data on desktop monitors, with scroll-friendly fallback zones on mobile devices.

---

## ⚡ Core Feature Modules

### 🗺️ 1. Interactive Tactical Map
A geographic monitoring grid showing active border checkpoints across the Kingdom of Thailand (e.g., Suvarnabhumi, Phuket, Aranyaprathet). Implements real-time status updates, coordinates, daily checkpoint counters, and custom visual overlays.

### 🛂 2. Biometric Passport Scanner
A high-fidelity hardware scanner simulator that validates biometric passenger RFID MRZ certificates. It parses scanned inputs against active Interpol databases and displays immediate entry approval, manual secondary referral, or instant arrest lockouts.

### 🛡️ 3. Interpol Red Notice Directory
A real-time search interface linked directly to the **Official Interpol Public Database API** (`ws-public.interpol.int`). Features:
* Dynamic query filtering by surname, forename, and nationality.
* Fully loaded offline dossiers for prime targets.
* Custom intelligence advisories and risk profile reports dynamically generated with **Gemini 3.5 Flash**.

### 💬 4. Joint Ops Secure MSN Messenger Chat
A secure, real-time communications terminal simulated in the nostalgic MSN Messenger style. It establishes a secure channel with Officer Somchai, Senior Coordinator at the Joint Interpol Response Division in NCB Bangkok.

### 📈 5. Live Telemetry Log Stream
A real-time ticker showing continuous entry-point passport clearances, flags, and detained statuses, simulating live border flow under the Advance Passenger Processing System (APPS).

### 🧾 6. Thermal Receipt Printer
An authentic thermal receipt printing component designed with classic monospace styling, custom barcode renderings, and micro-aligned summary tables, allowing security officers to "print" official apprehension warrants or boarding clearances.

### 📊 7. Compliance Audit Center
An automated system compliance tool that compiles chronology logs, audits, threat percentages, and biometric statistics. Generates formal government security audit documents under **Immigration Act B.E. 2522** and **Extradition Act B.E. 2551**, complete with MD5 digital verification signatures.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite (configured for HMR-less deployment), Framer Motion, Recharts for biometric analytical graphs.
* **Backend**: Express (Node.js full-stack proxy), serving static builds in production and running Vite dev middleware in development.
* **Styling**: Tailwind CSS with custom theme variables for tactical space colors.
* **AI Integration**: Official `@google/genai` TypeScript SDK executing server-side prompts utilizing `gemini-3.5-flash` with strictly hidden API keys.
* **APIs Connected**: Live Interpol Red Notices API with simulated fallback gateways.

---

## ⚙️ Repository Setup & Installation

### 1. Prerequisites
Make sure you have Node.js (v18 or higher) and npm installed on your machine.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <your-repository-url>
cd <repository-directory>

# Install all dependencies
npm install
```

### 3. Environment Variables Configuration
The application is designed to run seamlessly with a local simulation engine if no API keys are present. To enable live AI intelligence analysis and live chat responses, copy `.env.example` to `.env` and provide your secrets:

```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
# Server secret (never exposed to browser)
GEMINI_API_KEY="AIzaSyYourActualGoogleGeminiKeyHere"

# Self-referential URL of your hosted site
APP_URL="http://localhost:3000"
```

### 4. Running the Development Server
This boots the custom full-stack Express server with integrated Vite HMR middleware on the default port:

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Compiling for Production
We compile both the React client assets and bundle the Express TypeScript server into a self-contained, high-performance CommonJS file inside the `dist/` directory using `esbuild`. This bypasses ESM path restrictions in container runtimes:

```bash
npm run build
```

### 6. Starting the Production Server
```bash
npm run start
```

---

## 📑 Directory Structure

```text
├── .env.example            # Configuration templates for API secrets
├── metadata.json           # Application descriptor and permission configurations
├── server.ts               # Express full-stack entry point & Gemini API proxy routing
├── vite.config.ts          # Vite configuration
├── package.json            # Scripts & project dependencies
├── src/
│   ├── main.tsx            # React application bootstrapper
│   ├── App.tsx             # Main dashboard shell & state manager
│   ├── index.css           # Global Tailwind CSS definitions & retro theme classes
│   └── components/         # Modular XP-style widget components
│       ├── AeroWindow.tsx       # XP Luna Window frame wrapper with menu/address controls
│       ├── PassportScanner.tsx  # Biometric RFID passport parser simulator
│       ├── RedNoticeList.tsx    # Live Interpol API wanted list and intelligence panel
│       ├── LiveFeed.tsx         # Live APPS border clearance logs ticker
│       ├── ImmigrationChat.tsx  # Secure MSN NCB Chat gateway
│       ├── SystemAudit.tsx      # Security compliance compiler and analyzer
│       ├── TacticalMap.tsx      # Geographic checkpoint status coordinator
│       └── ThermalReceipt.tsx   # Custom border arrest warrant printout engine
```

---

## 📜 Regulatory Citations Enforced
* **Kingdom of Thailand Immigration Act B.E. 2522**: Section 12 (Refusal of Entry), Section 38 (TM.30 Address Notification).
* **Thailand Extradition Act B.E. 2551 (2008)**: Standard operating custody procedures for NCB Red Notice targets.

---

*Jointly managed by the Royal Thai Police Immigration Bureau and the Interpol National Central Bureau (NCB) Bangkok.*
